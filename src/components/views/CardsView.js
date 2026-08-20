// Visão de Cartões de Crédito e Faturas - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderCardsView(data) {
  const { creditCards = [], transactions = [] } = data;

  const currentMonthKey = FORMATTERS.getCurrentMonthKey();

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Header e Ação -->
      <div class="card-fintech p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-white">Cartões de Crédito</h3>
          <p class="text-xs text-slate-400">Gerencie limites, vencimentos e parcelamentos futuros</p>
        </div>
        <button id="btnOpenNewCardModal" class="btn-primary text-xs py-2.5 px-4">
          <i data-lucide="plus" class="w-4 h-4"></i> Novo Cartão
        </button>
      </div>

      <!-- Grid de Cartões -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${creditCards.length === 0 ? `
          <div class="col-span-full text-center py-12 card-fintech">
            <i data-lucide="credit-card" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
            <p class="text-xs text-slate-400">Nenhum cartão de crédito cadastrado.</p>
          </div>
        ` : creditCards.map(card => {
          // Calcula gastos na fatura do mês
          const cardTxs = transactions.filter(t => t.creditCardId === card.id && t.date && t.date.startsWith(currentMonthKey));
          const invoiceTotal = cardTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
          const limit = Number(card.creditLimit || 0);
          const availableLimit = Math.max(0, limit - invoiceTotal);
          const usedPercent = limit > 0 ? Math.min(100, (invoiceTotal / limit) * 100) : 0;

          return `
            <div class="card-fintech p-6 relative overflow-hidden flex flex-col justify-between">
              <!-- Visual de Cartão Estilizado no Topo -->
              <div class="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/60 shadow-xl relative">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">${card.institution || 'Banco'}</span>
                  <i data-lucide="nfc" class="w-5 h-5 text-slate-400"></i>
                </div>
                <div class="mt-6 mb-2">
                  <h4 class="text-base font-bold text-white tracking-wide">${card.name}</h4>
                  <p class="text-[11px] text-slate-400 font-mono">•••• •••• •••• 2026</p>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-300 mt-4 pt-3 border-t border-slate-800">
                  <span>Fecha dia <strong>${card.closingDay}</strong></span>
                  <span>Vence dia <strong>${card.dueDay}</strong></span>
                </div>
              </div>

              <!-- Detalhes de Fatura e Limite -->
              <div class="mt-6 space-y-4">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-400 font-semibold">Fatura Atual do Mês:</span>
                  <span class="font-mono font-extrabold text-lg text-red-400">${FORMATTERS.formatCurrency(invoiceTotal)}</span>
                </div>

                <!-- Barra de Progresso do Limite -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[11px] text-slate-400">
                    <span>Limite Usado: ${usedPercent.toFixed(0)}%</span>
                    <span>Disponível: <strong class="text-emerald-400">${FORMATTERS.formatCurrency(availableLimit)}</strong></span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300 ${usedPercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}" style="width: ${usedPercent}%"></div>
                  </div>
                  <p class="text-[10px] text-right text-slate-500">Limite Total: ${FORMATTERS.formatCurrency(limit)}</p>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button class="btn-delete-card text-xs text-slate-500 hover:text-red-400 flex items-center gap-1" data-id="${card.id}">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Excluir Cartão
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Seção de Compras Parceladas Ativas -->
      <div class="card-fintech p-6">
        <h4 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <i data-lucide="layers" class="w-4 h-4 text-indigo-400"></i> Compras Parceladas em Andamento
        </h4>

        <div class="divide-y divide-slate-800/80">
          ${transactions.filter(t => t.isInstallment).length === 0 ? `
            <p class="text-xs text-slate-400 py-4">Nenhuma compra parcelada registrada.</p>
          ` : transactions.filter(t => t.isInstallment).map(t => `
            <div class="py-3 flex items-center justify-between text-xs">
              <div>
                <p class="font-bold text-slate-200">${t.description}</p>
                <p class="text-[11px] text-slate-400">Data da fatura: ${FORMATTERS.formatDate(t.date)}</p>
              </div>
              <div class="text-right">
                <p class="font-mono font-bold text-white">${FORMATTERS.formatCurrency(t.amount)}</p>
                <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                  ${t.installmentNumber || 1} de ${t.totalInstallments || 1}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
