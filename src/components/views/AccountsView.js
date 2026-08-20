// Visão de Minhas Contas e Transferências - Meu Financeiro IA

import { FORMATTERS, ACCOUNT_TYPES } from '../../config/constants.js';

export function renderAccountsView(data) {
  const { accounts = [] } = data;

  const totalConsolidated = accounts
    .filter(a => a.isActive !== false)
    .reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);

  const typeMap = new Map(ACCOUNT_TYPES.map(t => [t.id, t]));

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Header com Saldo Consolidado e Ações -->
      <div class="card-fintech p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-900/60 border-emerald-500/20">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Geral Consolidado</span>
          <h3 class="text-3xl font-extrabold text-white font-mono mt-1">${FORMATTERS.formatCurrency(totalConsolidated)}</h3>
          <p class="text-xs text-slate-400 mt-1">${accounts.length} contas cadastradas</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btnOpenTransferModal" class="btn-secondary text-xs py-2.5 px-4">
            <i data-lucide="arrow-right-left" class="w-4 h-4 text-blue-400"></i> Transferir entre Contas
          </button>
          <button id="btnOpenNewAccountModal" class="btn-primary text-xs py-2.5 px-4">
            <i data-lucide="plus" class="w-4 h-4"></i> Nova Conta
          </button>
        </div>
      </div>

      <!-- Grid de Contas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${accounts.length === 0 ? `
          <div class="col-span-full text-center py-12 card-fintech">
            <i data-lucide="wallet" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
            <p class="text-xs text-slate-400">Nenhuma conta cadastrada ainda.</p>
          </div>
        ` : accounts.map(acc => {
          const typeInfo = typeMap.get(acc.type) || { label: 'Conta', icon: 'wallet', color: '#3B82F6' };

          return `
            <div class="card-fintech p-5 flex flex-col justify-between relative overflow-hidden group">
              <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${acc.color || typeInfo.color}"></div>

              <div>
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background-color: ${acc.color || typeInfo.color}20; color: ${acc.color || typeInfo.color}">
                      <i data-lucide="${acc.icon || typeInfo.icon}" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-white">${acc.name}</h4>
                      <p class="text-[11px] text-slate-400">${acc.institution || typeInfo.label}</p>
                    </div>
                  </div>

                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    ${typeInfo.label}
                  </span>
                </div>

                <div class="mt-6">
                  <span class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Saldo Atual</span>
                  <h3 class="text-2xl font-extrabold font-mono tracking-tight ${Number(acc.currentBalance) >= 0 ? 'text-white' : 'text-red-400'}">
                    ${FORMATTERS.formatCurrency(acc.currentBalance)}
                  </h3>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Saldo Inicial: ${FORMATTERS.formatCurrency(acc.initialBalance)}</span>
                <button class="btn-delete-account text-slate-500 hover:text-red-400 p-1" data-id="${acc.id}" title="Excluir Conta">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
