// Visão do Dashboard Inovador Titanium & Obsidian - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderDashboardView(data) {
  const { metrics, categoryBreakdown, recentTransactions = [], anomalies = [], bills = [] } = data;

  const pendingBills = bills.filter(b => b.status === 'pending').slice(0, 3);

  const expenseDiffText = metrics.prevExpense > 0
    ? (metrics.expenseVarPercent <= 0
        ? `<span class="text-emerald-400 font-mono text-[11px]">↓ ${Math.abs(metrics.expenseVarPercent).toFixed(1)}% vs anterior</span>`
        : `<span class="text-rose-400 font-mono text-[11px]">↑ +${metrics.expenseVarPercent.toFixed(1)}% vs anterior</span>`)
    : '';

  return `
    <div class="space-y-7 animate-fade-in pb-12">
      <!-- Deck de Ações Rápidas Inovador (Command Strip) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button id="btnQuickAddHero" class="quick-action-pill bg-white text-zinc-950 font-semibold border-white hover:bg-zinc-200">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-zinc-950"></i> Lançar Movimentação
        </button>
        <button id="btnOpenImportModal" class="quick-action-pill">
          <i data-lucide="file-up" class="w-3.5 h-3.5 text-zinc-300"></i> Importar Extrato (PDF/OFX)
        </button>
        <button data-route="canibuy" class="sidebar-item quick-action-pill">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-400"></i> Posso Comprar?
        </button>
        <button data-route="fire" class="sidebar-item quick-action-pill">
          <i data-lucide="flame" class="w-3.5 h-3.5 text-amber-400"></i> Simulador FIRE
        </button>
        <button data-route="split" class="sidebar-item quick-action-pill">
          <i data-lucide="users" class="w-3.5 h-3.5 text-emerald-400"></i> Dividir Gastos
        </button>
        <button data-route="bills" class="sidebar-item quick-action-pill">
          <i data-lucide="receipt" class="w-3.5 h-3.5 text-rose-400"></i> Contas a Pagar
        </button>
      </div>

      <!-- Banner de Anomalia ou Destaque Financeiro -->
      ${anomalies.length > 0 ? `
        <div class="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between text-xs">
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-zinc-200 font-medium">${anomalies[0].message}</span>
          </div>
          <button data-route="ai_assistant" class="sidebar-item text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center gap-1">
            Analisar com IA &rarr;
          </button>
        </div>
      ` : ''}

      <!-- Hero Cockpit: Saldo Principal com Projeção e Taxa de Poupança -->
      <div class="card-minimal p-7 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative overflow-hidden">
        <div class="space-y-2 z-10">
          <div class="flex items-center gap-2">
            <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Patrimônio Líquido Disponível</span>
            <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">Em Tempo Real</span>
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-mono tracking-tight">
            ${FORMATTERS.formatCurrency(metrics.currentBalance)}
          </h1>
          <div class="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
            <span class="flex items-center gap-1.5">
              <i data-lucide="trending-up" class="w-3.5 h-3.5 text-emerald-400"></i>
              Previsão Fim do Mês: <strong class="text-zinc-200 font-mono">${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}</strong>
            </span>
            <span class="text-zinc-600">•</span>
            <span>Renda Comprometida: <strong class="text-zinc-200 font-mono">${metrics.committedIncomePercent.toFixed(1)}%</strong></span>
          </div>
        </div>

        <div class="flex items-center gap-3 z-10">
          <button data-route="budget" class="sidebar-item btn-secondary text-xs">
            <i data-lucide="pie-chart" class="w-3.5 h-3.5 text-indigo-400"></i> Orçamento 50/30/20
          </button>
          <button data-route="transactions" class="sidebar-item btn-primary text-xs">
            <i data-lucide="list" class="w-3.5 h-3.5"></i> Ver Lançamentos
          </button>
        </div>
      </div>

      <!-- Grid de Indicadores de Fluxo (Receitas, Despesas, Poupança Líquida) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Receitas -->
        <div class="card-minimal p-5 space-y-3">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Receitas do Mês</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(metrics.currentIncome)}</h3>
          <p class="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
            <span class="text-emerald-400 font-mono">${metrics.prevIncome > 0 ? `+${metrics.incomeVarPercent.toFixed(1)}%` : 'Entradas'}</span> vs mês anterior
          </p>
        </div>

        <!-- Despesas -->
        <div class="card-minimal p-5 space-y-3">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Despesas Totais</span>
            <div class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(metrics.currentExpense)}</h3>
          <p class="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
            ${expenseDiffText || '<span class="text-zinc-500 font-mono">Saídas do mês</span>'}
          </p>
        </div>

        <!-- Economia Líquida -->
        <div class="card-minimal p-5 space-y-3">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Economia Líquida</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <i data-lucide="wallet" class="w-4 h-4"></i>
            </div>
          </div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white font-mono ${metrics.currentSavings >= 0 ? 'text-white' : 'text-rose-400'}">
            ${FORMATTERS.formatCurrency(metrics.currentSavings)}
          </h3>
          <p class="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
            <span class="font-mono ${metrics.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}">${metrics.savingsRate.toFixed(1)}% de poupança</span>
          </p>
        </div>
      </div>

      <!-- Seção Central de Gráficos e Distribuição -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Gráfico de Fluxo Financeiro -->
        <div class="card-minimal p-6 lg:col-span-8 flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-zinc-400"></i> Histórico de Fluxo de Caixa
              </h3>
              <p class="text-[11px] text-zinc-500">Comparativo mês a mês dos últimos 6 meses</p>
            </div>
            <span class="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">Mensal</span>
          </div>
          <div class="relative h-64 w-full">
            <canvas id="chartCashflowHistory"></canvas>
          </div>
        </div>

        <!-- Gastos por Categoria com Donut & Legenda -->
        <div class="card-minimal p-6 lg:col-span-4 flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-zinc-400"></i> Distribuição
            </h3>
            <span class="text-[11px] font-mono text-zinc-400">Mês Atual</span>
          </div>

          <div class="relative h-44 flex items-center justify-center">
            <canvas id="chartCategoryDoughnut"></canvas>
          </div>

          <div class="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
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

      <!-- Próximos Vencimentos e Transações Recentes -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Movimentações Recentes -->
        <div class="card-minimal p-6 lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <i data-lucide="clock" class="w-4 h-4 text-zinc-400"></i> Movimentações Recentes
            </h3>
            <button data-route="transactions" class="sidebar-item text-xs text-zinc-400 hover:text-white flex items-center gap-1">
              Ver todas &rarr;
            </button>
          </div>

          ${recentTransactions.length === 0 ? `
            <p class="text-xs text-zinc-500 py-8 text-center">Nenhuma movimentação registrada.</p>
          ` : `
            <div class="divide-y divide-white/[0.04] text-xs">
              ${recentTransactions.slice(0, 5).map(tx => `
                <div class="py-3 flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                      <i data-lucide="${tx.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-4 h-4 ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-400'}"></i>
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

        <!-- Próximas Contas a Pagar (Acesso Rápido) -->
        <div class="card-minimal p-6 lg:col-span-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-zinc-400"></i> Próximos Vencimentos
            </h3>
            <button data-route="bills" class="sidebar-item text-xs text-zinc-400 hover:text-white">
              Gerenciar &rarr;
            </button>
          </div>

          ${pendingBills.length === 0 ? `
            <div class="py-8 text-center text-xs text-zinc-500">
              <p>Nenhuma conta pendente no momento.</p>
              <button data-route="bills" class="sidebar-item text-xs text-indigo-400 hover:underline mt-1 block mx-auto">
                + Cadastrar Conta a Pagar
              </button>
            </div>
          ` : `
            <div class="space-y-3">
              ${pendingBills.map(b => `
                <div class="p-3 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p class="font-medium text-zinc-200">${b.description}</p>
                    <p class="text-[11px] text-zinc-500 font-mono">Vence em ${FORMATTERS.formatDate(b.dueDate)}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-zinc-200">${FORMATTERS.formatCurrency(b.amount)}</span>
                    <button class="btn-mark-bill-paid btn-primary text-[10px] py-1 px-2" data-id="${b.id}">
                      Pagar
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
