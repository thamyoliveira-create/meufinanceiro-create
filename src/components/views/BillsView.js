// Visão Minimalista de Contas a Pagar e Contas a Receber - Meu Financeiro IA

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
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cards Resumo Minimalistas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="card-minimal p-5 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total a Pagar Pendente</span>
            <h3 class="text-2xl font-extrabold text-white font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingBills)}</h3>
            <p class="text-[11px] text-zinc-400 mt-1">${bills.filter(b => b.status === 'pending').length} contas pendentes</p>
          </div>
          <button id="btnOpenNewBillModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Conta a Pagar
          </button>
        </div>

        <div class="card-minimal p-5 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total a Receber Previsto</span>
            <h3 class="text-2xl font-extrabold text-emerald-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingReceivables)}</h3>
            <p class="text-[11px] text-zinc-400 mt-1">${receivables.filter(r => r.status === 'pending').length} recebimentos previstos</p>
          </div>
          <button id="btnOpenNewReceivableModal" class="btn-secondary text-xs py-2 px-3 text-emerald-400">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Conta a Receber
          </button>
        </div>
      </div>

      <!-- Tabela 1: Contas a Pagar -->
      <div class="card-minimal p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white flex items-center gap-2">
            <i data-lucide="receipt" class="w-4 h-4 text-zinc-400"></i> Contas a Pagar (Vencimentos)
          </h4>
          <span class="text-[11px] text-zinc-500 font-mono">${bills.length} cadastradas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/[0.06] text-zinc-500 font-medium text-[11px]">
                <th class="py-3 px-4">Vencimento</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Valor</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              ${bills.length === 0 ? `
                <tr><td colspan="5" class="py-8 text-center text-zinc-500">Nenhuma conta a pagar cadastrada. Clique no botão acima para adicionar.</td></tr>
              ` : bills.map(bill => {
                const isPaid = bill.status === 'paid';
                const statusBadge = isPaid
                  ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pago</span>'
                  : '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendente</span>';

                return `
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="py-3 px-4 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(bill.dueDate)}</td>
                    <td class="py-3 px-4 font-medium text-zinc-200">${bill.description}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right font-mono font-semibold text-zinc-200">${FORMATTERS.formatCurrency(bill.amount)}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        ${!isPaid ? `
                          <button class="btn-mark-bill-paid btn-primary py-1 px-2.5 text-[11px]" data-id="${bill.id}">
                            <i data-lucide="check" class="w-3 h-3"></i> Pagar
                          </button>
                        ` : '<span class="text-xs text-zinc-500">Efetivado</span>'}
                        <button class="btn-delete-bill text-zinc-500 hover:text-red-400 p-1" data-id="${bill.id}" title="Excluir">
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

      <!-- Tabela 2: Contas a Receber -->
      <div class="card-minimal p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-white flex items-center gap-2">
            <i data-lucide="arrow-down-left" class="w-4 h-4 text-emerald-400"></i> Contas a Receber (Previsões de Entrada)
          </h4>
          <span class="text-[11px] text-zinc-500 font-mono">${receivables.length} cadastradas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/[0.06] text-zinc-500 font-medium text-[11px]">
                <th class="py-3 px-4">Previsão</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Valor</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              ${receivables.length === 0 ? `
                <tr><td colspan="5" class="py-8 text-center text-zinc-500">Nenhum recebível cadastrado. Clique no botão acima para adicionar.</td></tr>
              ` : receivables.map(rec => {
                const isReceived = rec.status === 'received';
                const statusBadge = isReceived
                  ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Recebido</span>'
                  : '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Pendente</span>';

                return `
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="py-3 px-4 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(rec.expectedDate)}</td>
                    <td class="py-3 px-4 font-medium text-zinc-200">${rec.description}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right font-mono font-semibold text-emerald-400">${FORMATTERS.formatCurrency(rec.amount)}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        ${!isReceived ? `
                          <button class="btn-mark-rec-received btn-secondary text-emerald-400 py-1 px-2.5 text-[11px]" data-id="${rec.id}">
                            <i data-lucide="check" class="w-3 h-3"></i> Receber
                          </button>
                        ` : '<span class="text-xs text-zinc-500">Efetivado</span>'}
                        <button class="btn-delete-rec text-zinc-500 hover:text-red-400 p-1" data-id="${rec.id}" title="Excluir">
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
