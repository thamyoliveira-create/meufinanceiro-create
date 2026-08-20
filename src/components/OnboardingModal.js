// Modal de Onboarding Guiado - Meu Financeiro IA

export function renderOnboardingModal() {
  return `
    <div id="onboardingModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i data-lucide="sparkles" class="w-5 h-5 text-slate-950 font-bold"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Bem-vindo ao Meu Financeiro IA!</h3>
              <p class="text-xs text-slate-400">Vamos configurar sua vida financeira em poucos passos</p>
            </div>
          </div>
          <button id="btnSkipOnboarding" class="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1">
            Pular
          </button>
        </div>

        <!-- Conteúdo com Steps -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <!-- Step 1: Renda e Custo de Vida -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">1</span>
              Renda Mensal e Custo de Vida
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Qual é sua renda mensal aproximada?</label>
                <input type="number" step="100" id="onbIncome" placeholder="Ex: 5000,00" class="input-fintech">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Custo de vida médio estimado?</label>
                <input type="number" step="100" id="onbMonthlyCost" placeholder="Ex: 3500,00" class="input-fintech">
              </div>
            </div>
          </div>

          <!-- Step 2: Conta Bancária Principal -->
          <div class="space-y-4 pt-4 border-t border-slate-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
              Sua Conta Principal
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Nome do Banco / Carteira</label>
                <input type="text" id="onbAccountName" placeholder="Ex: Nubank, Itaú, Inter" class="input-fintech">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Saldo Inicial Atual (R$)</label>
                <input type="number" step="0.01" id="onbAccountBalance" placeholder="Ex: 1500,00" class="input-fintech">
              </div>
            </div>
          </div>

          <!-- Step 3: Cartão de Crédito (Opcional) -->
          <div class="space-y-4 pt-4 border-t border-slate-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
              Cartão de Crédito (Opcional)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Nome do Cartão</label>
                <input type="text" id="onbCardName" placeholder="Ex: Nubank Mastercard" class="input-fintech">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Limite do Cartão (R$)</label>
                <input type="number" step="100" id="onbCardLimit" placeholder="Ex: 8000,00" class="input-fintech">
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <p class="text-[11px] text-slate-400">Você poderá editar ou adicionar mais dados a qualquer momento.</p>
          <button id="btnSaveOnboarding" class="btn-primary text-xs">
            <i data-lucide="check" class="w-4 h-4"></i> Concluir e Iniciar
          </button>
        </div>
      </div>
    </div>
  `;
}
