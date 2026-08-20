// Visão Completa de Transações Minimalista - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderTransactionsView(data) {
  const { transactions = [], categories = [], accounts = [], creditCards = [] } = data;

  const catMap = new Map(categories.map(c => [c.id, c]));
  const accMap = new Map(accounts.map(a => [a.id, a]));
  const cardMap = new Map(creditCards.map(c => [c.id, c]));

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Barra Superior de Ações e Filtros Minimalista -->
      <div class="card-minimal p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <!-- Campo de Busca -->
          <div class="relative min-w-[200px] flex-1">
            <i data-lucide="search" class="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5"></i>
            <input type="text" id="txSearchInput" placeholder="Buscar lançamentos..." class="input-fintech pl-8 text-xs py-1.5">
          </div>

          <!-- Filtro por Tipo -->
          <select id="txFilterType" class="input-fintech text-xs w-auto py-1.5">
            <option value="all">Todos os Tipos</option>
            <option value="expense">Apenas Despesas</option>
            <option value="income">Apenas Receitas</option>
            <option value="transfer">Transferências</option>
          </select>

          <!-- Filtro por Categoria -->
          <select id="txFilterCategory" class="input-fintech text-xs w-auto max-w-[150px] py-1.5">
            <option value="all">Todas Categorias</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>

          <!-- Filtro por Período -->
          <select id="txFilterPeriod" class="input-fintech text-xs w-auto py-1.5">
            <option value="this_month">Este Mês</option>
            <option value="last_month">Mês Passado</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="this_year">Este Ano</option>
            <option value="all">Todo Histórico</option>
          </select>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-2">
          <!-- Novo Botão de Importar Extrato Bancário -->
          <button id="btnOpenImportModal" class="btn-secondary text-xs py-1.5 px-3">
            <i data-lucide="file-up" class="w-3.5 h-3.5 text-zinc-300"></i> Importar Extrato
          </button>
          <button id="btnExportCSV" class="btn-secondary text-xs py-1.5 px-3">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> CSV
          </button>
          <button id="btnOpenNewTxModal" class="btn-primary text-xs py-1.5 px-3">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nova Transação
          </button>
        </div>
      </div>

      <!-- Tabela de Transações Minimalista -->
      <div class="card-minimal overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/[0.06] text-zinc-500 font-medium text-[11px]">
                <th class="py-3 px-4">Data</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Categoria</th>
                <th class="py-3 px-4">Conta / Cartão</th>
                <th class="py-3 px-4">Pagamento</th>
                <th class="py-3 px-4 text-right">Valor (R$)</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody id="txTableBody" class="divide-y divide-white/[0.04]">
              ${transactions.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-12 text-center text-zinc-500">
                    <i data-lucide="inbox" class="w-6 h-6 mx-auto mb-2 text-zinc-600"></i>
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ` : transactions.map(tx => {
                const cat = catMap.get(tx.categoryId) || { name: 'Sem Categoria', color: '#71717A' };
                const acc = accMap.get(tx.accountId);
                const card = cardMap.get(tx.creditCardId);
                const sourceName = card ? `💳 ${card.name}` : (acc ? acc.name : 'Geral');

                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return `
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="py-3 px-4 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(tx.date)}</td>
                    <td class="py-3 px-4">
                      <p class="font-medium text-zinc-200">${tx.description}</p>
                      ${tx.isInstallment ? `<span class="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.2 rounded font-mono">${tx.installmentNumber}/${tx.totalInstallments}</span>` : ''}
                      ${tx.establishment ? `<span class="text-[11px] text-zinc-500"> • ${tx.establishment}</span>` : ''}
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.03] text-zinc-300 border border-white/5">
                        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${cat.color || '#A1A1AA'}"></span>
                        ${cat.name}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-zinc-400">${sourceName}</td>
                    <td class="py-3 px-4 text-zinc-500 uppercase text-[10px]">${tx.paymentMethod || 'Pix'}</td>
                    <td class="py-3 px-4 text-right font-mono font-semibold ${isIncome ? 'text-emerald-400' : (isTransfer ? 'text-blue-400' : 'text-zinc-200')}">
                      ${isIncome ? '+' : (isTransfer ? '↔' : '-')} ${FORMATTERS.formatCurrency(tx.amount)}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100">
                        <button class="btn-duplicate-tx p-1 rounded hover:text-white" data-id="${tx.id}" title="Duplicar">
                          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                        </button>
                        <button class="btn-delete-tx p-1 rounded hover:text-red-400" data-id="${tx.id}" title="Excluir">
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
