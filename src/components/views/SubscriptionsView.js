// Visão de Assinaturas e Recorrências - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderSubscriptionsView(data) {
  const { subscriptions = [] } = data;

  const totalMonthly = subscriptions
    .filter(s => s.isActive !== false)
    .reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const totalAnnual = totalMonthly * 12;

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Indicadores de Assinaturas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="card-fintech p-6 bg-gradient-to-r from-slate-900 to-slate-900/60 border-indigo-500/20">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Mensal em Assinaturas</span>
          <h3 class="text-3xl font-extrabold text-white font-mono mt-1">${FORMATTERS.formatCurrency(totalMonthly)}</h3>
          <p class="text-xs text-slate-400 mt-1">${subscriptions.length} serviços cadastrados</p>
        </div>

        <div class="card-fintech p-6 bg-gradient-to-r from-slate-900 to-slate-900/60 border-amber-500/20">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Impacto Equivalente Anual</span>
          <h3 class="text-3xl font-extrabold text-amber-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalAnnual)}</h3>
          <p class="text-xs text-slate-400 mt-1">Custo acumulado projetado em 12 meses</p>
        </div>
      </div>

      <!-- Tabela de Assinaturas -->
      <div class="card-fintech p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="repeat" class="w-4 h-4 text-emerald-400"></i> Minhas Assinaturas Ativas
          </h4>
          <button id="btnOpenNewSubModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-4 h-4"></i> Nova Assinatura
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Serviço / Assinatura</th>
                <th class="py-3 px-4">Cobrança</th>
                <th class="py-3 px-4">Dia do Mês</th>
                <th class="py-3 px-4 text-right">Valor Mensal</th>
                <th class="py-3 px-4 text-right">Equivalente Anual</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${subscriptions.length === 0 ? `
                <tr><td colspan="6" class="py-8 text-center text-slate-500">Nenhuma assinatura cadastrada.</td></tr>
              ` : subscriptions.map(sub => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3 px-4 font-bold text-slate-200">${sub.name}</td>
                  <td class="py-3 px-4 text-slate-400 capitalize">${sub.billingCycle || 'Mensal'}</td>
                  <td class="py-3 px-4 font-mono text-slate-300">Dia ${sub.dueDay || 1}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">${FORMATTERS.formatCurrency(sub.amount)}</td>
                  <td class="py-3 px-4 text-right font-mono text-amber-400">${FORMATTERS.formatCurrency(Number(sub.amount) * 12)}</td>
                  <td class="py-3 px-4 text-center">
                    <button class="btn-delete-sub text-slate-500 hover:text-red-400 p-1" data-id="${sub.id}">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
