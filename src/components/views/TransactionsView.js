// Visão de Transações Windows 98 com Alto Contraste e Legibilidade - Meu Financeiro 98

import { FORMATTERS } from '../../config/constants.js';

export function renderTransactionsView(data) {
  const { transactions = [], categories = [], accounts = [], creditCards = [] } = data;

  const accMap = new Map(accounts.map(a => [a.id, a]));
  const cardMap = new Map(creditCards.map(c => [c.id, c]));

  return `
    <div class="space-y-4 animate-fade-in pb-8 text-black">
      <!-- Barra Superior de Filtros e Busca (Toolbar 98) -->
      <div class="win-outset p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-black">
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <!-- Campo de Busca -->
          <div class="flex items-center gap-1 min-w-[200px] flex-1">
            <span class="font-bold text-xs">🔍</span>
            <input type="text" id="txSearchInput" placeholder="Filtrar lançamentos..." class="input-fintech text-xs py-1">
          </div>

          <!-- Filtro por Tipo -->
          <select id="txFilterType" class="input-fintech text-xs w-auto py-1">
            <option value="all">Todos os Tipos</option>
            <option value="expense">Apenas Despesas (-)</option>
            <option value="income">Apenas Receitas (+)</option>
            <option value="transfer">Transferências (↔)</option>
          </select>

          <!-- Filtro por Categoria -->
          <select id="txFilterCategory" class="input-fintech text-xs w-auto max-w-[150px] py-1">
            <option value="all">Todas Categorias</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>

          <!-- Filtro por Período -->
          <select id="txFilterPeriod" class="input-fintech text-xs w-auto py-1">
            <option value="this_month">Este Mês</option>
            <option value="last_month">Mês Passado</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="this_year">Este Ano</option>
            <option value="all">Todo Histórico</option>
          </select>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-2">
          <button id="btnOpenImportModal" class="win-btn">
            <span>📁</span> <strong>Importar Extrato</strong>
          </button>
          <button id="btnExportCSV" class="win-btn">
            <span>💾</span> <strong>CSV</strong>
          </button>
          <button id="btnOpenNewTxModal" class="win-btn font-bold">
            <span>➕</span> <strong>Novo Lançamento</strong>
          </button>
        </div>
      </div>

      <!-- Barra de Ações em Lote (Ao Selecionar Checkboxes) -->
      <div id="bulkActionsBar" class="hidden win-outset p-3 bg-[#ffffcc] border-2 border-[#000080] flex flex-wrap items-center justify-between gap-2 text-xs animate-fade-in text-black">
        <div class="flex items-center gap-2 font-bold">
          <span class="text-base">☑️</span>
          <span id="bulkSelectedCount">0 selecionadas</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button id="btnBulkSetIncome" class="win-btn font-bold text-[#006600]" title="Converter para Receita (+)">
            <span>📥</span> Mudar p/ Receita (+)
          </button>
          <button id="btnBulkSetExpense" class="win-btn font-bold text-[#aa0000]" title="Converter para Despesa (-)">
            <span>📤</span> Mudar p/ Despesa (-)
          </button>

          <div class="h-4 w-px bg-zinc-400 mx-1"></div>

          <select id="bulkCategorySelect" class="input-fintech text-xs py-1 w-auto max-w-[140px]">
            ${categories.map(c => `<option value="${c.id}">${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})</option>`).join('')}
          </select>
          <button id="btnApplyBulkCategory" class="win-btn font-bold">
            Aplicar Categoria
          </button>

          <div class="h-4 w-px bg-zinc-400 mx-1"></div>

          <button id="btnDeleteBulkSelected" class="win-btn text-red-700 font-bold">
            <span>🗑️</span> Excluir
          </button>
        </div>
      </div>

      <!-- Tabela Datagrid Windows 98 -->
      <div class="win-inset overflow-hidden bg-white">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr>
                <th class="py-2 px-2 w-8 text-center">
                  <input type="checkbox" id="checkSelectAllTx" title="Selecionar Todas">
                </th>
                <th class="py-2 px-3">Data</th>
                <th class="py-2 px-3">Descrição</th>
                <th class="py-2 px-3 w-24 text-center">Tipo</th>
                <th class="py-2 px-3 min-w-[150px]">Categoria</th>
                <th class="py-2 px-3">Conta / Cartão</th>
                <th class="py-2 px-3 text-right">Valor (R$)</th>
                <th class="py-2 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody id="txTableBody">
              ${transactions.length === 0 ? `
                <tr>
                  <td colspan="8" class="py-8 text-center text-zinc-600 font-medium">
                    Nenhuma transação encontrada no período selecionado.
                  </td>
                </tr>
              ` : transactions.map(tx => {
                const acc = accMap.get(tx.accountId);
                const card = cardMap.get(tx.creditCardId);
                const sourceName = card ? `💳 ${card.name}` : (acc ? acc.name : 'Geral');

                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return `
                  <tr class="hover:bg-[#000080] hover:text-white group" data-tx-id="${tx.id}">
                    <td class="py-2 px-2 text-center">
                      <input type="checkbox" class="tx-row-check" data-id="${tx.id}">
                    </td>
                    <td class="py-2 px-3 font-mono text-[11px] text-zinc-800 group-hover:text-zinc-200">${FORMATTERS.formatDate(tx.date)}</td>
                    <td class="py-2 px-3 font-bold text-black group-hover:text-white">
                      <span>${tx.description}</span>
                      ${tx.isInstallment ? `<span class="text-[10px] bg-zinc-200 text-black px-1 font-mono border border-black ml-1">${tx.installmentNumber}/${tx.totalInstallments}</span>` : ''}
                      ${tx.isShared ? `<span class="text-[10px] bg-blue-100 text-blue-900 border border-blue-400 px-1 ml-1 font-bold">Dividido 50%</span>` : ''}
                    </td>

                    <!-- Alternar Tipo (Receita / Despesa) -->
                    <td class="py-2 px-3 text-center">
                      <button class="btn-toggle-tx-type win-btn py-0.5 px-2 text-[10px] font-bold ${
                        isIncome ? 'text-[#006600]' : 'text-[#aa0000]'
                      }" data-id="${tx.id}" title="Clique para alternar Tipo">
                        ${isIncome ? '📥 Receita' : '📤 Despesa'}
                      </button>
                    </td>

                    <!-- Seletor Rápido de Categoria na Tabela -->
                    <td class="py-2 px-3">
                      <select class="change-cat-select input-fintech text-[11px] py-0.5 px-1 font-medium" data-id="${tx.id}" title="Alterar Categoria Deste Gasto">
                        ${categories.map(c => `
                          <option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>
                            ${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})
                          </option>
                        `).join('')}
                      </select>
                    </td>

                    <td class="py-2 px-3 font-medium text-zinc-800 group-hover:text-zinc-200">${sourceName}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold ${isIncome ? 'text-[#006600] group-hover:text-green-300' : (isTransfer ? 'text-[#000080] group-hover:text-blue-200' : 'text-[#aa0000] group-hover:text-red-300')}">
                      ${isIncome ? '+' : (isTransfer ? '↔' : '-')} ${FORMATTERS.formatCurrency(tx.amount)}
                    </td>
                    <td class="py-2 px-3 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button class="btn-edit-tx win-btn py-0.5 px-1 text-[10px]" data-id="${tx.id}" title="Editar Detalhes">
                          ✏️
                        </button>
                        <button class="btn-duplicate-tx win-btn py-0.5 px-1 text-[10px]" data-id="${tx.id}" title="Duplicar">
                          📋
                        </button>
                        <button class="btn-delete-tx win-btn py-0.5 px-1 text-[10px]" data-id="${tx.id}" title="Excluir">
                          🗑️
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
