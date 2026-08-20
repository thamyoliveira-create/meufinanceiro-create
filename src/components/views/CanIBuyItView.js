// Visão do Simulador "Posso Comprar?" - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';
import { FinanceEngine } from '../../services/financeEngine.js';

export function renderCanIBuyItView(data) {
  const { metrics, accounts = [] } = data;

  const currentBalance = metrics.currentBalance || 0;
  const monthlyIncome = metrics.currentIncome || 5000;
  const monthlyExpenses = metrics.currentExpense || 3500;

  // Simulação padrão inicial (ex: R$ 900 em 3x de R$ 300)
  const defaultSim = FinanceEngine.simulateCanIBuy({
    amount: 900,
    installments: 3,
    paymentMethod: 'credit',
    currentBalance,
    monthlyIncome,
    monthlyExpenses,
    futureInstallmentsCommitment: 380,
  });

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header do Simulador -->
      <div class="card-fintech p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/20 border-indigo-500/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Simulador Inteligente "Posso Comprar?"</h3>
            <p class="text-xs text-slate-400">Avalie matematicamente o impacto de uma nova compra no seu orçamento antes de passar o cartão</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Formulário de Simulação -->
        <div class="card-fintech p-6 lg:col-span-5 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="calculator" class="w-4 h-4 text-emerald-400"></i> Dados da Compra
          </h4>

          <form id="canIBuyForm" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Valor da Compra (R$)</label>
              <input type="number" step="0.01" id="simAmount" value="900" required class="input-fintech font-mono font-bold text-white text-sm">
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
              <select id="simPaymentMethod" class="input-fintech">
                <option value="credit">Cartão de Crédito</option>
                <option value="pix">Pix / À Vista em Conta</option>
                <option value="money">Dinheiro</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Número de Parcelas</label>
              <select id="simInstallments" class="input-fintech">
                <option value="1">1x (À vista na fatura)</option>
                <option value="2">2x</option>
                <option value="3" selected>3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
                <option value="10">10x</option>
                <option value="12">12x</option>
                <option value="24">24x</option>
              </select>
            </div>

            <button type="submit" class="w-full btn-primary text-xs justify-center py-2.5 mt-2">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i> Calcular Impacto Financeiro
            </button>
          </form>
        </div>

        <!-- Resultado da Avaliação Matemática -->
        <div class="card-fintech p-6 lg:col-span-7 flex flex-col justify-between" id="simResultContainer">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Classificação de Risco</span>
              <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400" id="simRiskBadge">
                ${defaultSim.impactTitle}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
              <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-slate-400">Valor da Parcela</span>
                <h5 class="text-base font-extrabold text-white font-mono mt-1" id="simInstallmentValue">
                  ${FORMATTERS.formatCurrency(defaultSim.installmentValue)}/mês
                </h5>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-slate-400">Renda Comprometida</span>
                <h5 class="text-base font-extrabold text-emerald-400 font-mono mt-1" id="simCommittedPercent">
                  ${defaultSim.newCommittedPercent.toFixed(1)}%
                </h5>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                <span class="text-[10px] uppercase font-bold text-slate-400">Sobra Mensal Estimada</span>
                <h5 class="text-base font-extrabold text-indigo-300 font-mono mt-1" id="simRemainingMargin">
                  ${FORMATTERS.formatCurrency(defaultSim.remainingMargin)}
                </h5>
              </div>
            </div>

            <!-- Explicação Matemática Objetiva -->
            <div class="space-y-2 pt-2">
              <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Justificativa Financeira:</h5>
              <div class="space-y-1.5 text-xs text-slate-300" id="simReasonsList">
                ${defaultSim.reasons.map(r => `
                  <div class="flex items-start gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"></i>
                    <span>${r}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            A decisão final é sua. O simulador apenas apresenta a matemática dos números para apoiar sua escolha.
          </div>
        </div>
      </div>
    </div>
  `;
}
