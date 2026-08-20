// Visão de Metas Financeiras e Reserva de Emergência - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';
import { FinanceEngine } from '../../services/financeEngine.js';

export function renderGoalsView(data) {
  const { goals = [], metrics } = data;

  const estimatedMonthlyCost = metrics.currentExpense || 3500;
  const currentEmergencySaved = goals.find(g => g.category === 'emergency')?.currentAmount || 0;

  const emergencyCalc = FinanceEngine.calculateEmergencyFund(estimatedMonthlyCost, currentEmergencySaved);

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Seção 1: Calculadora de Reserva de Emergência -->
      <div class="card-fintech p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/30">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Calculadora de Reserva de Emergência</h3>
            <p class="text-xs text-slate-400">Proteção financeira baseada no seu custo de vida mensal real</p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs text-slate-400">Custo Médio Mensal Atual:</span>
            <h4 class="text-xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(estimatedMonthlyCost)}</h4>
          </div>
          <div>
            <span class="text-xs text-slate-400">Total Já Guardado em Reserva:</span>
            <h4 class="text-xl font-extrabold text-emerald-400 font-mono">${FORMATTERS.formatCurrency(currentEmergencySaved)}</h4>
          </div>
        </div>

        <!-- 3 Cenários da Reserva -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${emergencyCalc.scenarios.map(sc => `
            <div class="p-4 rounded-2xl bg-slate-900/80 border ${sc.months === 6 ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-800'} flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">${sc.months} Meses</span>
                  ${sc.months === 6 ? '<span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Recomendado</span>' : ''}
                </div>
                <h4 class="text-xl font-extrabold text-white font-mono mt-2">${FORMATTERS.formatCurrency(sc.target)}</h4>
                <p class="text-[11px] text-slate-400 mt-1">${sc.label}</p>
              </div>

              <div class="mt-5 space-y-2">
                <div class="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>${sc.progress.toFixed(1)}%</span>
                  <span>Faltam ${FORMATTERS.formatCurrency(sc.remaining)}</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full rounded-full bg-emerald-500 transition-all duration-300" style="width: ${sc.progress}%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Seção 2: Todas as Metas Financeiras -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white">Minhas Metas Financeiras</h3>
            <p class="text-xs text-slate-400">Acompanhe seu progresso e o valor mensal recomendado</p>
          </div>
          <button id="btnOpenNewGoalModal" class="btn-primary text-xs py-2.5 px-4">
            <i data-lucide="plus" class="w-4 h-4"></i> Nova Meta
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${goals.length === 0 ? `
            <div class="col-span-full text-center py-12 card-fintech">
              <i data-lucide="target" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
              <p class="text-xs text-slate-400">Nenhuma meta criada ainda. Crie sua primeira meta financeira!</p>
            </div>
          ` : goals.map(goal => {
            const target = Number(goal.targetAmount || 0);
            const current = Number(goal.currentAmount || 0);
            const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            const remaining = Math.max(0, target - current);

            // Calcula meses restantes e recomendação mensal
            let monthlyRec = 'N/A';
            if (goal.deadline) {
              const deadlineDate = new Date(goal.deadline);
              const now = new Date();
              const monthsLeft = Math.max(1, (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth()));
              monthlyRec = FORMATTERS.formatCurrency(remaining / monthsLeft) + '/mês';
            }

            return `
              <div class="card-fintech p-5 flex flex-col justify-between relative overflow-hidden group">
                <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${goal.color || '#10B981'}"></div>

                <div>
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background-color: ${goal.color || '#10B981'}20; color: ${goal.color || '#10B981'}">
                        <i data-lucide="${goal.icon || 'target'}" class="w-5 h-5"></i>
                      </div>
                      <div>
                        <h4 class="text-sm font-bold text-white">${goal.name}</h4>
                        <p class="text-[11px] text-slate-400">Prazo: ${FORMATTERS.formatDate(goal.deadline) || 'Sem prazo'}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 space-y-1">
                    <div class="flex items-baseline justify-between">
                      <h3 class="text-xl font-extrabold text-white font-mono">${FORMATTERS.formatCurrency(current)}</h3>
                      <span class="text-xs text-slate-400 font-mono">de ${FORMATTERS.formatCurrency(target)}</span>
                    </div>

                    <div class="space-y-1.5 pt-2">
                      <div class="flex justify-between text-[11px] text-slate-400">
                        <span>Progresso: <strong>${progress.toFixed(1)}%</strong></span>
                        <span>Faltam ${FORMATTERS.formatCurrency(remaining)}</span>
                      </div>
                      <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-300" style="background-color: ${goal.color || '#10B981'}; width: ${progress}%"></div>
                      </div>
                    </div>
                  </div>

                  ${goal.deadline ? `
                    <div class="mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span class="text-slate-400">Aporte Recomendado:</span>
                      <strong class="text-emerald-400 font-mono">${monthlyRec}</strong>
                    </div>
                  ` : ''}
                </div>

                <div class="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button class="btn-add-goal-funds btn-secondary text-xs py-1 px-2.5" data-id="${goal.id}">
                    <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-emerald-400"></i> Guardar Dinheiro
                  </button>
                  <button class="btn-delete-goal text-slate-500 hover:text-red-400 p-1" data-id="${goal.id}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
