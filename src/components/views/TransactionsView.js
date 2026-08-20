// Visão Completa de Transações com Edição Rápida e em Lote de Categorias - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderTransactionsView(data) {
  const { transactions = [], categories = [], accounts = [], creditCards = [] } = data;

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
          <button id="btnOpenImportModal" class="btn-secondary text-xs py-1.5 px-3">
            <i data-lucide="file-up" class="w-3.5 h-3.5 text-zinc-300"></i> Importar Extrato (PDF/OFX)
          </button>
          <button id="btnExportCSV" class="btn-secondary text-xs py-1.5 px-3">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> CSV
          </button>
          <button id="btnOpenNewTxModal" class="btn-primary text-xs py-1.5 px-3">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nova Transação
          </button>
        </div>
      </div>

      <!-- Barra de Ações em Lote (Aparece ao selecionar checkboxes) -->
      <div id="bulkActionsBar" class="hidden card-minimal p-3 bg-zinc-950 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span id="bulkSelectedCount" class="font-semibold text-white">0 transações selecionadas</span>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-zinc-400 font-medium">Mudar categoria para:</label>
          <select id="bulkCategorySelect" class="input-fintech text-xs py-1 w-auto">
            ${categories.map(c => `<option value="${c.id}">${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})</option>`).join('')}
          </select>
          <button id="btnApplyBulkCategory" class="btn-primary text-xs py-1 px-3">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Aplicar em Lote
          </button>
          <button id="btnDeleteBulkSelected" class="btn-secondary text-xs py-1 px-2.5 text-red-400 hover:text-red-300">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir
          </button>
        </div>
      </div>

      <!-- Tabela de Transações Minimalista com Seletor Direto de Categoria -->
      <div class="card-minimal overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/[0.06] text-zinc-500 font-medium text-[11px]">
                <th class="py-3 px-3 w-8 text-center">
                  <input type="checkbox" id="checkSelectAllTx" class="rounded bg-zinc-900 border-white/10" title="Selecionar Todas">
                </th>
                <th class="py-3 px-3">Data</th>
                <th class="py-3 px-3">Descrição</th>
                <th class="py-3 px-3 min-w-[160px]">Categoria (Clique para Alterar)</th>
                <th class="py-3 px-3">Conta / Cartão</th>
                <th class="py-3 px-3 text-right">Valor (R$)</th>
                <th class="py-3 px-3 text-center">Ações</th>
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
                const acc = accMap.get(tx.accountId);
                const card = cardMap.get(tx.creditCardId);
                const sourceName = card ? `💳 ${card.name}` : (acc ? acc.name : 'Geral');

                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return `
                  <tr class="hover:bg-white/[0.02] transition-colors group" data-tx-id="${tx.id}">
                    <td class="py-3 px-3 text-center">
                      <input type="checkbox" class="tx-row-check rounded bg-zinc-900 border-white/10" data-id="${tx.id}">
                    </td>
                    <td class="py-3 px-3 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(tx.date)}</td>
                    <td class="py-3 px-3">
                      <p class="font-medium text-zinc-200">${tx.description}</p>
                      ${tx.isInstallment ? `<span class="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.2 rounded font-mono">${tx.installmentNumber}/${tx.totalInstallments}</span>` : ''}
                      ${tx.isShared ? `<span class="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded">Dividido 50%</span>` : ''}
                      ${tx.notes ? `<span class="text-[10px] text-zinc-500 block">${tx.notes}</span>` : ''}
                    </td>

                    <!-- Seletor Rápido de Categoria na Própria Linha -->
                    <td class="py-3 px-3">
                      <select class="change-cat-select input-fintech text-[11px] py-1 px-2 border-white/10 hover:border-white/30 cursor-pointer" data-id="${tx.id}" title="Alterar Categoria Deste Gasto">
                        ${categories.map(c => `
                          <option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>
                            ${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})
                          </option>
                        `).join('')}
                      </select>
                    </td>

                    <td class="py-3 px-3 text-zinc-400">${sourceName}</td>
                    <td class="py-3 px-3 text-right font-mono font-semibold ${isIncome ? 'text-emerald-400' : (isTransfer ? 'text-blue-400' : 'text-zinc-200')}">
                      ${isIncome ? '+' : (isTransfer ? '↔' : '-')} ${FORMATTERS.formatCurrency(tx.amount)}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100">
                        <button class="btn-edit-tx p-1 rounded hover:text-white" data-id="${tx.id}" title="Editar Detalhes">
                          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                        </button>
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
