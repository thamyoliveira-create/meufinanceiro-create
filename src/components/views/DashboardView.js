// Visão do Dashboard Ultra-Minimalista - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderDashboardView(data) {
  const { metrics, categoryBreakdown, recentTransactions = [], anomalies = [] } = data;

  const expenseDiffText = metrics.prevExpense > 0
    ? (metrics.expenseVarPercent <= 0
        ? `<span class="text-emerald-400 font-mono text-[11px]">↓ ${Math.abs(metrics.expenseVarPercent).toFixed(1)}% vs anterior</span>`
        : `<span class="text-zinc-400 font-mono text-[11px]">↑ +${metrics.expenseVarPercent.toFixed(1)}% vs anterior</span>`)
    : '';

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Banner de Anomalia Discreto se houver -->
      ${anomalies.length > 0 ? `
        <div class="p-3.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="text-zinc-200">${anomalies[0].message}</span>
          </div>
          <button data-route="ai_assistant" class="sidebar-item text-zinc-400 hover:text-white underline text-[11px]">
            Detalhes IA
          </button>
        </div>
      ` : ''}

      <!-- Hero Minimalista: Saldo Principal -->
      <div class="card-minimal p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span class="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Patrimônio Líquido Disponível</span>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight mt-2">
            ${FORMATTERS.formatCurrency(metrics.currentBalance)}
          </h1>
          <p class="text-xs text-zinc-400 mt-2 flex items-center gap-2">
            <span>Projeção para o fim do mês:</span>
            <strong class="text-zinc-200 font-mono">${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}</strong>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button data-route="canibuy" class="sidebar-item btn-secondary text-xs">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-400"></i> Posso Comprar?
          </button>
          <button id="btnQuickAddHero" class="btn-primary text-xs">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Lançar Gasto
          </button>
        </div>
      </div>

      <!-- Grid de Indicadores Secundários -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Receitas -->
        <div class="card-minimal p-5">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Receitas do Mês</span>
            <i data-lucide="arrow-down-left" class="w-4 h-4 text-emerald-400"></i>
          </div>
          <h3 class="text-2xl font-bold text-white font-mono mt-3">${FORMATTERS.formatCurrency(metrics.currentIncome)}</h3>
          <p class="text-[11px] text-zinc-500 mt-1">${metrics.prevIncome > 0 ? `+${metrics.incomeVarPercent.toFixed(1)}% vs anterior` : 'Mês atual'}</p>
        </div>

        <!-- Despesas -->
        <div class="card-minimal p-5">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Despesas do Mês</span>
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-zinc-400"></i>
          </div>
          <h3 class="text-2xl font-bold text-white font-mono mt-3">${FORMATTERS.formatCurrency(metrics.currentExpense)}</h3>
          <p class="text-[11px] text-zinc-500 mt-1">${expenseDiffText || 'Mês atual'}</p>
        </div>

        <!-- Economia -->
        <div class="card-minimal p-5">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Economia Líquida</span>
            <span class="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-300">${metrics.savingsRate.toFixed(1)}% taxa</span>
          </div>
          <h3 class="text-2xl font-bold text-white font-mono mt-3">${FORMATTERS.formatCurrency(metrics.currentSavings)}</h3>
          <p class="text-[11px] text-zinc-500 mt-1">Renda comprometida: ${metrics.committedIncomePercent.toFixed(1)}%</p>
        </div>
      </div>

      <!-- Seção Central de Gráficos Minimalistas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Gráfico Histórico -->
        <div class="card-minimal p-6 lg:col-span-8 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-semibold text-white">Fluxo Financeiro</h3>
              <p class="text-[11px] text-zinc-500">Histórico de receitas vs despesas nos últimos 6 meses</p>
            </div>
          </div>
          <div class="relative h-64 w-full">
            <canvas id="chartCashflowHistory"></canvas>
          </div>
        </div>

        <!-- Gastos por Categoria -->
        <div class="card-minimal p-6 lg:col-span-4 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-white">Distribuição</h3>
            <span class="text-[11px] font-mono text-zinc-500">Mês Atual</span>
          </div>

          <div class="relative h-44 flex items-center justify-center">
            <canvas id="chartCategoryDoughnut"></canvas>
          </div>

          <div class="mt-4 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
            ${categoryBreakdown.list.slice(0, 4).map(item => `
              <div class="flex items-center justify-between text-xs py-0.5">
                <span class="flex items-center gap-2 text-zinc-400">
                  <span class="w-2 h-2 rounded-full" style="background-color: ${item.color || '#A1A1AA'}"></span>
                  ${item.name}
                </span>
                <span class="font-mono text-zinc-200 font-medium">${FORMATTERS.formatCurrency(item.amount)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Linha de Atividades Recentes e Indicadores -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Transações Recentes -->
        <div class="card-minimal p-6 lg:col-span-8 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white">Movimentações Recentes</h3>
            <button data-route="transactions" class="sidebar-item text-xs text-zinc-400 hover:text-white">
              Ver todas &rarr;
            </button>
          </div>

          ${recentTransactions.length === 0 ? `
            <p class="text-xs text-zinc-500 py-6 text-center">Nenhuma movimentação registrada neste mês.</p>
          ` : `
            <div class="divide-y divide-white/[0.04] text-xs">
              ${recentTransactions.slice(0, 5).map(tx => `
                <div class="py-3 flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                      <i data-lucide="${tx.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <p class="font-medium text-zinc-200">${tx.description}</p>
                      <p class="text-[11px] text-zinc-500">${FORMATTERS.formatDate(tx.date)} ${tx.establishment ? `• ${tx.establishment}` : ''}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}">
                      ${tx.type === 'income' ? '+' : '-'} ${FORMATTERS.formatCurrency(tx.amount)}
                    </p>
                    <p class="text-[10px] text-zinc-500 uppercase">${tx.paymentMethod || 'Pix'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Visão Rápida Patrimônio e Dívidas -->
        <div class="card-minimal p-6 lg:col-span-4 space-y-5">
          <h3 class="text-sm font-semibold text-white">Balanço Consolidado</h3>

          <div class="space-y-3 divide-y divide-white/[0.04] text-xs">
            <div class="flex justify-between items-center pt-2">
              <span class="text-zinc-400">Investimentos Totais:</span>
              <span class="font-mono font-semibold text-zinc-200">${FORMATTERS.formatCurrency(metrics.totalInvested)}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-zinc-400">Dívidas em Aberto:</span>
              <span class="font-mono font-semibold text-zinc-400">${FORMATTERS.formatCurrency(metrics.totalDebts)}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-zinc-400">Contas Pendentes:</span>
              <span class="font-mono font-semibold text-zinc-400">${FORMATTERS.formatCurrency(metrics.pendingBills)}</span>
            </div>
          </div>

          <div class="pt-2">
            <button data-route="networth" class="sidebar-item w-full btn-secondary text-xs justify-center py-2">
              Ver Balanço Patrimonial
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
