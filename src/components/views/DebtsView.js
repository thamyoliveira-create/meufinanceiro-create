// Visão de Minhas Dívidas e Simulador de Quitação - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderDebtsView(data) {
  const { debts = [], metrics } = data;

  const totalOwed = debts
    .filter(d => !d.isCleared)
    .reduce((sum, d) => sum + Number(d.currentBalance || 0), 0);

  const totalMonthlyPayments = debts
    .filter(d => !d.isCleared)
    .reduce((sum, d) => sum + Number(d.monthlyPayment || 0), 0);

  const debtIncomeRatio = metrics.currentIncome > 0 ? (totalMonthlyPayments / metrics.currentIncome) * 100 : 0;

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Indicadores de Dívida -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card-fintech p-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border-red-500/20">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Devido Atual</span>
          <h3 class="text-2xl font-extrabold text-red-400 font-mono mt-1">${FORMATTERS.formatCurrency(totalOwed)}</h3>
          <p class="text-[11px] text-slate-400 mt-1">${debts.filter(d => !d.isCleared).length} dívidas ativas</p>
        </div>

        <div class="card-fintech p-5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Parcelas Mensais</span>
          <h3 class="text-2xl font-extrabold text-white font-mono mt-1">${FORMATTERS.formatCurrency(totalMonthlyPayments)}</h3>
          <p class="text-[11px] text-slate-400 mt-1">Impacto fixo mensal</p>
        </div>

        <div class="card-fintech p-5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">% Renda Comprometida</span>
          <h3 class="text-2xl font-extrabold font-mono mt-1 ${debtIncomeRatio > 30 ? 'text-red-400' : 'text-emerald-400'}">${debtIncomeRatio.toFixed(1)}%</h3>
          <p class="text-[11px] text-slate-400 mt-1">${debtIncomeRatio > 30 ? 'Atenção aos juros' : 'Dentro do limite'}</p>
        </div>
      </div>

      <!-- Simulador e Estratégia de Quitação (Avalanche vs Bola de Neve) -->
      <div class="card-fintech p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border-indigo-500/30 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Simulador Estratégico de Quitação de Dívidas</h3>
            <p class="text-xs text-slate-400">Compare métodos matemáticos para eliminar dívidas mais rápido</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <!-- Método 1: Avalanche (Matematicamente Ótimo) -->
          <div class="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/40 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Método Avalanche (Menos Juros)</h4>
              <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Mais Econômico</span>
            </div>
            <p class="text-xs text-slate-300">Prioriza quitar primeiro as dívidas com a <strong>maior taxa de juros mensal</strong>, reduzindo o total pago ao banco.</p>
            <div class="pt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Economiza o máximo em juros compostos.
            </div>
          </div>

          <!-- Método 2: Bola de Neve (Psicologicamente Eficaz) -->
          <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Método Bola de Neve (Motivação)</h4>
              <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Rápido Alívio</span>
            </div>
            <p class="text-xs text-slate-300">Prioriza quitar as dívidas de <strong>menor saldo total</strong> primeiro, liberando boletos e parcelas do mês mais rápido.</p>
            <div class="pt-2 text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Reduz o número de credores rapidamente.
            </div>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 italic pt-1">
          * Nota de Transparência: Este simulador apresenta estimativas matemáticas. Não substitui acordos formais nem constitui promessa de rentabilidade ou perdão de dívidas.
        </p>
      </div>

      <!-- Lista de Dívidas -->
      <div class="card-fintech p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Contratos e Financiamentos Cadastrados</h3>
          <button id="btnOpenNewDebtModal" class="btn-primary text-xs py-2 px-3">
            <i data-lucide="plus" class="w-4 h-4"></i> Cadastrar Dívida
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th class="py-3 px-4">Dívida / Instituição</th>
                <th class="py-3 px-4">Taxa Juros</th>
                <th class="py-3 px-4">Parcela Mensal</th>
                <th class="py-3 px-4">Restantes</th>
                <th class="py-3 px-4 text-right">Saldo Devedor</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${debts.length === 0 ? `
                <tr><td colspan="6" class="py-8 text-center text-slate-500">Nenhuma dívida cadastrada. Parabéns!</td></tr>
              ` : debts.map(d => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3 px-4">
                    <p class="font-bold text-slate-200">${d.name}</p>
                    <p class="text-[11px] text-slate-400">${d.institution || 'Geral'}</p>
                  </td>
                  <td class="py-3 px-4 font-mono font-semibold text-amber-400">${d.interestRateMonthly || 0}% a.m.</td>
                  <td class="py-3 px-4 font-mono text-slate-300">${FORMATTERS.formatCurrency(d.monthlyPayment)}</td>
                  <td class="py-3 px-4 font-mono text-slate-400">${d.remainingInstallments || 0}x</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-red-400">${FORMATTERS.formatCurrency(d.currentBalance)}</td>
                  <td class="py-3 px-4 text-center">
                    <button class="btn-delete-debt text-slate-500 hover:text-red-400 p-1" data-id="${d.id}">
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
