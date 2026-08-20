// Componente de Navegação Lateral Desktop - Meu Financeiro IA

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', badge: null },
  { id: 'transactions', label: 'Transações', icon: 'arrow-left-right', badge: null },
  { id: 'accounts', label: 'Minhas Contas', icon: 'wallet', badge: null },
  { id: 'cards', label: 'Cartões de Crédito', icon: 'credit-card', badge: null },
  { id: 'bills', label: 'Contas a Pagar / Receber', icon: 'receipt', badge: null },
  { id: 'budget', label: 'Meu Orçamento', icon: 'pie-chart', badge: null },
  { id: 'goals', label: 'Metas & Reserva', icon: 'target', badge: null },
  { id: 'debts', label: 'Minhas Dívidas', icon: 'badge-percent', badge: null },
  { id: 'investments', label: 'Investimentos', icon: 'trending-up', badge: null },
  { id: 'networth', label: 'Patrimônio Líquido', icon: 'landmark', badge: null },
  { id: 'calendar', label: 'Calendário Financeiro', icon: 'calendar', badge: null },
  { id: 'reports', label: 'Relatórios & Análise', icon: 'bar-chart-3', badge: null },
  { id: 'subscriptions', label: 'Assinaturas', icon: 'repeat', badge: null },
  { id: 'canibuy', label: 'Posso Comprar?', icon: 'sparkles', badge: 'IA' },
  { id: 'ai_assistant', label: 'Assistente IA', icon: 'bot', badge: 'Novo' },
  { id: 'settings', label: 'Configurações', icon: 'settings', badge: null },
];

export function renderSidebar(activeRoute = 'dashboard') {
  const itemsHtml = MENU_ITEMS.map(item => {
    const isActive = item.id === activeRoute;
    const activeClass = isActive
      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-semibold'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent';

    const badgeHtml = item.badge
      ? `<span class="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
          item.badge === 'IA' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400'
        }">${item.badge}</span>`
      : '';

    return `
      <button data-route="${item.id}" class="sidebar-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${activeClass}">
        <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0"></i>
        <span class="truncate">${item.label}</span>
        ${badgeHtml}
      </button>
    `;
  }).join('');

  return `
    <aside class="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl z-30 select-none">
      <!-- Logo e Nome do App -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <i data-lucide="sparkles" class="w-5 h-5 text-slate-950 stroke-[2.5]"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            Meu Financeiro <span class="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-semibold">IA</span>
          </h1>
          <p class="text-[11px] text-slate-400 font-medium">Gestão Financeira Pessoal</p>
        </div>
      </div>

      <!-- Menu Principal -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navegação
        </div>
        ${itemsHtml}
      </div>

      <!-- Footer da Sidebar com Status da IA -->
      <div class="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div class="relative flex-shrink-0">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500/50 blur-[2px]"></div>
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-semibold text-slate-200 truncate">IA Financeira Ativa</p>
            <p class="text-[10px] text-slate-400 truncate">Analisando dados em tempo real</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}
