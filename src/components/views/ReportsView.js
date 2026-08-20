// Visão de Relatórios, "Para Onde Foi Meu Dinheiro?" e Análise Mensal - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderReportsView(data) {
  const { metrics, categoryBreakdown, categories = [], transactions = [] } = data;

  const currentMonthKey = FORMATTERS.getCurrentMonthKey();
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = FORMATTERS.getCurrentMonthKey(prevDate);

  // Comparações de cada categoria com o mês anterior
  const categoryComparison = categories.filter(c => c.type === 'expense').map(cat => {
    const currentTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(currentMonthKey) && t.isPaid !== false);
    const prevTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(prevMonthKey) && t.isPaid !== false);

    const currentTotal = currentTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
    const prevTotal = prevTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
    const diff = currentTotal - prevTotal;
    const varPct = prevTotal > 0 ? (diff / prevTotal) * 100 : 0;

    return {
      category: cat,
      currentTotal,
      prevTotal,
      diff,
      varPct,
    };
  }).filter(item => item.currentTotal > 0 || item.prevTotal > 0);

  categoryComparison.sort((a, b) => b.currentTotal - a.currentTotal);

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header do Relatório e Botões de Exportação -->
      <div class="card-fintech p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white">Relatórios Financeiros Consolidados</h3>
          <p class="text-xs text-slate-400">Análise aprofundada de distribuição, variações e exportação</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btnPrintPDF" class="btn-secondary text-xs py-2 px-3">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i> Imprimir / PDF
          </button>
          <button id="btnExportFullCSV" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> Exportar Dados
          </button>
        </div>
      </div>

      <!-- Seção 1: "Para Onde Foi Meu Dinheiro?" (Requisito 47) -->
      <div class="card-fintech p-6 space-y-5">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-400"></i> Para Onde Foi Meu Dinheiro Neste Mês?
          </h4>
          <span class="text-xs font-mono font-bold text-white">Total: ${FORMATTERS.formatCurrency(metrics.currentExpense)}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${categoryBreakdown.list.map(item => `
            <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color}"></span>
                    ${item.name}
                  </span>
                  <span class="text-xs font-bold font-mono text-emerald-400">${item.percentage.toFixed(1)}%</span>
                </div>
                <h3 class="text-xl font-extrabold text-white font-mono mt-3">${FORMATTERS.formatCurrency(item.amount)}</h3>
                <p class="text-[11px] text-slate-400 mt-1">${item.count} lançamentos realizados</p>
              </div>

              <!-- Barra de Distribuição -->
              <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-4">
                <div class="h-full rounded-full" style="background-color: ${item.color}; width: ${item.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Seção 2: Comparação Automática Categoria por Categoria (Requisito 48) -->
      <div class="card-fintech p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="git-compare" class="w-4 h-4 text-indigo-400"></i> Comparação com o Mês Anterior (Variação Real)
          </h4>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Categoria</th>
                <th class="py-3 px-4 text-right">Mês Passado</th>
                <th class="py-3 px-4 text-right">Mês Atual</th>
                <th class="py-3 px-4 text-right">Diferença (R$)</th>
                <th class="py-3 px-4 text-right">Variação (%)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${categoryComparison.map(row => {
                const isHigher = row.diff > 0;
                const isSame = row.diff === 0;

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="py-3 px-4 font-bold text-slate-200">${row.category.name}</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-400">${FORMATTERS.formatCurrency(row.prevTotal)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">${FORMATTERS.formatCurrency(row.currentTotal)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${isHigher ? 'text-red-400' : (isSame ? 'text-slate-400' : 'text-emerald-400')}">
                      ${isHigher ? '+' : ''}${FORMATTERS.formatCurrency(row.diff)}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${isHigher ? 'text-red-400' : (isSame ? 'text-slate-400' : 'text-emerald-400')}">
                      ${isHigher ? '↑ +' : (isSame ? '=' : '↓ ')}${row.varPct.toFixed(1)}%
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
