// Componente de Navegação Lateral Desktop Minimalista - Meu Financeiro IA

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' },
  { id: 'transactions', label: 'Transações', icon: 'arrow-down-up' },
  { id: 'accounts', label: 'Contas & Saldos', icon: 'wallet-cards' },
  { id: 'cards', label: 'Cartões', icon: 'credit-card' },
  { id: 'bills', label: 'A Pagar / Receber', icon: 'receipt' },
  { id: 'budget', label: 'Orçamento', icon: 'pie-chart' },
  { id: 'goals', label: 'Metas & Reserva', icon: 'target' },
  { id: 'debts', label: 'Dívidas', icon: 'percent' },
  { id: 'investments', label: 'Investimentos', icon: 'trending-up' },
  { id: 'networth', label: 'Patrimônio', icon: 'landmark' },
  { id: 'calendar', label: 'Calendário', icon: 'calendar' },
  { id: 'reports', label: 'Relatórios', icon: 'bar-chart-2' },
  { id: 'subscriptions', label: 'Assinaturas', icon: 'repeat' },
  { id: 'canibuy', label: 'Posso Comprar?', icon: 'sparkles', badge: 'IA' },
  { id: 'ai_assistant', label: 'Assistente IA', icon: 'bot' },
  { id: 'settings', label: 'Configurações', icon: 'sliders-horizontal' },
];

export function renderSidebar(activeRoute = 'dashboard') {
  const itemsHtml = MENU_ITEMS.map(item => {
    const isActive = item.id === activeRoute;
    const activeClass = isActive
      ? 'bg-white/10 text-white font-semibold'
      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] font-normal';

    const badgeHtml = item.badge
      ? `<span class="ml-auto text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">${item.badge}</span>`
      : '';

    return `
      <button data-route="${item.id}" class="sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors duration-100 ${activeClass}">
        <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 opacity-80"></i>
        <span class="truncate">${item.label}</span>
        ${badgeHtml}
      </button>
    `;
  }).join('');

  return `
    <aside class="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-white/[0.06] bg-[#090A0D]/90 backdrop-blur-2xl z-30 select-none">
      <!-- Logo Minimalista -->
      <div class="h-16 flex items-center px-5 border-b border-white/[0.06] gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 stroke-[2.5]"></i>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-sm font-semibold tracking-tight text-white">Financeiro</span>
          <span class="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">IA</span>
        </div>
      </div>

      <!-- Links de Navegação -->
      <div class="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5 custom-scrollbar">
        <div class="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Menu
        </div>
        ${itemsHtml}
      </div>

      <!-- Footer Minimalista -->
      <div class="p-3 border-t border-white/[0.06]">
        <div class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
          <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span class="text-[11px] font-medium text-zinc-300">Motor IA Conectado</span>
        </div>
      </div>
    </aside>
  `;
}
