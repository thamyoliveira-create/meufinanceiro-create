// Visão Completa de Transações - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderTransactionsView(data) {
  const { transactions = [], categories = [], accounts = [], creditCards = [] } = data;

  const catMap = new Map(categories.map(c => [c.id, c]));
  const accMap = new Map(accounts.map(a => [a.id, a]));
  const cardMap = new Map(creditCards.map(c => [c.id, c]));

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Barra Superior de Ações e Filtros -->
      <div class="card-fintech p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <!-- Campo de Busca -->
          <div class="relative min-w-[220px] flex-1">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
            <input type="text" id="txSearchInput" placeholder="Buscar por descrição, estabelecimento..." class="input-fintech pl-9 text-xs">
          </div>

          <!-- Filtro por Tipo -->
          <select id="txFilterType" class="input-fintech text-xs w-auto">
            <option value="all">Todos os Tipos</option>
            <option value="expense">Apenas Despesas</option>
            <option value="income">Apenas Receitas</option>
            <option value="transfer">Transferências</option>
          </select>

          <!-- Filtro por Categoria -->
          <select id="txFilterCategory" class="input-fintech text-xs w-auto max-w-[160px]">
            <option value="all">Todas as Categorias</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>

          <!-- Filtro por Período -->
          <select id="txFilterPeriod" class="input-fintech text-xs w-auto">
            <option value="this_month">Este Mês</option>
            <option value="last_month">Mês Passado</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="this_year">Este Ano</option>
            <option value="all">Todo o Histórico</option>
          </select>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-2">
          <button id="btnExportCSV" class="btn-secondary text-xs py-2 px-3">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Exportar CSV
          </button>
          <button id="btnOpenNewTxModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nova Transação
          </button>
        </div>
      </div>

      <!-- Tabela de Transações -->
      <div class="card-fintech overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3.5 px-4">Data</th>
                <th class="py-3.5 px-4">Descrição</th>
                <th class="py-3.5 px-4">Categoria</th>
                <th class="py-3.5 px-4">Conta / Cartão</th>
                <th class="py-3.5 px-4">Pagamento</th>
                <th class="py-3.5 px-4 text-right">Valor (R$)</th>
                <th class="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody id="txTableBody" class="divide-y divide-slate-800/60">
              ${transactions.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ` : transactions.map(tx => {
                const cat = catMap.get(tx.categoryId) || { name: 'Sem Categoria', color: '#6B7280', icon: 'tag' };
                const acc = accMap.get(tx.accountId);
                const card = cardMap.get(tx.creditCardId);
                const sourceName = card ? `💳 ${card.name}` : (acc ? acc.name : 'Conta Geral');

                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors group">
                    <td class="py-3 px-4 font-mono text-slate-400">${FORMATTERS.formatDate(tx.date)}</td>
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-200">${tx.description}</p>
                      ${tx.isInstallment ? `<span class="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono">Parcela ${tx.installmentNumber}/${tx.totalInstallments}</span>` : ''}
                      ${tx.establishment ? `<span class="text-[11px] text-slate-400"> • ${tx.establishment}</span>` : ''}
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium" style="background-color: ${cat.color}15; color: ${cat.color}">
                        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${cat.color}"></span>
                        ${cat.name}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-slate-300">${sourceName}</td>
                    <td class="py-3 px-4 text-slate-400 uppercase text-[10px]">${tx.paymentMethod || 'Pix'}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${isIncome ? 'text-emerald-400' : (isTransfer ? 'text-blue-400' : 'text-slate-200')}">
                      ${isIncome ? '+' : (isTransfer ? '↔' : '-')} ${FORMATTERS.formatCurrency(tx.amount)}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100">
                        <button class="btn-duplicate-tx p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800" data-id="${tx.id}" title="Duplicar">
                          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        </button>
                        <button class="btn-delete-tx p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800" data-id="${tx.id}" title="Excluir">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
