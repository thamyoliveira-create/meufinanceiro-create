// Visão de Contas a Pagar e Receber Windows 98 - Meu Financeiro 98

import { FORMATTERS } from '../../config/constants.js';

export function renderBillsView(data) {
  const { bills = [], receivables = [] } = data;

  const totalPendingBills = bills
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const totalPendingReceivables = receivables
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return `
    <div class="space-y-4 animate-fade-in pb-8 text-black">
      <!-- Cards Resumo 98 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="win-outset p-3.5 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase text-zinc-700">Total a Pagar Pendente:</span>
            <h3 class="text-2xl font-extrabold text-[#aa0000] font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingBills)}</h3>
            <p class="text-[11px] text-zinc-700 mt-1">${bills.filter(b => b.status === 'pending').length} contas pendentes</p>
          </div>
          <button id="btnOpenNewBillModal" class="win-btn font-bold">
            <span>➕</span> <span>Conta a Pagar</span>
          </button>
        </div>

        <div class="win-outset p-3.5 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase text-zinc-700">Total a Receber Previsto:</span>
            <h3 class="text-2xl font-extrabold text-[#006600] font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingReceivables)}</h3>
            <p class="text-[11px] text-zinc-700 mt-1">${receivables.filter(r => r.status === 'pending').length} recebimentos previstos</p>
          </div>
          <button id="btnOpenNewReceivableModal" class="win-btn font-bold">
            <span>➕</span> <span>Conta a Receber</span>
          </button>
        </div>
      </div>

      <!-- Tabela 1: Contas a Pagar -->
      <div class="win-outset p-3.5 space-y-2">
        <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
          <h4 class="text-xs font-bold text-black flex items-center gap-1.5">
            <span>🧾</span> <span>Contas a Pagar (Vencimentos)</span>
          </h4>
          <span class="text-[11px] font-mono font-bold">${bills.length} cadastradas</span>
        </div>

        <div class="win-inset overflow-hidden bg-white">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr>
                  <th class="py-2 px-3">Vencimento</th>
                  <th class="py-2 px-3">Descrição</th>
                  <th class="py-2 px-3">Status</th>
                  <th class="py-2 px-3 text-right">Valor</th>
                  <th class="py-2 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200">
                ${bills.length === 0 ? `
                  <tr><td colspan="5" class="py-6 text-center text-zinc-600 font-medium">Nenhuma conta a pagar cadastrada. Clique no botão acima para adicionar.</td></tr>
                ` : bills.map(bill => {
                  const isPaid = bill.status === 'paid';
                  const statusBadge = isPaid
                    ? '<span class="px-1.5 py-0.2 font-mono font-bold bg-green-100 text-[#006600] border border-[#006600]">Pago</span>'
                    : '<span class="px-1.5 py-0.2 font-mono font-bold bg-amber-100 text-amber-800 border border-amber-800">Pendente</span>';

                  return `
                    <tr class="hover:bg-[#000080] hover:text-white group">
                      <td class="py-2 px-3 font-mono text-[11px] text-zinc-800 group-hover:text-zinc-200">${FORMATTERS.formatDate(bill.dueDate)}</td>
                      <td class="py-2 px-3 font-bold text-black group-hover:text-white">${bill.description}</td>
                      <td class="py-2 px-3">${statusBadge}</td>
                      <td class="py-2 px-3 text-right font-mono font-bold text-[#aa0000] group-hover:text-red-200">${FORMATTERS.formatCurrency(bill.amount)}</td>
                      <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          ${!isPaid ? `
                            <button class="btn-mark-bill-paid win-btn py-0.5 px-2 text-[10px] font-bold" data-id="${bill.id}">
                              ✓ Pagar
                            </button>
                          ` : '<span class="text-[11px] text-zinc-600 group-hover:text-zinc-200 font-medium">Efetivado</span>'}
                          <button class="btn-delete-bill win-btn py-0.5 px-1 text-[10px]" data-id="${bill.id}" title="Excluir">
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

      <!-- Tabela 2: Contas a Receber -->
      <div class="win-outset p-3.5 space-y-2">
        <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
          <h4 class="text-xs font-bold text-black flex items-center gap-1.5">
            <span>📥</span> <span>Contas a Receber (Previsões de Entrada)</span>
          </h4>
          <span class="text-[11px] font-mono font-bold">${receivables.length} cadastradas</span>
        </div>

        <div class="win-inset overflow-hidden bg-white">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr>
                  <th class="py-2 px-3">Previsão</th>
                  <th class="py-2 px-3">Descrição</th>
                  <th class="py-2 px-3">Status</th>
                  <th class="py-2 px-3 text-right">Valor</th>
                  <th class="py-2 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200">
                ${receivables.length === 0 ? `
                  <tr><td colspan="5" class="py-6 text-center text-zinc-600 font-medium">Nenhum recebível cadastrado. Clique no botão acima para adicionar.</td></tr>
                ` : receivables.map(rec => {
                  const isReceived = rec.status === 'received';
                  const statusBadge = isReceived
                    ? '<span class="px-1.5 py-0.2 font-mono font-bold bg-green-100 text-[#006600] border border-[#006600]">Recebido</span>'
                    : '<span class="px-1.5 py-0.2 font-mono font-bold bg-blue-100 text-blue-800 border border-blue-800">Pendente</span>';

                  return `
                    <tr class="hover:bg-[#000080] hover:text-white group">
                      <td class="py-2 px-3 font-mono text-[11px] text-zinc-800 group-hover:text-zinc-200">${FORMATTERS.formatDate(rec.expectedDate)}</td>
                      <td class="py-2 px-3 font-bold text-black group-hover:text-white">${rec.description}</td>
                      <td class="py-2 px-3">${statusBadge}</td>
                      <td class="py-2 px-3 text-right font-mono font-bold text-[#006600] group-hover:text-green-300">${FORMATTERS.formatCurrency(rec.amount)}</td>
                      <td class="py-2 px-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          ${!isReceived ? `
                            <button class="btn-mark-rec-received win-btn py-0.5 px-2 text-[10px] font-bold" data-id="${rec.id}">
                              ✓ Receber
                            </button>
                          ` : '<span class="text-[11px] text-zinc-600 group-hover:text-zinc-200 font-medium">Efetivado</span>'}
                          <button class="btn-delete-rec win-btn py-0.5 px-1 text-[10px]" data-id="${rec.id}" title="Excluir">
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
    </div>
  `;
}
