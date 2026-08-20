// Visão de Divisão de Despesas e Acertos (Casais e Famílias) - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';
import { SplitExpenseService } from '../../services/splitExpenseService.js';

export function renderSplitView(data) {
  const { transactions = [] } = data;
  const splitData = SplitExpenseService.calculateSharedBalance(transactions);

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header Divisão -->
      <div class="card-minimal p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="users" class="w-5 h-5 text-indigo-400"></i> Divisão de Gastos & Contas Conjuntas
          </h3>
          <p class="text-xs text-zinc-400">Gerencie despesas divididas com seu parceiro(a), amigos ou família</p>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="card-minimal p-5">
          <span class="text-xs uppercase font-bold text-zinc-500">Total que você pagou em despesas conjuntas</span>
          <h3 class="text-2xl font-bold text-white font-mono mt-2">${FORMATTERS.formatCurrency(splitData.totalPaidByMe)}</h3>
          <p class="text-[11px] text-zinc-500 mt-1">${splitData.sharedTxs.length} transações compartilhadas</p>
        </div>

        <div class="card-minimal p-5">
          <span class="text-xs uppercase font-bold text-zinc-500">Valor a ser reembolsado para você</span>
          <h3 class="text-2xl font-bold text-emerald-400 font-mono mt-2">${FORMATTERS.formatCurrency(splitData.totalOtherOwesMe)}</h3>
          <p class="text-[11px] text-zinc-500 mt-1">Saldo a receber no acerto final</p>
        </div>
      </div>

      <!-- Detalhamento por Pessoa / Parceiro -->
      <div class="card-minimal p-6 space-y-4">
        <h4 class="text-sm font-semibold text-white">Acertos Pendentes por Pessoa</h4>

        ${splitData.people.length === 0 ? `
          <div class="py-8 text-center text-zinc-500 text-xs">
            <p>Nenhuma despesa compartilhada registrada ainda.</p>
            <p class="text-[11px] text-zinc-600 mt-1">Ao registrar um gasto, marque a opção "Despesa Compartilhada".</p>
          </div>
        ` : splitData.people.map(person => `
          <div class="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h5 class="text-xs font-bold text-white">${person.name}</h5>
                <p class="text-[11px] text-zinc-400">${person.txCount} lançamentos compartilhados</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Deve a você</span>
                <p class="text-base font-bold font-mono text-emerald-400">${FORMATTERS.formatCurrency(person.totalOwedToMe)}</p>
              </div>
            </div>

            <div class="divide-y divide-white/5 text-xs pt-2">
              ${person.transactions.map(t => `
                <div class="py-2 flex justify-between items-center text-[11px]">
                  <span class="text-zinc-300">${t.description} (Total: ${FORMATTERS.formatCurrency(t.amount)})</span>
                  <span class="font-mono text-zinc-200">Parte dela: <strong>${FORMATTERS.formatCurrency(t.otherAmount)}</strong> (${t.otherSharePercent}%)</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
