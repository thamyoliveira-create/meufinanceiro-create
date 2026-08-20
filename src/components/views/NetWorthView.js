// Visão de Patrimônio Líquido (Ativos vs Passivos) - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderNetWorthView(data) {
  const { assets = [], liabilities = [] } = data;

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.value || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Card Central de Patrimônio Líquido -->
      <div class="card-fintech p-8 text-center bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/30">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Patrimônio Líquido Consolidado</span>
        <h2 class="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight mt-2">${FORMATTERS.formatCurrency(netWorth)}</h2>
        <p class="text-xs text-slate-400 mt-2">Ativos Totais (${FORMATTERS.formatCurrency(totalAssets)}) − Passivos Totais (${FORMATTERS.formatCurrency(totalLiabilities)})</p>
      </div>

      <!-- Grid Duplo: Ativos vs Passivos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Coluna de Ativos (Bens e Direitos) -->
        <div class="card-fintech p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-400"></i> Meus Ativos (Bens & Direitos)
            </h4>
            <button id="btnOpenNewAssetModal" class="btn-primary text-xs py-1.5 px-3">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Novo Ativo
            </button>
          </div>

          <div class="divide-y divide-slate-800/60">
            ${assets.length === 0 ? `
              <p class="text-xs text-slate-500 py-6 text-center">Nenhum ativo cadastrado.</p>
            ` : assets.map(a => `
              <div class="py-3 flex items-center justify-between text-xs">
                <div>
                  <p class="font-bold text-slate-200">${a.name}</p>
                  <p class="text-[11px] text-slate-400 capitalize">${a.type || 'Geral'}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold text-emerald-400">${FORMATTERS.formatCurrency(a.value)}</span>
                  <button class="btn-delete-asset text-slate-500 hover:text-red-400 p-1" data-id="${a.id}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Coluna de Passivos (Dívidas e Obrigações) -->
        <div class="card-fintech p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="minus-circle" class="w-4 h-4 text-red-400"></i> Meus Passivos (Dívidas & Obrigações)
            </h4>
            <button id="btnOpenNewLiabilityModal" class="btn-secondary text-xs py-1.5 px-3 text-red-400">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Novo Passivo
            </button>
          </div>

          <div class="divide-y divide-slate-800/60">
            ${liabilities.length === 0 ? `
              <p class="text-xs text-slate-500 py-6 text-center">Nenhum passivo cadastrado.</p>
            ` : liabilities.map(l => `
              <div class="py-3 flex items-center justify-between text-xs">
                <div>
                  <p class="font-bold text-slate-200">${l.name}</p>
                  <p class="text-[11px] text-slate-400 capitalize">${l.type || 'Geral'}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold text-red-400">${FORMATTERS.formatCurrency(l.value)}</span>
                  <button class="btn-delete-liability text-slate-500 hover:text-red-400 p-1" data-id="${l.id}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
