// Visão de Investimentos - Meu Financeiro IA

import { FORMATTERS, INVESTMENT_TYPES } from '../../config/constants.js';

export function renderInvestmentsView(data) {
  const { investments = [] } = data;

  const totalInvested = investments.reduce((sum, i) => sum + Number(i.investedAmount || 0), 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + Number(i.currentValue || 0), 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const typeMap = new Map(INVESTMENT_TYPES.map(t => [t.id, t.label]));

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Resumo da Carteira -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card-fintech p-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border-emerald-500/20">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Patrimônio Atual em Ativos</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalCurrentValue)}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Atualizado manualmente</p>
        </div>

        <div class="card-fintech p-5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Aportado (Custo)</span>
          <h3 class="text-2xl font-extrabold text-white font-mono mt-1">${FORMATTERS.formatCurrency(totalInvested)}</h3>
          <p class="text-[11px] text-slate-400 mt-1">${investments.length} posições cadastradas</p>
        </div>

        <div class="card-fintech p-5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Rentabilidade Histórica</span>
          <h3 class="text-2xl font-extrabold font-mono mt-1 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}">
            ${totalProfit >= 0 ? '+' : ''}${FORMATTERS.formatCurrency(totalProfit)} (${profitPercent.toFixed(1)}%)
          </h3>
          <p class="text-[11px] text-slate-400 mt-1">Valores informados pelo usuário</p>
        </div>
      </div>

      <!-- Aviso de Transparência -->
      <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <i data-lucide="info" class="w-4 h-4 text-indigo-400 flex-shrink-0"></i>
        <span>Os valores abaixo são registrados manualmente por você. O sistema não inventa cotações e não promete rentabilidade.</span>
      </div>

      <!-- Tabela de Ativos -->
      <div class="card-fintech p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white">Meus Ativos Financeiros</h4>
          <button id="btnOpenNewInvestmentModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-4 h-4"></i> Adicionar Ativo
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Ativo / Código</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4">Instituição</th>
                <th class="py-3 px-4 text-right">Valor Aportado</th>
                <th class="py-3 px-4 text-right">Valor Atual</th>
                <th class="py-3 px-4 text-right">Resultado</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${investments.length === 0 ? `
                <tr><td colspan="7" class="py-8 text-center text-slate-500">Nenhum investimento registrado.</td></tr>
              ` : investments.map(inv => {
                const profit = Number(inv.currentValue || 0) - Number(inv.investedAmount || 0);
                const pct = Number(inv.investedAmount || 0) > 0 ? (profit / Number(inv.investedAmount)) * 100 : 0;

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="py-3 px-4 font-bold text-slate-200">${inv.name}</td>
                    <td class="py-3 px-4 text-slate-400">${typeMap.get(inv.type) || inv.type}</td>
                    <td class="py-3 px-4 text-slate-300">${inv.institution || 'Geral'}</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-400">${FORMATTERS.formatCurrency(inv.investedAmount)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">${FORMATTERS.formatCurrency(inv.currentValue)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                      ${profit >= 0 ? '+' : ''}${FORMATTERS.formatCurrency(profit)} (${pct.toFixed(1)}%)
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button class="btn-delete-investment text-slate-500 hover:text-red-400 p-1" data-id="${inv.id}">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
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
