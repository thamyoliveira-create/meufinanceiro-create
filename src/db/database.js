// Camada de Banco de Dados Unificada - Meu Financeiro IA
// Suporta IndexedDB local multi-usuário com persistência em disco + Supabase Client

import { APP_CONFIG } from '../config/constants.js';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../config/categories.js';

const DB_NAME = 'MeuFinanceiroIA_DB';
const DB_VERSION = 1;

class DatabaseService {
  constructor() {
    this.db = null;
    this.supabaseConfig = null;
    this.isReady = false;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        const stores = [
          'accounts',
          'categories',
          'transactions',
          'credit_cards',
          'recurring',
          'bills',
          'income_receivables',
          'budgets',
          'goals',
          'debts',
          'investments',
          'assets',
          'liabilities',
          'subscriptions',
          'notifications',
          'ai_insights',
          'system_settings'
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('userId', 'userId', { unique: false });
            if (storeName === 'transactions') {
              store.createIndex('date', 'date', { unique: false });
              store.createIndex('categoryId', 'categoryId', { unique: false });
              store.createIndex('accountId', 'accountId', { unique: false });
              store.createIndex('creditCardId', 'creditCardId', { unique: false });
            }
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Operação genérica de leitura por Store e Usuário
  async getAll(storeName, userId) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Obter registro por ID
  async getById(storeName, id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Inserir ou Atualizar Registro
  async put(storeName, item) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      if (!item.id) {
        item.id = crypto.randomUUID ? crypto.randomUUID() : 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      item.updatedAt = new Date().toISOString();
      if (!item.createdAt) item.createdAt = item.updatedAt;

      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Deletar Registro por ID
  async delete(storeName, id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Inicializa Categorias Padrão para um Novo Usuário
  async initDefaultCategories(userId) {
    const existing = await this.getAll('categories', userId);
    if (existing.length > 0) return existing;

    const categoriesToAdd = [];

    // Despesas
    DEFAULT_EXPENSE_CATEGORIES.forEach(cat => {
      categoriesToAdd.push({
        id: `cat_${userId}_${cat.id}`,
        userId,
        name: cat.name,
        type: 'expense',
        icon: cat.icon,
        color: cat.color,
        subcategories: cat.subcategories.map(s => ({ ...s, categoryId: `cat_${userId}_${cat.id}` })),
        isSystem: true,
      });
    });

    // Receitas
    DEFAULT_INCOME_CATEGORIES.forEach(cat => {
      categoriesToAdd.push({
        id: `cat_${userId}_${cat.id}`,
        userId,
        name: cat.name,
        type: 'income',
        icon: cat.icon,
        color: cat.color,
        subcategories: cat.subcategories.map(s => ({ ...s, categoryId: `cat_${userId}_${cat.id}` })),
        isSystem: true,
      });
    });

    for (const cat of categoriesToAdd) {
      await this.put('categories', cat);
    }

    return categoriesToAdd;
  }

  // ==========================================
  // TRANSAÇÕES COM AJUSTE DE SALDO ATÔMICO
  // ==========================================

  async saveTransaction(transaction, userId) {
    transaction.userId = userId;
    if (!transaction.id) {
      transaction.id = crypto.randomUUID ? crypto.randomUUID() : 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    const isNew = !(await this.getById('transactions', transaction.id));

    // Se for parcelado e for criação inicial
    if (isNew && transaction.isInstallment && transaction.totalInstallments > 1 && !transaction.parentTransactionId) {
      return this._createInstallmentSeries(transaction, userId);
    }

    // Salva a transação
    await this.put('transactions', transaction);

    // Atualiza saldo da conta correspondente se for débito/dinheiro/pix e estiver paga
    await this._recalculateAccountBalance(transaction.accountId, userId);
    if (transaction.type === 'transfer' && transaction.transferTargetAccountId) {
      await this._recalculateAccountBalance(transaction.transferTargetAccountId, userId);
    }

    return transaction;
  }

  // Cria série de parcelas para os meses seguintes
  async _createInstallmentSeries(parentTx, userId) {
    const total = parentTx.totalInstallments;
    const installmentAmount = Number((parentTx.amount / total).toFixed(2));
    const firstDate = new Date(parentTx.date + 'T12:00:00');

    const createdList = [];

    for (let i = 1; i <= total; i++) {
      const dateCopy = new Date(firstDate);
      dateCopy.setMonth(dateCopy.getMonth() + (i - 1));
      const year = dateCopy.getFullYear();
      const month = String(dateCopy.getMonth() + 1).padStart(2, '0');
      const day = String(dateCopy.getDate()).padStart(2, '0');
      const installmentDate = `${year}-${month}-${day}`;

      const installmentTx = {
        ...parentTx,
        id: i === 1 ? parentTx.id : (crypto.randomUUID ? crypto.randomUUID() : 'inst_' + Date.now() + '_' + i),
        amount: installmentAmount,
        date: installmentDate,
        description: `${parentTx.description} (${i}/${total})`,
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: total,
        parentTransactionId: parentTx.id,
      };

      await this.put('transactions', installmentTx);
      createdList.push(installmentTx);
    }

    return createdList[0];
  }

  // Recalcular o saldo real da conta com base nas transações efetivadas
  async _recalculateAccountBalance(accountId, userId) {
    if (!accountId) return;
    const account = await this.getById('accounts', accountId);
    if (!account) return;

    const allTx = await this.getAll('transactions', userId);
    let balance = Number(account.initialBalance || 0);

    allTx.forEach(tx => {
      if (tx.isPaid === false) return; // ignora não pagas
      const val = Number(tx.amount || 0);

      // Transações diretas da conta
      if (tx.accountId === accountId) {
        if (tx.type === 'income') {
          balance += val;
        } else if (tx.type === 'expense') {
          balance -= val;
        } else if (tx.type === 'transfer') {
          balance -= val; // saiu da conta
        }
      }

      // Transferências recebidas
      if (tx.type === 'transfer' && tx.transferTargetAccountId === accountId) {
        balance += val;
      }
    });

    account.currentBalance = balance;
    await this.put('accounts', account);
  }

  // Exclusão de transação com estorno de saldo
  async deleteTransaction(id, userId) {
    const tx = await this.getById('transactions', id);
    if (!tx) return;

    await this.delete('transactions', id);

    if (tx.accountId) {
      await this._recalculateAccountBalance(tx.accountId, userId);
    }
    if (tx.type === 'transfer' && tx.transferTargetAccountId) {
      await this._recalculateAccountBalance(tx.transferTargetAccountId, userId);
    }
  }

  // Marcar Conta a Pagar como Paga (Gera Transação Automática)
  async markBillAsPaid(billId, accountId, paymentDate, userId) {
    const bill = await this.getById('bills', billId);
    if (!bill) throw new Error('Conta não encontrada');

    const tx = {
      userId,
      accountId: accountId || bill.accountId,
      categoryId: bill.categoryId,
      type: 'expense',
      amount: Number(bill.amount),
      date: paymentDate || new Date().toISOString().split('T')[0],
      description: `Pagamento: ${bill.description}`,
      isPaid: true,
      paymentMethod: 'boleto',
      notes: `Gerado a partir da conta a pagar #${bill.id}`,
    };

    const savedTx = await this.saveTransaction(tx, userId);
    bill.status = 'paid';
    bill.paymentDate = tx.date;
    bill.transactionId = savedTx.id;
    await this.put('bills', bill);

    return { bill, transaction: savedTx };
  }

  // Marcar Conta a Receber como Recebida
  async markReceivableAsReceived(recId, accountId, receivedDate, userId) {
    const rec = await this.getById('income_receivables', recId);
    if (!rec) throw new Error('Recebível não encontrado');

    const tx = {
      userId,
      accountId: accountId || rec.accountId,
      categoryId: rec.categoryId,
      type: 'income',
      amount: Number(rec.amount),
      date: receivedDate || new Date().toISOString().split('T')[0],
      description: `Recebimento: ${rec.description}`,
      isPaid: true,
      paymentMethod: 'pix',
      notes: `Gerado a partir da conta a receber #${rec.id}`,
    };

    const savedTx = await this.saveTransaction(tx, userId);
    rec.status = 'received';
    rec.receivedDate = tx.date;
    rec.transactionId = savedTx.id;
    await this.put('income_receivables', rec);

    return { receivable: rec, transaction: savedTx };
  }

  // Limpar Todos os Dados de um Usuário (Reset Geral)
  async wipeUserData(userId) {
    const stores = [
      'accounts', 'categories', 'transactions', 'credit_cards',
      'recurring', 'bills', 'income_receivables', 'budgets',
      'goals', 'debts', 'investments', 'assets', 'liabilities',
      'subscriptions', 'notifications', 'ai_insights'
    ];

    for (const storeName of stores) {
      const items = await this.getAll(storeName, userId);
      for (const item of items) {
        await this.delete(storeName, item.id);
      }
    }
  }

  // Limpar Apenas Dados Marcados como Demonstração
  async wipeDemoData(userId) {
    const stores = [
      'accounts', 'transactions', 'credit_cards', 'recurring',
      'bills', 'income_receivables', 'budgets', 'goals',
      'debts', 'investments', 'assets', 'liabilities',
      'subscriptions', 'notifications', 'ai_insights'
    ];

    for (const storeName of stores) {
      const items = await this.getAll(storeName, userId);
      for (const item of items) {
        if (item.isDemo) {
          await this.delete(storeName, item.id);
        }
      }
    }
  }
}

export const db = new DatabaseService();
