// Componente de Navegação Inferior Mobile - Meu Financeiro IA

export function renderMobileNav(activeRoute = 'dashboard') {
  return `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 z-30 px-3 flex items-center justify-around select-none">
      <button data-route="dashboard" class="sidebar-item flex flex-col items-center gap-1 ${activeRoute === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}">
        <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
        <span class="text-[10px] font-medium">Início</span>
      </button>

      <button data-route="transactions" class="sidebar-item flex flex-col items-center gap-1 ${activeRoute === 'transactions' ? 'text-emerald-400' : 'text-slate-400'}">
        <i data-lucide="arrow-left-right" class="w-5 h-5"></i>
        <span class="text-[10px] font-medium">Transações</span>
      </button>

      <!-- Botão Central de Adicionar [+] em Destaque -->
      <div class="relative -top-4">
        <button id="btnMobileAddCenter" class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
          <i data-lucide="plus" class="w-6 h-6 stroke-[3]"></i>
        </button>
      </div>

      <button data-route="budget" class="sidebar-item flex flex-col items-center gap-1 ${activeRoute === 'budget' || activeRoute === 'goals' ? 'text-emerald-400' : 'text-slate-400'}">
        <i data-lucide="pie-chart" class="w-5 h-5"></i>
        <span class="text-[10px] font-medium">Planejamento</span>
      </button>

      <button data-route="ai_assistant" class="sidebar-item flex flex-col items-center gap-1 ${activeRoute === 'ai_assistant' ? 'text-emerald-400' : 'text-slate-400'}">
        <i data-lucide="bot" class="w-5 h-5"></i>
        <span class="text-[10px] font-medium">IA</span>
      </button>
    </nav>
  `;
}
