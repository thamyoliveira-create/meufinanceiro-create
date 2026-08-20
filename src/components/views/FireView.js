// Visão do Simulador FIRE e Independência Financeira - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';
import { FireEngine } from '../../services/fireEngine.js';

export function renderFireView(data) {
  const { metrics } = data;

  const currentInvested = metrics.totalInvested || 15000;
  const estimatedMonthlyCost = metrics.currentExpense || 4500;

  const defaultFire = FireEngine.calculateFireProjection({
    currentAge: 28,
    monthlyCostTarget: estimatedMonthlyCost,
    currentInvested,
    monthlyContribution: 1200,
    realAnnualReturnRate: 7,
  });

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header FIRE -->
      <div class="card-minimal p-6 sm:p-8 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
            <i data-lucide="flame" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Simulador FIRE & Independência Financeira</h3>
            <p class="text-xs text-zinc-400">Calcule com precisão matemática quando você poderá viver de renda passiva</p>
          </div>
        </div>
      </div>

      <!-- Grid Principal: Formulário vs Projeção -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Parâmetros de Simulação -->
        <div class="card-minimal p-6 lg:col-span-5 space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-400">Parâmetros Pessoais</h4>

          <form id="fireForm" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-medium text-zinc-300 mb-1">Sua Idade Atual</label>
              <input type="number" id="fireAgeInput" value="28" min="16" max="90" class="input-fintech font-mono">
            </div>

            <div>
              <label class="block font-medium text-zinc-300 mb-1">Renda Passiva Desejada na Aposentadoria (R$/mês)</label>
              <input type="number" step="100" id="fireCostInput" value="${estimatedMonthlyCost}" class="input-fintech font-mono font-bold text-white">
            </div>

            <div>
              <label class="block font-medium text-zinc-300 mb-1">Patrimônio Atual Investido (R$)</label>
              <input type="number" step="500" id="fireInvestedInput" value="${currentInvested}" class="input-fintech font-mono">
            </div>

            <div>
              <label class="block font-medium text-zinc-300 mb-1">Aporte Mensal Previsto (R$/mês)</label>
              <input type="number" step="100" id="fireContributionInput" value="1200" class="input-fintech font-mono font-bold text-emerald-400">
            </div>

            <div>
              <label class="block font-medium text-zinc-300 mb-1">Rentabilidade Real Esperada (% a.a. acima da inflação)</label>
              <select id="fireReturnRateInput" class="input-fintech font-mono">
                <option value="5">5% a.a. (Conservador / Renda Fixa Real)</option>
                <option value="7" selected>7% a.a. (Moderado / Carteira Diversificada)</option>
                <option value="9">9% a.a. (Agressivo / Ações e FIIs)</option>
              </select>
            </div>

            <button type="submit" class="w-full btn-primary text-xs justify-center py-2.5 mt-2">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i> Recalcular Independência
            </button>
          </form>
        </div>

        <!-- Resultado do Número FIRE e Meta -->
        <div class="card-minimal p-6 lg:col-span-7 flex flex-col justify-between" id="fireResultContainer">
          <div class="space-y-6">
            <!-- Headline do Número FIRE -->
            <div class="p-5 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Seu Número FIRE (Patrimônio Alvo)</span>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight" id="fireTargetNumber">
                ${FORMATTERS.formatCurrency(defaultFire.fireTargetNumber)}
              </h2>
              <p class="text-xs text-zinc-400">
                Garante uma renda passiva perpétua de <strong class="text-zinc-200 font-mono" id="firePassiveIncome">${FORMATTERS.formatCurrency(defaultFire.passiveMonthlyIncome)}/mês</strong> pela Regra dos 4%.
              </p>
            </div>

            <!-- Indicadores Chave -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Tempo Estimado</span>
                <h4 class="text-lg font-bold text-white font-mono mt-1" id="fireYears">
                  ${defaultFire.yearsToFire} anos
                </h4>
              </div>

              <div class="p-3.5 rounded-xl bg-zinc-950 border border-white/5">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Idade na Liberdade</span>
                <h4 class="text-lg font-bold text-emerald-400 font-mono mt-1" id="fireTargetAge">
                  ${defaultFire.fireAge} anos
                </h4>
              </div>

              <div class="p-3.5 rounded-xl bg-zinc-950 border border-white/5 col-span-2 sm:col-span-1">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Progresso Atual</span>
                <h4 class="text-lg font-bold text-zinc-200 font-mono mt-1" id="fireProgress">
                  ${defaultFire.progressPercent.toFixed(1)}%
                </h4>
              </div>
            </div>

            <!-- Barra de Progresso FIRE -->
            <div class="space-y-1.5">
              <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div id="fireProgressBar" class="h-full bg-emerald-400 rounded-full transition-all duration-300" style="width: ${defaultFire.progressPercent}%"></div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/[0.06] text-[11px] text-zinc-500">
            * Cálculo baseado na Teoria do Trinity Study com taxa de retirada segura de 4% ao ano corrigida pela inflação.
          </div>
        </div>
      </div>
    </div>
  `;
}
