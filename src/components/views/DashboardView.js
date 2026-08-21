// Visão do Dashboard Windows 98 com Alto Contraste e Legibilidade - Meu Financeiro 98

import { FORMATTERS } from '../../config/constants.js';

export function renderDashboardView(data) {
  const { metrics, categoryBreakdown, recentTransactions = [], anomalies = [], bills = [] } = data;

  const pendingBills = bills.filter(b => b.status === 'pending').slice(0, 3);

  const expenseDiffText = metrics.prevExpense > 0
    ? (metrics.expenseVarPercent <= 0
        ? `<span class="text-[#006600] font-bold">↓ ${Math.abs(metrics.expenseVarPercent).toFixed(1)}% vs anterior</span>`
        : `<span class="text-[#aa0000] font-bold">↑ +${metrics.expenseVarPercent.toFixed(1)}% vs anterior</span>`)
    : '';

  return `
    <div class="space-y-4 animate-fade-in text-black">
      <!-- Deck de Ferramentas e Ações Rápidas -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button id="btnQuickAddHero" class="win-btn font-bold">
          <span>➕</span> <span>Lançar Movimentação</span>
        </button>
        <button class="win-btn btn-open-import-modal" title="Importar Extrato">
          <span>📁</span> <span>Importar Extrato (PDF/OFX)</span>
        </button>
        <button data-route="canibuy" class="sidebar-item win-btn">
          <span>🤖</span> <span>Posso Comprar?</span>
        </button>
        <button data-route="fire" class="sidebar-item win-btn">
          <span>🔥</span> <span>Calculadora FIRE</span>
        </button>
        <button data-route="split" class="sidebar-item win-btn">
          <span>👥</span> <span>Dividir Gastos</span>
        </button>
        <button data-route="bills" class="sidebar-item win-btn">
          <span>🧾</span> <span>Contas a Pagar</span>
        </button>
      </div>

      <!-- Banner de Alerta / Anomalia se houver -->
      ${anomalies.length > 0 ? `
        <div class="p-3 bg-[#ffffcc] border-2 border-[#808080] flex items-center justify-between text-xs text-black">
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-amber-700">⚠️</span>
            <span class="font-bold">${anomalies[0].message}</span>
          </div>
          <button data-route="ai_assistant" class="sidebar-item win-btn py-0.5 px-2 text-[11px]">
            Ver com Assistente &rarr;
          </button>
        </div>
      ` : ''}

      <!-- Painel Principal de Saldo (Hero Box 98) -->
      <div class="win-outset p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase font-bold text-zinc-700 tracking-wider">Patrimônio Líquido Disponível:</span>
            <span class="text-[10px] bg-green-100 text-[#006600] border border-[#006600] px-1.5 py-0.2 font-bold font-mono">Tempo Real</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-black font-mono tracking-tight">
            ${FORMATTERS.formatCurrency(metrics.currentBalance)}
          </h1>
          <div class="flex flex-wrap items-center gap-3 text-xs text-zinc-800 font-medium pt-1">
            <span>Previsão Fim do Mês: <strong class="font-mono text-black">${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}</strong></span>
            <span>•</span>
            <span>Renda Comprometida: <strong class="font-mono text-black">${metrics.committedIncomePercent.toFixed(1)}%</strong></span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button data-route="budget" class="sidebar-item win-btn font-bold">
            <span>⚖️</span> <span>Orçamento 50/30/20</span>
          </button>
          <button data-route="transactions" class="sidebar-item win-btn font-bold">
            <span>📝</span> <span>Ver Extrato Completo</span>
          </button>
        </div>
      </div>

      <!-- Grid de Indicadores (Receitas, Despesas, Poupança Líquida) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Receitas -->
        <div class="win-outset p-3.5 space-y-2">
          <div class="flex items-center justify-between font-bold text-xs">
            <span class="text-[#006600]">Entradas / Receitas</span>
            <span>📥</span>
          </div>
          <h3 class="text-2xl font-extrabold text-[#006600] font-mono">${FORMATTERS.formatCurrency(metrics.currentIncome)}</h3>
          <p class="text-[11px] text-zinc-700 font-medium">
            <strong class="text-[#006600]">${metrics.prevIncome > 0 ? `+${metrics.incomeVarPercent.toFixed(1)}%` : 'Total'}</strong> vs mês anterior
          </p>
        </div>

        <!-- Despesas -->
        <div class="win-outset p-3.5 space-y-2">
          <div class="flex items-center justify-between font-bold text-xs">
            <span class="text-[#aa0000]">Saídas / Despesas</span>
            <span>📤</span>
          </div>
          <h3 class="text-2xl font-extrabold text-[#aa0000] font-mono">${FORMATTERS.formatCurrency(metrics.currentExpense)}</h3>
          <p class="text-[11px] text-zinc-700 font-medium">
            ${expenseDiffText || '<span>Total gasto no mês</span>'}
          </p>
        </div>

        <!-- Economia Líquida -->
        <div class="win-outset p-3.5 space-y-2">
          <div class="flex items-center justify-between font-bold text-xs">
            <span class="text-[#000080]">Economia do Mês</span>
            <span>💰</span>
          </div>
          <h3 class="text-2xl font-extrabold text-[#000080] font-mono">
            ${FORMATTERS.formatCurrency(metrics.currentSavings)}
          </h3>
          <p class="text-[11px] text-zinc-700 font-medium">
            <strong class="font-mono text-black">${metrics.savingsRate.toFixed(1)}%</strong> da renda guardada
          </p>
        </div>
      </div>

      <!-- Seção de Gráficos e Distribuição -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <!-- Gráfico de Fluxo de Caixa -->
        <div class="win-outset p-4 lg:col-span-8 flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
            <h3 class="text-xs font-bold text-black flex items-center gap-1.5">
              <span>📈</span> <span>Histórico de Fluxo Financeiro (Últimos 6 Meses)</span>
            </h3>
            <span class="text-[10px] font-mono font-bold">Mensal</span>
          </div>
          <div class="relative h-60 w-full win-inset p-1 bg-white">
            <canvas id="chartCashflowHistory"></canvas>
          </div>
        </div>

        <!-- Distribuição por Categoria -->
        <div class="win-outset p-4 lg:col-span-4 flex flex-col justify-between space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
            <h3 class="text-xs font-bold text-black flex items-center gap-1.5">
              <span>🥧</span> <span>Categorias</span>
            </h3>
            <span class="text-[10px] font-mono font-bold">Mês Atual</span>
          </div>

          <div class="relative h-40 flex items-center justify-center win-inset p-1 bg-white">
            <canvas id="chartCategoryDoughnut"></canvas>
          </div>

          <div class="space-y-1.5 max-h-32 overflow-y-auto win-inset p-2 bg-white text-xs">
            ${categoryBreakdown.list.slice(0, 4).map(item => `
              <div class="flex items-center justify-between py-0.5">
                <span class="flex items-center gap-1.5 font-medium text-black">
                  <span class="w-2.5 h-2.5 inline-block border border-black" style="background-color: ${item.color || '#808080'}"></span>
                  ${item.name}
                </span>
                <span class="font-mono text-black font-bold">${FORMATTERS.formatCurrency(item.amount)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Próximos Vencimentos e Transações Recentes -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <!-- Movimentações Recentes -->
        <div class="win-outset p-4 lg:col-span-7 space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
            <h3 class="text-xs font-bold text-black flex items-center gap-1.5">
              <span>⏱️</span> <span>Últimos Lançamentos</span>
            </h3>
            <button data-route="transactions" class="sidebar-item win-btn text-[10px] py-0.5 px-1.5">
              Ver Todos &rarr;
            </button>
          </div>

          ${recentTransactions.length === 0 ? `
            <p class="text-xs text-zinc-600 py-6 text-center">Nenhuma movimentação registrada.</p>
          ` : `
            <div class="win-inset bg-white divide-y divide-zinc-300 text-xs">
              ${recentTransactions.slice(0, 5).map(tx => `
                <div class="p-2 flex items-center justify-between hover:bg-[#000080] hover:text-white group">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">${tx.type === 'income' ? '📥' : '📤'}</span>
                    <div>
                      <p class="font-bold text-black group-hover:text-white">${tx.description}</p>
                      <p class="text-[10px] text-zinc-600 group-hover:text-zinc-200">${FORMATTERS.formatDate(tx.date)} ${tx.establishment ? `• ${tx.establishment}` : ''}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-mono font-bold ${tx.type === 'income' ? 'text-[#006600] group-hover:text-green-300' : 'text-[#aa0000] group-hover:text-red-200'}">
                      ${tx.type === 'income' ? '+' : '-'} ${FORMATTERS.formatCurrency(tx.amount)}
                    </p>
                    <p class="text-[9px] uppercase font-mono text-zinc-500 group-hover:text-zinc-300">${tx.paymentMethod || 'Pix'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Próximos Vencimentos -->
        <div class="win-outset p-4 lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-400 pb-1">
            <h3 class="text-xs font-bold text-black flex items-center gap-1.5">
              <span>📅</span> <span>Contas a Pagar (Vencimentos)</span>
            </h3>
            <button data-route="bills" class="sidebar-item win-btn text-[10px] py-0.5 px-1.5">
              Gerenciar &rarr;
            </button>
          </div>

          ${pendingBills.length === 0 ? `
            <div class="py-6 text-center text-xs text-zinc-600 win-inset bg-white p-3">
              <p>Nenhuma conta pendente no momento.</p>
              <button data-route="bills" class="sidebar-item win-btn mt-2 text-xs">
                + Cadastrar Conta a Pagar
              </button>
            </div>
          ` : `
            <div class="space-y-2 win-inset bg-white p-2">
              ${pendingBills.map(b => `
                <div class="p-2 bg-[#f0f0f0] border border-zinc-300 flex items-center justify-between text-xs">
                  <div>
                    <p class="font-bold text-black">${b.description}</p>
                    <p class="text-[10px] text-zinc-600 font-mono">Vence: ${FORMATTERS.formatDate(b.dueDate)}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-[#aa0000]">${FORMATTERS.formatCurrency(b.amount)}</span>
                    <button class="btn-mark-bill-paid win-btn py-0.5 px-2 text-[10px] font-bold" data-id="${b.id}">
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
