// Visão de Orçamento Minimalista com Diagnóstico da Regra 50/30/20 - Meu Financeiro IA

import { FORMATTERS, RULE_50_30_20_MAP } from '../../config/constants.js';

export function renderBudgetView(data) {
  const { budgets = [], categories = [], transactions = [], metrics } = data;

  const currentMonthKey = FORMATTERS.getCurrentMonthKey();
  const currentBudget = budgets[0] || { totalBudgetLimit: 4500.00 };
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Cálculos da Regra 50 / 30 / 20
  const income = metrics.currentIncome > 0 ? metrics.currentIncome : 5000;
  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsTotal = metrics.currentSavings > 0 ? metrics.currentSavings : 0;

  const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey) && t.isPaid !== false);

  currentMonthExpenses.forEach(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    const catName = (cat?.name || '').toLowerCase();
    const val = Number(tx.amount || 0);

    if (RULE_50_30_20_MAP.needs.some(k => catName.includes(k))) {
      needsTotal += val;
    } else if (RULE_50_30_20_MAP.wants.some(k => catName.includes(k))) {
      wantsTotal += val;
    } else if (RULE_50_30_20_MAP.savings.some(k => catName.includes(k))) {
      savingsTotal += val;
    } else {
      needsTotal += val;
    }
  });

  const needsPercent = (needsTotal / income) * 100;
  const wantsPercent = (wantsTotal / income) * 100;
  const savingsPercent = (savingsTotal / income) * 100;

  // Orçamentos por categoria
  const categoryBudgetData = expenseCategories.map(cat => {
    const catTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(currentMonthKey) && t.isPaid !== false);
    const spent = catTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const limit = cat.budgetLimit || (spent > 0 ? spent * 1.25 : 800);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;

    return {
      category: cat,
      spent,
      limit,
      remaining,
      percent: Math.min(percent, 100),
      rawPercent: percent,
    };
  });

  const totalSpent = categoryBudgetData.reduce((sum, c) => sum + c.spent, 0);
  const totalLimit = currentBudget.totalBudgetLimit || 5000.00;
  const totalPercent = Math.min(100, (totalSpent / totalLimit) * 100);

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Orçamento Geral Minimalista -->
      <div class="card-minimal p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Limite Mensal Global</span>
            <div class="flex items-baseline gap-3 mt-1">
              <h3 class="text-3xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(totalSpent)}</h3>
              <span class="text-xs text-zinc-400 font-mono">de ${FORMATTERS.formatCurrency(totalLimit)}</span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              Saldo restante: <strong class="${totalLimit - totalSpent >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono">${FORMATTERS.formatCurrency(totalLimit - totalSpent)}</strong>
            </p>
          </div>
        </div>

        <div class="mt-6 space-y-1.5">
          <div class="flex justify-between text-xs text-zinc-500 font-mono">
            <span>${((totalSpent / totalLimit) * 100).toFixed(1)}% utilizado</span>
            <span>${totalPercent >= 100 ? 'Limite Excedido' : 'Dentro do Limite'}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${totalPercent >= 100 ? 'bg-rose-500' : (totalPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-400')}" style="width: ${totalPercent}%"></div>
          </div>
        </div>
      </div>

      <!-- Seção: Diagnóstico da Regra 50 / 30 / 20 -->
      <div class="card-minimal p-6 space-y-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="scale" class="w-4 h-4 text-indigo-400"></i>
            <h4 class="text-sm font-semibold text-white">Diagnóstico da Regra 50 / 30 / 20</h4>
          </div>
          <span class="text-xs text-zinc-500 font-mono">Baseado na renda de ${FORMATTERS.formatCurrency(income)}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 50% Necessidades -->
          <div class="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-200">50% Necessidades</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${needsPercent <= 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}">
                ${needsPercent.toFixed(1)}% Real
              </span>
            </div>
            <h5 class="text-lg font-bold font-mono text-white">${FORMATTERS.formatCurrency(needsTotal)}</h5>
            <p class="text-[11px] text-zinc-500">Ideal: até ${FORMATTERS.formatCurrency(income * 0.5)} (Moradia, Alimentação, Contas e Saúde)</p>
            <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-2">
              <div class="h-full bg-blue-400 rounded-full" style="width: ${Math.min(100, (needsPercent / 50) * 100)}%"></div>
            </div>
          </div>

          <!-- 30% Desejos e Estilo de Vida -->
          <div class="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-200">30% Estilo de Vida</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${wantsPercent <= 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
                ${wantsPercent.toFixed(1)}% Real
              </span>
            </div>
            <h5 class="text-lg font-bold font-mono text-white">${FORMATTERS.formatCurrency(wantsTotal)}</h5>
            <p class="text-[11px] text-zinc-500">Ideal: até ${FORMATTERS.formatCurrency(income * 0.3)} (Lazer, Restaurantes, Assinaturas e Compras)</p>
            <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-2">
              <div class="h-full bg-purple-400 rounded-full" style="width: ${Math.min(100, (wantsPercent / 30) * 100)}%"></div>
            </div>
          </div>

          <!-- 20% Futuro / Investimentos -->
          <div class="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-200">20% Futuro & Reserva</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${savingsPercent >= 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}">
                ${savingsPercent.toFixed(1)}% Real
              </span>
            </div>
            <h5 class="text-lg font-bold font-mono text-emerald-400">${FORMATTERS.formatCurrency(savingsTotal)}</h5>
            <p class="text-[11px] text-zinc-500">Ideal: mínimo ${FORMATTERS.formatCurrency(income * 0.2)} (Reserva, Aportes e Quitação)</p>
            <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-2">
              <div class="h-full bg-emerald-400 rounded-full" style="width: ${Math.min(100, (savingsPercent / 20) * 100)}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorias Individuais -->
      <div class="card-minimal p-6 space-y-4">
        <h4 class="text-sm font-semibold text-white">Categorias de Despesa</h4>

        <div class="space-y-3">
          ${categoryBudgetData.map(item => `
            <div class="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-zinc-200">${item.category.name}</span>
                <span class="font-mono text-zinc-400">
                  <strong class="text-zinc-200">${FORMATTERS.formatCurrency(item.spent)}</strong> / ${FORMATTERS.formatCurrency(item.limit)}
                </span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full rounded-full ${item.rawPercent >= 100 ? 'bg-rose-500' : (item.rawPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-400')}" style="width: ${item.percent}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
