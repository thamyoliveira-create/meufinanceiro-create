// Visão do Dashboard Principal - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderDashboardView(data) {
  const { metrics, categoryBreakdown, recentTransactions = [], accounts = [], anomalies = [] } = data;

  const expenseVarText = metrics.prevExpense > 0
    ? (metrics.expenseVarPercent <= 0
        ? `<span class="text-emerald-400 flex items-center text-xs font-semibold gap-0.5"><i data-lucide="trending-down" class="w-3.5 h-3.5"></i> ${Math.abs(metrics.expenseVarPercent).toFixed(1)}% vs mês anterior</span>`
        : `<span class="text-red-400 flex items-center text-xs font-semibold gap-0.5"><i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +${metrics.expenseVarPercent.toFixed(1)}% vs mês anterior</span>`)
    : '<span class="text-slate-400 text-xs">Primeiro mês registrado</span>';

  const incomeVarText = metrics.prevIncome > 0
    ? (metrics.incomeVarPercent >= 0
        ? `<span class="text-emerald-400 flex items-center text-xs font-semibold gap-0.5"><i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +${metrics.incomeVarPercent.toFixed(1)}% vs mês anterior</span>`
        : `<span class="text-red-400 flex items-center text-xs font-semibold gap-0.5"><i data-lucide="trending-down" class="w-3.5 h-3.5"></i> ${Math.abs(metrics.incomeVarPercent).toFixed(1)}% vs mês anterior</span>`)
    : '<span class="text-slate-400 text-xs">Primeiro mês registrado</span>';

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Banner de Alerta de Anomalia de Gastos se houver -->
      ${anomalies.length > 0 ? `
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">Atenção aos Gastos Acima do Padrão</h4>
              <p class="text-xs text-slate-200 mt-0.5">${anomalies[0].message}</p>
            </div>
          </div>
          <button data-route="ai_assistant" class="sidebar-item text-xs font-bold text-amber-400 hover:text-amber-300 underline whitespace-nowrap">
            Ver Análise IA
          </button>
        </div>
      ` : ''}

      <!-- Grid Principal de Cards de KPI Financeiro -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Saldo Atual -->
        <div class="card-fintech p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Atual</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <i data-lucide="wallet" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-extrabold text-white font-mono tracking-tight">${FORMATTERS.formatCurrency(metrics.currentBalance)}</h3>
            <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <i data-lucide="calculator" class="w-3 h-3 text-emerald-400"></i> Projeção fim do mês: <strong class="text-slate-200">${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}</strong>
            </p>
          </div>
        </div>

        <!-- 2. Receitas do Mês -->
        <div class="card-fintech p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Receitas do Mês</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">${FORMATTERS.formatCurrency(metrics.currentIncome)}</h3>
            <div class="mt-1">${incomeVarText}</div>
          </div>
        </div>

        <!-- 3. Despesas do Mês -->
        <div class="card-fintech p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Despesas do Mês</span>
            <div class="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-extrabold text-red-400 font-mono tracking-tight">${FORMATTERS.formatCurrency(metrics.currentExpense)}</h3>
            <div class="mt-1">${expenseVarText}</div>
          </div>
        </div>

        <!-- 4. Economia do Mês & % Renda Comprometida -->
        <div class="card-fintech p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Economia do Mês</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <i data-lucide="piggy-bank" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-extrabold text-white font-mono tracking-tight">${FORMATTERS.formatCurrency(metrics.currentSavings)}</h3>
            <p class="text-xs text-slate-400 mt-1">
              Renda comprometida: <strong class="${metrics.committedIncomePercent > 80 ? 'text-red-400' : 'text-emerald-400'}">${metrics.committedIncomePercent.toFixed(1)}%</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Linha Secundária de Indicadores: Total Investido e Total Dívidas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="card-fintech p-4 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i data-lucide="trending-up" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs font-bold uppercase text-slate-400">Patrimônio Investido</p>
              <h4 class="text-lg font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(metrics.totalInvested)}</h4>
            </div>
          </div>
          <button data-route="investments" class="sidebar-item btn-secondary text-xs py-1.5 px-3">
            Ver Carteira
          </button>
        </div>

        <div class="card-fintech p-4 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <i data-lucide="badge-percent" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs font-bold uppercase text-slate-400">Total de Dívidas Ativas</p>
              <h4 class="text-lg font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(metrics.totalDebts)}</h4>
            </div>
          </div>
          <button data-route="debts" class="sidebar-item btn-secondary text-xs py-1.5 px-3">
            Simulador de Quitação
          </button>
        </div>
      </div>

      <!-- Seção Central de Gráficos Interativos -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gráfico 1: Gastos por Categoria (Doughnut) -->
        <div class="card-fintech p-6 lg:col-span-1 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-400"></i> Gastos por Categoria
            </h3>
            <span class="text-[11px] text-slate-400">Mês Atual</span>
          </div>

          <div class="relative flex items-center justify-center h-56">
            <canvas id="chartCategoryDoughnut"></canvas>
          </div>

          <!-- Legenda Top Categorias -->
          <div class="mt-4 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
            ${categoryBreakdown.list.slice(0, 4).map(item => `
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-2 text-slate-300">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color}"></span>
                  ${item.name}
                </span>
                <span class="font-mono font-bold text-slate-200">${FORMATTERS.formatCurrency(item.amount)} (${item.percentage.toFixed(0)}%)</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Gráfico 2: Receitas vs Despesas (Bar Chart 6 Meses) -->
        <div class="card-fintech p-6 lg:col-span-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="bar-chart-3" class="w-4 h-4 text-emerald-400"></i> Receitas vs Despesas (Histórico)
            </h3>
            <span class="text-[11px] text-slate-400">Últimos 6 Meses</span>
          </div>

          <div class="relative h-64 w-full">
            <canvas id="chartCashflowHistory"></canvas>
          </div>
        </div>
      </div>

      <!-- Seção: "Meu Mês" & Gastos Diários -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card Resumo "Meu Mês" -->
        <div class="card-fintech p-6 lg:col-span-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500/20">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <h3 class="text-sm font-bold text-white">Visão "Meu Mês"</h3>
          </div>

          <div class="space-y-3 divide-y divide-slate-800/80 text-xs">
            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-400">Total Recebido:</span>
              <span class="font-mono font-bold text-emerald-400">${FORMATTERS.formatCurrency(metrics.currentIncome)}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-400">Total Gasto:</span>
              <span class="font-mono font-bold text-red-400">${FORMATTERS.formatCurrency(metrics.currentExpense)}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-400">Economizado no Mês:</span>
              <span class="font-mono font-bold text-white">${FORMATTERS.formatCurrency(metrics.currentSavings)}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-400">Taxa de Poupança:</span>
              <span class="font-mono font-bold text-emerald-400">${metrics.savingsRate.toFixed(1)}%</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-400">Saldo Previsto no Fim:</span>
              <span class="font-mono font-bold text-indigo-300">${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800">
            <button data-route="canibuy" class="sidebar-item w-full btn-secondary text-xs justify-center gap-2 py-2">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-400"></i> Simular "Posso Comprar?"
            </button>
          </div>
        </div>

        <!-- Gráfico 3: Gastos ao Longo do Mês (Picos por dia) -->
        <div class="card-fintech p-6 lg:col-span-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i> Gastos ao Longo do Mês (Dias com Maiores Despesas)
            </h3>
            <span class="text-[11px] text-slate-400">Identificação de Picos</span>
          </div>

          <div class="relative h-60 w-full">
            <canvas id="chartDailyExpenses"></canvas>
          </div>
        </div>
      </div>

      <!-- Últimas Transações Realizadas -->
      <div class="card-fintech p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="receipt" class="w-4 h-4 text-emerald-400"></i> Últimas Movimentações
          </h3>
          <button data-route="transactions" class="sidebar-item text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            Ver Todas &rarr;
          </button>
        </div>

        ${recentTransactions.length === 0 ? `
          <div class="text-center py-10">
            <p class="text-xs text-slate-400">Você ainda não registrou nenhuma movimentação.</p>
            <button id="btnEmptyAddTx" class="btn-primary text-xs mt-3">
              <i data-lucide="plus" class="w-4 h-4"></i> Adicionar Primeira Despesa
            </button>
          </div>
        ` : `
          <div class="divide-y divide-slate-800/80">
            ${recentTransactions.slice(0, 5).map(tx => `
              <div class="py-3 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} flex items-center justify-center">
                    <i data-lucide="${tx.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <p class="font-bold text-slate-200">${tx.description}</p>
                    <p class="text-[11px] text-slate-400">${FORMATTERS.formatDate(tx.date)} ${tx.establishment ? `• ${tx.establishment}` : ''}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}">
                    ${tx.type === 'income' ? '+' : '-'} ${FORMATTERS.formatCurrency(tx.amount)}
                  </p>
                  <p class="text-[10px] text-slate-400 uppercase">${tx.paymentMethod || 'Pix'}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
