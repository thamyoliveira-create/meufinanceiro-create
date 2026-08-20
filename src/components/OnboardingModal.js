// Modal de Onboarding Guiado Minimalista - Meu Financeiro IA

export function renderOnboardingModal() {
  return `
    <div id="onboardingModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
              <i data-lucide="sparkles" class="w-4 h-4 stroke-[2.5]"></i>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Configuração Inicial</h3>
              <p class="text-[11px] text-zinc-400">Personalize seu ambiente financeiro em 1 minuto</p>
            </div>
          </div>
          <button id="btnSkipOnboarding" class="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors">
            Pular
          </button>
        </div>

        <!-- Conteúdo com Steps -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          <!-- Step 1: Renda e Custo de Vida -->
          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-white flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">1</span>
              Renda Mensal e Custo de Vida
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Renda mensal média (R$)</label>
                <input type="number" step="100" id="onbIncome" placeholder="5000,00" class="input-fintech font-mono">
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Custo de vida estimado (R$)</label>
                <input type="number" step="100" id="onbMonthlyCost" placeholder="3500,00" class="input-fintech font-mono">
              </div>
            </div>
          </div>

          <!-- Step 2: Conta Bancária Principal -->
          <div class="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 class="text-xs font-semibold text-white flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">2</span>
              Sua Conta Principal
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Nome do Banco / Conta</label>
                <input type="text" id="onbAccountName" placeholder="Ex: Nubank, Itaú, Inter" class="input-fintech">
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Saldo Atual (R$)</label>
                <input type="number" step="0.01" id="onbAccountBalance" placeholder="1500,00" class="input-fintech font-mono">
              </div>
            </div>
          </div>

          <!-- Step 3: Cartão de Crédito (Opcional) -->
          <div class="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 class="text-xs font-semibold text-white flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">3</span>
              Cartão de Crédito (Opcional)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Nome do Cartão</label>
                <input type="text" id="onbCardName" placeholder="Ex: Nubank Roxinho" class="input-fintech">
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Limite Total (R$)</label>
                <input type="number" step="100" id="onbCardLimit" placeholder="5000,00" class="input-fintech font-mono">
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-white/[0.06] bg-[#0A0C10] flex items-center justify-between">
          <p class="text-[11px] text-zinc-500">Você poderá editar tudo mais tarde.</p>
          <div class="flex items-center gap-2">
            <button id="btnSkipOnboardingFooter" class="btn-secondary text-xs">Pular</button>
            <button id="btnSaveOnboarding" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Concluir e Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
