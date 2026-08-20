// Visão de Orçamento Mensal e por Categoria - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderBudgetView(data) {
  const { budgets = [], categories = [], transactions = [] } = data;

  const currentMonthKey = FORMATTERS.getCurrentMonthKey();
  const currentBudget = budgets[0] || { totalBudgetLimit: 4500.00 };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Calcula gastos reais por categoria no mês
  const categoryBudgetData = expenseCategories.map(cat => {
    const catTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(currentMonthKey) && t.isPaid !== false);
    const spent = catTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Orçamento padrão estimado se não houver personalizado
    const limit = cat.budgetLimit || (spent > 0 ? spent * 1.25 : 800);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;

    let status = 'normal';
    let statusText = 'Dentro do limite';
    let badgeClass = 'bg-emerald-500/20 text-emerald-400';

    if (percent >= 100) {
      status = 'exceeded';
      statusText = 'Orçamento Ultrapassado!';
      badgeClass = 'bg-red-500/20 text-red-400 font-bold';
    } else if (percent >= 80) {
      status = 'warning';
      statusText = 'Alerta: 80% utilizado';
      badgeClass = 'bg-amber-500/20 text-amber-400 font-semibold';
    }

    return {
      category: cat,
      spent,
      limit,
      remaining,
      percent: Math.min(percent, 100),
      rawPercent: percent,
      status,
      statusText,
      badgeClass,
    };
  });

  const totalSpent = categoryBudgetData.reduce((sum, c) => sum + c.spent, 0);
  const totalLimit = currentBudget.totalBudgetLimit || 5000.00;
  const totalPercent = Math.min(100, (totalSpent / totalLimit) * 100);

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Card Geral de Orçamento do Mês -->
      <div class="card-fintech p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border-indigo-500/20">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">Orçamento Geral do Mês</span>
            <div class="flex items-baseline gap-3 mt-1">
              <h3 class="text-3xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(totalSpent)}</h3>
              <span class="text-xs text-slate-400 font-mono">de ${FORMATTERS.formatCurrency(totalLimit)} limite total</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">
              Restante disponível: <strong class="${totalLimit - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'} font-mono">${FORMATTERS.formatCurrency(totalLimit - totalSpent)}</strong>
            </p>
          </div>

          <button id="btnSetBudgetLimit" class="btn-primary text-xs py-2.5 px-4">
            <i data-lucide="sliders" class="w-4 h-4"></i> Ajustar Limites
          </button>
        </div>

        <div class="mt-6 space-y-2">
          <div class="flex justify-between text-xs text-slate-400">
            <span>Progresso Geral: ${((totalSpent / totalLimit) * 100).toFixed(1)}%</span>
            <span>${totalPercent >= 100 ? '⚠️ Limite atingido' : 'Normal'}</span>
          </div>
          <div class="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${totalPercent >= 100 ? 'bg-red-500' : (totalPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${totalPercent}%"></div>
          </div>
        </div>
      </div>

      <!-- Lista de Orçamento por Categoria -->
      <div class="card-fintech p-6 space-y-5">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-400"></i> Orçamento por Categoria
          </h4>
          <span class="text-xs text-slate-400">Acompanhamento em tempo real</span>
        </div>

        <div class="space-y-4">
          ${categoryBudgetData.map(item => `
            <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background-color: ${item.category.color}20; color: ${item.category.color}">
                    <i data-lucide="${item.category.icon || 'tag'}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-white">${item.category.name}</h5>
                    <p class="text-[11px] text-slate-400">
                      Gasto: <strong class="text-slate-200 font-mono">${FORMATTERS.formatCurrency(item.spent)}</strong> de <span class="font-mono">${FORMATTERS.formatCurrency(item.limit)}</span>
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-[11px] px-2.5 py-1 rounded-full ${item.badgeClass}">
                    ${item.statusText}
                  </span>
                  <span class="text-xs font-mono font-bold ${item.remaining >= 0 ? 'text-slate-300' : 'text-red-400'}">
                    ${item.remaining >= 0 ? `Restam ${FORMATTERS.formatCurrency(item.remaining)}` : `Estourou em ${FORMATTERS.formatCurrency(Math.abs(item.remaining))}`}
                  </span>
                </div>
              </div>

              <!-- Barra de Progresso -->
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 ${item.rawPercent >= 100 ? 'bg-red-500' : (item.rawPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${item.percent}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
