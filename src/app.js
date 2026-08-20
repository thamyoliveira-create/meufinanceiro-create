// Controlador Principal da Aplicação - Meu Financeiro IA

import { auth } from './db/auth.js';
import { db } from './db/database.js';
import { loadDemoDataset } from './db/demoData.js';
import { FORMATTERS } from './config/constants.js';
import { FinanceEngine } from './services/financeEngine.js';
import { AIService } from './services/aiService.js';
import { ExportService } from './services/exportService.js';
import { NotificationService } from './services/notificationService.js';
import { StatementParser } from './services/statementParser.js';

// Componentes
import { renderSidebar, MENU_ITEMS } from './components/Sidebar.js';
import { renderNavbar } from './components/Navbar.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderQuickAddModal } from './components/QuickAddModal.js';
import { renderOnboardingModal } from './components/OnboardingModal.js';
import { renderAiChatFloating } from './components/AiChatFloating.js';
import { renderImportStatementModal } from './components/ImportStatementModal.js';

// Visões
import { renderAuthView } from './components/views/AuthView.js';
import { renderDashboardView } from './components/views/DashboardView.js';
import { renderTransactionsView } from './components/views/TransactionsView.js';
import { renderAccountsView } from './components/views/AccountsView.js';
import { renderCardsView } from './components/views/CardsView.js';
import { renderBillsView } from './components/views/BillsView.js';
import { renderBudgetView } from './components/views/BudgetView.js';
import { renderGoalsView } from './components/views/GoalsView.js';
import { renderDebtsView } from './components/views/DebtsView.js';
import { renderInvestmentsView } from './components/views/InvestmentsView.js';
import { renderNetWorthView } from './components/views/NetWorthView.js';
import { renderCalendarView } from './components/views/CalendarView.js';
import { renderReportsView } from './components/views/ReportsView.js';
import { renderSubscriptionsView } from './components/views/SubscriptionsView.js';
import { renderCanIBuyItView } from './components/views/CanIBuyItView.js';
import { renderAiAssistantView } from './components/views/AiAssistantView.js';
import { renderSettingsView } from './components/views/SettingsView.js';

class App {
  constructor() {
    this.currentRoute = 'dashboard';
    this.user = null;
    this.theme = localStorage.getItem('meu_financeiro_theme') || 'dark';
    this.charts = {};
    this.pendingImportTransactions = [];
  }

  async init() {
    this.applyTheme(this.theme);
    await db.init();
    this.user = await auth.init();

    if (!this.user) {
      this.renderAuth();
    } else {
      await db.initDefaultCategories(this.user.id);
      await this.renderApp();

      // Checa se precisa exibir o onboarding inicial
      if (!this.user.onboardingCompleted) {
        const onboardingEl = document.getElementById('onboardingModal');
        if (onboardingEl) onboardingEl.classList.remove('hidden');
      }
    }
  }

  // Alternar Tema
  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('meu_financeiro_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Notificações Toast
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : 'bg-zinc-800 border border-white/10')
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // ==========================================
  // RENDERIZAÇÃO DA TELA DE LOGIN / CADASTRO
  // ==========================================
  renderAuth(mode = 'login') {
    const root = document.getElementById('app');
    root.innerHTML = renderAuthView(mode);
    this.refreshIcons();

    // Eventos de troca de aba
    document.getElementById('btnTabLogin')?.addEventListener('click', () => this.renderAuth('login'));
    document.getElementById('btnTabSignup')?.addEventListener('click', () => this.renderAuth('signup'));
    
    // Esqueci a senha
    document.getElementById('btnForgotPassword')?.addEventListener('click', () => {
      document.getElementById('authLoginForm')?.classList.add('hidden');
      document.getElementById('authResetForm')?.classList.remove('hidden');
    });

    document.getElementById('btnCancelReset')?.addEventListener('click', () => {
      document.getElementById('authResetForm')?.classList.add('hidden');
      document.getElementById('authLoginForm')?.classList.remove('hidden');
    });

    // Submissão Login
    document.getElementById('authLoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        this.user = await auth.login(email, pass);
        this.showToast('Login realizado com sucesso!');
        await this.init();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    // Submissão Cadastro
    document.getElementById('authSignupForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const pass = document.getElementById('signupPassword').value;
        this.user = await auth.signup(name, email, pass);
        this.showToast('Conta criada com sucesso! Bem-vindo(a).');
        await this.init();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    // Submissão Reset de Senha
    document.getElementById('authResetForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('resetEmail').value;
        const newPass = document.getElementById('resetNewPassword').value;
        await auth.resetPassword(email, newPass);
        this.showToast('Senha alterada com sucesso! Faça login.');
        this.renderAuth('login');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });
  }

  // ==========================================
  // RENDERIZAÇÃO DA APLICAÇÃO PRINCIPAL
  // ==========================================
  async renderApp() {
    const userId = this.user.id;

    // 1. Carrega dados do banco do usuário
    const [accounts, categories, transactions, creditCards, bills, receivables, budgets, goals, debts, investments, assets, liabilities, subscriptions, notifications] = await Promise.all([
      db.getAll('accounts', userId),
      db.getAll('categories', userId),
      db.getAll('transactions', userId),
      db.getAll('credit_cards', userId),
      db.getAll('bills', userId),
      db.getAll('income_receivables', userId),
      db.getAll('budgets', userId),
      db.getAll('goals', userId),
      db.getAll('debts', userId),
      db.getAll('investments', userId),
      db.getAll('assets', userId),
      db.getAll('liabilities', userId),
      db.getAll('subscriptions', userId),
      db.getAll('notifications', userId),
    ]);

    NotificationService.checkAndGenerateNotifications(db, userId);

    // 2. Cálculos Financeiros
    const metrics = await FinanceEngine.calculateDashboardMetrics(db, userId);
    const categoryBreakdown = FinanceEngine.calculateCategoryBreakdown(transactions.filter(t => t.date && t.date.startsWith(metrics.monthKey)), categories);
    const anomalies = AIService.detectAnomalies(transactions, categories);
    const insights = AIService.generateMonthlyInsights(metrics, categoryBreakdown, subscriptions, transactions, budgets);

    const isDemoActive = transactions.some(t => t.isDemo) || accounts.some(a => a.isDemo);

    const viewData = {
      user: this.user,
      metrics,
      categoryBreakdown,
      anomalies,
      insights,
      accounts,
      categories,
      transactions,
      creditCards,
      bills,
      receivables,
      budgets,
      goals,
      debts,
      investments,
      assets,
      liabilities,
      subscriptions,
      notifications,
      recentTransactions: transactions.slice(0, 10),
    };

    // 3. Renderiza Estrutura da Interface Minimalista
    const currentMenuItem = MENU_ITEMS.find(m => m.id === this.currentRoute) || MENU_ITEMS[0];
    const root = document.getElementById('app');

    root.innerHTML = `
      <div class="min-h-screen bg-[#08090C] flex">
        <!-- Sidebar Desktop -->
        ${renderSidebar(this.currentRoute)}

        <!-- Área Principal de Conteúdo -->
        <div class="flex-1 lg:ml-60 flex flex-col min-h-screen">
          <!-- Navbar -->
          ${renderNavbar(currentMenuItem.label, this.user, notifications, isDemoActive)}

          <!-- Conteúdo da Rota Ativa -->
          <main class="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
            <div id="mainViewContainer">
              ${this.getViewHtml(this.currentRoute, viewData)}
            </div>
          </main>
        </div>

        <!-- Navegação Mobile Inferior -->
        ${renderMobileNav(this.currentRoute)}

        <!-- Modal de Cadastro Rápido com IA -->
        ${renderQuickAddModal(categories, accounts, creditCards)}

        <!-- Modal de Importação de Extrato Bancário -->
        ${renderImportStatementModal(accounts, categories)}

        <!-- Modal de Onboarding -->
        ${renderOnboardingModal()}

        <!-- Assistente IA Flutuante -->
        ${renderAiChatFloating()}
      </div>
    `;

    this.refreshIcons();
    this.attachEventListeners(viewData);

    if (this.currentRoute === 'dashboard') {
      this.initDashboardCharts(categoryBreakdown, transactions, metrics.monthKey);
    }
  }

  getViewHtml(route, data) {
    switch (route) {
      case 'dashboard': return renderDashboardView(data);
      case 'transactions': return renderTransactionsView(data);
      case 'accounts': return renderAccountsView(data);
      case 'cards': return renderCardsView(data);
      case 'bills': return renderBillsView(data);
      case 'budget': return renderBudgetView(data);
      case 'goals': return renderGoalsView(data);
      case 'debts': return renderDebtsView(data);
      case 'investments': return renderInvestmentsView(data);
      case 'networth': return renderNetWorthView(data);
      case 'calendar': return renderCalendarView(data);
      case 'reports': return renderReportsView(data);
      case 'subscriptions': return renderSubscriptionsView(data);
      case 'canibuy': return renderCanIBuyItView(data);
      case 'ai_assistant': return renderAiAssistantView(data);
      case 'settings': return renderSettingsView(data);
      default: return renderDashboardView(data);
    }
  }

  // ==========================================
  // GRÁFICOS CHART.JS MINIMALISTAS
  // ==========================================
  initDashboardCharts(categoryBreakdown, transactions, currentMonthKey) {
    Object.values(this.charts).forEach(c => { if (c && c.destroy) c.destroy(); });
    this.charts = {};

    // 1. Doughnut de Categorias Minimalista
    const ctxCategory = document.getElementById('chartCategoryDoughnut');
    if (ctxCategory && categoryBreakdown.list.length > 0) {
      this.charts.category = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: categoryBreakdown.list.map(c => c.name),
          datasets: [{
            data: categoryBreakdown.list.map(c => c.amount),
            backgroundColor: categoryBreakdown.list.map(c => c.color || '#A1A1AA'),
            borderWidth: 0,
            hoverOffset: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.label}: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          cutout: '76%',
        }
      });
    }

    // 2. Histórico de 6 Meses Receitas x Despesas
    const ctxHistory = document.getElementById('chartCashflowHistory');
    if (ctxHistory) {
      const historyData = FinanceEngine.calculateMonthlyCashflow(transactions, 6);
      this.charts.history = new Chart(ctxHistory, {
        type: 'bar',
        data: {
          labels: historyData.map(h => h.label),
          datasets: [
            {
              label: 'Receitas',
              data: historyData.map(h => h.income),
              backgroundColor: '#10B981',
              borderRadius: 4,
              barPercentage: 0.6,
            },
            {
              label: 'Despesas',
              data: historyData.map(h => h.expense),
              backgroundColor: '#3F3F46',
              borderRadius: 4,
              barPercentage: 0.6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#71717A', boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.dataset.label}: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#71717A', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717A', font: { size: 10 } } }
          }
        }
      });
    }
  }

  // ==========================================
  // EVENT LISTENERS E INTERAÇÕES
  // ==========================================
  attachEventListeners(viewData) {
    const userId = this.user.id;

    // Navegação de Rotas
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        if (route) {
          this.currentRoute = route;
          this.renderApp();
        }
      });
    });

    // Toggle Dropdowns
    const btnNotifs = document.getElementById('btnNotifications');
    const notifsDropdown = document.getElementById('notificationsDropdown');
    btnNotifs?.addEventListener('click', () => notifsDropdown?.classList.toggle('hidden'));

    const btnProfile = document.getElementById('btnUserProfile');
    const userDropdown = document.getElementById('userDropdown');
    btnProfile?.addEventListener('click', () => userDropdown?.classList.toggle('hidden'));

    document.addEventListener('click', (e) => {
      if (!btnNotifs?.contains(e.target) && !notifsDropdown?.contains(e.target)) {
        notifsDropdown?.classList.add('hidden');
      }
      if (!btnProfile?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.add('hidden');
      }
    });

    // Alternar Tema
    document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
      const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
      this.showToast(`Tema alterado para ${nextTheme === 'dark' ? 'Escuro' : 'Claro'}`);
    });

    // Logout
    document.getElementById('btnLogout')?.addEventListener('click', () => {
      auth.logout();
      this.user = null;
      this.showToast('Você saiu da sua conta.');
      this.renderAuth();
    });

    // ==========================================
    // MODAL DE CADASTRO RÁPIDO COM IA
    // ==========================================
    const modalQuickAdd = document.getElementById('quickAddModal');
    const openQuickAdd = () => {
      if (modalQuickAdd) {
        modalQuickAdd.classList.remove('hidden');
        document.getElementById('txDate').value = FORMATTERS.toIsoDate();
      }
    };

    document.getElementById('btnQuickAddExpense')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnQuickAddHero')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnMobileAddCenter')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnOpenNewTxModal')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnCloseQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));
    document.getElementById('btnCancelQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));

    // Parser de Linguagem Natural
    document.getElementById('btnParseNL')?.addEventListener('click', () => {
      const text = document.getElementById('nlInputText').value;
      if (!text) return;

      const parsed = AIService.parseNaturalLanguageExpense(text, viewData.categories);
      if (parsed) {
        document.getElementById('txDescription').value = parsed.description;
        if (parsed.amount > 0) document.getElementById('txAmount').value = parsed.amount;
        if (parsed.date) document.getElementById('txDate').value = parsed.date;
        if (parsed.categoryId) document.getElementById('txCategory').value = parsed.categoryId;
        if (parsed.paymentMethod) document.getElementById('txPaymentMethod').value = parsed.paymentMethod;

        if (parsed.installments > 1) {
          document.getElementById('installmentRow')?.classList.remove('hidden');
          document.getElementById('txInstallments').value = String(parsed.installments);
        }

        this.showToast('Dados identificados com sucesso!', 'info');
      }
    });

    // Submissão do Quick Add Form
    document.getElementById('quickAddForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const type = document.querySelector('input[name="txType"]:checked').value;
        const description = document.getElementById('txDescription').value;
        const amount = parseFloat(document.getElementById('txAmount').value);
        const categoryId = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value;
        const accountId = document.getElementById('txAccount').value;
        const paymentMethod = document.getElementById('txPaymentMethod').value;
        const creditCardId = paymentMethod === 'credit' ? document.getElementById('txCreditCard')?.value : null;
        const totalInstallments = paymentMethod === 'credit' ? parseInt(document.getElementById('txInstallments')?.value || '1', 10) : 1;

        const newTx = {
          userId,
          type,
          description,
          amount,
          categoryId,
          date,
          accountId,
          paymentMethod,
          creditCardId,
          isPaid: true,
          isInstallment: totalInstallments > 1,
          totalInstallments,
        };

        await db.saveTransaction(newTx, userId);
        this.showToast('Lançamento registrado com sucesso!');
        modalQuickAdd.classList.add('hidden');
        document.getElementById('quickAddForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro: ' + err.message, 'error');
      }
    });

    // ==========================================
    // MODAL DE IMPORTAÇÃO DE EXTRATOS BANCÁRIOS
    // ==========================================
    const modalImport = document.getElementById('importStatementModal');
    const openImportModal = () => {
      if (modalImport) {
        modalImport.classList.remove('hidden');
        this.pendingImportTransactions = [];
        document.getElementById('recognizedTransactionsArea')?.classList.add('hidden');
        document.getElementById('btnConfirmImport')?.setAttribute('disabled', 'true');
        document.getElementById('btnConfirmImport')?.classList.add('opacity-50', 'cursor-not-allowed');
      }
    };

    document.getElementById('btnOpenImportModal')?.addEventListener('click', openImportModal);
    document.getElementById('btnCloseImportModal')?.addEventListener('click', () => modalImport?.classList.add('hidden'));
    document.getElementById('btnCancelImport')?.addEventListener('click', () => modalImport?.classList.add('hidden'));

    // Abas do Modal de Importação
    const tabUpload = document.getElementById('tabUploadFile');
    const tabPaste = document.getElementById('tabPasteText');
    const dropzone = document.getElementById('dropzoneArea');
    const pasteArea = document.getElementById('pasteTextArea');

    tabUpload?.addEventListener('click', () => {
      tabUpload.classList.add('bg-white/10', 'text-white');
      tabPaste.classList.remove('bg-white/10', 'text-white');
      tabPaste.classList.add('text-zinc-400');
      dropzone?.classList.remove('hidden');
      pasteArea?.classList.add('hidden');
    });

    tabPaste?.addEventListener('click', () => {
      tabPaste.classList.add('bg-white/10', 'text-white');
      tabUpload.classList.remove('bg-white/10', 'text-white');
      tabUpload.classList.add('text-zinc-400');
      pasteArea?.classList.remove('hidden');
      dropzone?.classList.add('hidden');
    });

    // Drag & Drop e Seleção de Arquivo
    const fileInput = document.getElementById('statementFileInput');
    dropzone?.addEventListener('click', () => fileInput?.click());

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-white/40');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-white/40');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-white/40');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.processStatementFile(e.dataTransfer.files[0], viewData);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.processStatementFile(e.target.files[0], viewData);
      }
    });

    // Processar Texto Colado
    document.getElementById('btnProcessPastedText')?.addEventListener('click', () => {
      const rawText = document.getElementById('statementRawText').value;
      if (!rawText.trim()) return;

      const targetAccount = document.getElementById('importTargetAccount').value;
      const parsed = StatementParser.parseCSVOrText(rawText, targetAccount, viewData.categories, viewData.transactions);
      this.displayRecognizedTransactions(parsed, viewData);
    });

    // Confirmar e Salvar Transações Importadas
    document.getElementById('btnConfirmImport')?.addEventListener('click', async () => {
      const selected = this.pendingImportTransactions.filter(t => t.selected);
      if (selected.length === 0) {
        this.showToast('Nenhuma transação selecionada.', 'error');
        return;
      }

      const targetAccount = document.getElementById('importTargetAccount').value;

      for (const item of selected) {
        const newTx = {
          userId,
          accountId: targetAccount,
          categoryId: item.categoryId,
          type: item.type,
          description: item.description,
          amount: Number(item.amount),
          date: item.date,
          paymentMethod: item.paymentMethod || 'pix',
          isPaid: true,
          notes: 'Importado de extrato bancário',
        };
        await db.saveTransaction(newTx, userId);
      }

      this.showToast(`${selected.length} transações importadas com sucesso!`);
      modalImport?.classList.add('hidden');
      await this.renderApp();
    });

    // Marcar / Desmarcar Todos
    document.getElementById('btnToggleSelectAll')?.addEventListener('click', () => {
      const allSelected = this.pendingImportTransactions.every(t => t.selected);
      this.pendingImportTransactions.forEach(t => t.selected = !allSelected);
      this.renderRecognizedRows(viewData.categories);
    });

    // Outros listeners gerais
    document.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Excluir esta transação?')) {
          await db.deleteTransaction(id, userId);
          this.showToast('Transação excluída.');
          await this.renderApp();
        }
      });
    });

    document.querySelectorAll('.btn-duplicate-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const tx = await db.getById('transactions', id);
        if (tx) {
          const dup = { ...tx, id: null, description: `${tx.description} (Cópia)` };
          await db.saveTransaction(dup, userId);
          this.showToast('Transação duplicada.');
          await this.renderApp();
        }
      });
    });

    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      ExportService.exportTransactionsToCSV(viewData.transactions, viewData.categories, viewData.accounts);
      this.showToast('CSV exportado!');
    });

    document.getElementById('btnLoadDemoData')?.addEventListener('click', async () => {
      if (confirm('Carregar dados de demonstração em BRL?')) {
        await loadDemoDataset(db, userId);
        this.showToast('Dados de demonstração carregados.');
        await this.renderApp();
      }
    });

    document.getElementById('btnWipeDemoData')?.addEventListener('click', async () => {
      if (confirm('Remover dados fictícios de demonstração?')) {
        await db.wipeDemoData(userId);
        this.showToast('Dados de demonstração removidos.');
        await this.renderApp();
      }
    });
  }

  // Helper para ler arquivo de extrato
  processStatementFile(file, viewData) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const targetAccount = document.getElementById('importTargetAccount').value;
      const parsed = StatementParser.parseStatement(content, file.name, targetAccount, viewData.categories, viewData.transactions);
      this.displayRecognizedTransactions(parsed, viewData);
    };
    reader.readAsText(file);
  }

  displayRecognizedTransactions(transactions, viewData) {
    this.pendingImportTransactions = transactions;
    const tableArea = document.getElementById('recognizedTransactionsArea');
    const badge = document.getElementById('recognizedCountBadge');
    const confirmBtn = document.getElementById('btnConfirmImport');

    if (transactions.length === 0) {
      this.showToast('Nenhuma transação válida identificada no arquivo.', 'error');
      return;
    }

    tableArea?.classList.remove('hidden');
    if (badge) badge.textContent = String(transactions.length);

    if (confirmBtn) {
      confirmBtn.removeAttribute('disabled');
      confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    this.renderRecognizedRows(viewData.categories);
    this.refreshIcons();
  }

  renderRecognizedRows(categories) {
    const tbody = document.getElementById('recognizedTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.pendingImportTransactions.map((tx, idx) => `
      <tr class="hover:bg-white/[0.02] text-xs">
        <td class="p-2 text-center">
          <input type="checkbox" class="stmt-check" data-index="${idx}" ${tx.selected ? 'checked' : ''}>
        </td>
        <td class="p-2 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(tx.date)}</td>
        <td class="p-2">
          <input type="text" value="${tx.description}" class="input-fintech text-xs py-1 px-1.5 stmt-desc" data-index="${idx}">
          ${tx.isDuplicate ? '<span class="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20 font-semibold">Possível Duplicata</span>' : ''}
        </td>
        <td class="p-2">
          <select class="input-fintech text-[11px] py-1 px-1.5 stmt-cat" data-index="${idx}">
            ${categories.filter(c => c.type === tx.type).map(c => `
              <option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </td>
        <td class="p-2 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}">
          ${tx.type === 'income' ? '+' : '-'} ${FORMATTERS.formatCurrency(tx.amount)}
        </td>
      </tr>
    `).join('');

    // Listeners nos checkboxes da tabela
    tbody.querySelectorAll('.stmt-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].selected = e.target.checked;
        this.updateImportSummary();
      });
    });

    tbody.querySelectorAll('.stmt-desc').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].description = e.target.value;
      });
    });

    tbody.querySelectorAll('.stmt-cat').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].categoryId = e.target.value;
      });
    });

    this.updateImportSummary();
  }

  updateImportSummary() {
    const selected = this.pendingImportTransactions.filter(t => t.selected);
    const totalAmount = selected.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
    const summaryText = document.getElementById('importSummaryText');
    if (summaryText) {
      summaryText.textContent = `${selected.length} de ${this.pendingImportTransactions.length} lançamentos selecionados (Impacto: ${FORMATTERS.formatCurrency(totalAmount)})`;
    }
  }

  refreshIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => app.init());
