// Visão de Contas a Pagar e Contas a Receber - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderBillsView(data) {
  const { bills = [], receivables = [], categories = [], accounts = [] } = data;

  const totalPendingBills = bills
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const totalPendingReceivables = receivables
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Cards Resumo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="card-fintech p-5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/60 border-red-500/20">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Pagar Pendente</span>
            <h3 class="text-2xl font-extrabold text-red-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingBills)}</h3>
            <p class="text-[11px] text-slate-400 mt-1">${bills.filter(b => b.status === 'pending').length} contas pendentes</p>
          </div>
          <button id="btnOpenNewBillModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-4 h-4"></i> Conta a Pagar
          </button>
        </div>

        <div class="card-fintech p-5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/60 border-emerald-500/20">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Receber Previsto</span>
            <h3 class="text-2xl font-extrabold text-emerald-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalPendingReceivables)}</h3>
            <p class="text-[11px] text-slate-400 mt-1">${receivables.filter(r => r.status === 'pending').length} recebimentos previstos</p>
          </div>
          <button id="btnOpenNewReceivableModal" class="btn-secondary text-xs py-2 px-3 text-emerald-400">
            <i data-lucide="plus" class="w-4 h-4"></i> Conta a Receber
          </button>
        </div>
      </div>

      <!-- Tabela 1: Contas a Pagar -->
      <div class="card-fintech p-6">
        <h4 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i data-lucide="arrow-up-circle" class="w-4 h-4 text-red-400"></i> Contas a Pagar (Vencimentos)
        </h4>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Vencimento</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Valor</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${bills.length === 0 ? `
                <tr><td colspan="5" class="py-8 text-center text-slate-500">Nenhuma conta a pagar cadastrada.</td></tr>
              ` : bills.map(bill => {
                const isPaid = bill.status === 'paid';
                const statusBadge = isPaid
                  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Pago</span>'
                  : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">Pendente</span>';

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="py-3 px-4 font-mono text-slate-300">${FORMATTERS.formatDate(bill.dueDate)}</td>
                    <td class="py-3 px-4 font-bold text-slate-200">${bill.description}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-red-400">${FORMATTERS.formatCurrency(bill.amount)}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        ${!isPaid ? `
                          <button class="btn-mark-bill-paid btn-primary py-1 px-2.5 text-[11px]" data-id="${bill.id}">
                            <i data-lucide="check" class="w-3 h-3"></i> Pagar
                          </button>
                        ` : '<span class="text-xs text-slate-500">Efetivado</span>'}
                        <button class="btn-delete-bill text-slate-500 hover:text-red-400 p-1" data-id="${bill.id}">
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
      <div class="card-fintech p-6">
        <h4 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i data-lucide="arrow-down-circle" class="w-4 h-4 text-emerald-400"></i> Contas a Receber (Previsões de Entrada)
        </h4>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Previsão</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Valor</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${receivables.length === 0 ? `
                <tr><td colspan="5" class="py-8 text-center text-slate-500">Nenhum recebível cadastrado.</td></tr>
              ` : receivables.map(rec => {
                const isReceived = rec.status === 'received';
                const statusBadge = isReceived
                  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Recebido</span>'
                  : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">Pendente</span>';

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="py-3 px-4 font-mono text-slate-300">${FORMATTERS.formatDate(rec.expectedDate)}</td>
                    <td class="py-3 px-4 font-bold text-slate-200">${rec.description}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">${FORMATTERS.formatCurrency(rec.amount)}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        ${!isReceived ? `
                          <button class="btn-mark-rec-received btn-secondary text-emerald-400 py-1 px-2.5 text-[11px]" data-id="${rec.id}">
                            <i data-lucide="check" class="w-3 h-3"></i> Receber
                          </button>
                        ` : '<span class="text-xs text-slate-500">Efetivado</span>'}
                        <button class="btn-delete-rec text-slate-500 hover:text-red-400 p-1" data-id="${rec.id}">
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
