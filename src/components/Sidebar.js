// Componente de Navegação Estilo Árvore de Pastas do Windows Explorer 98

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Painel Geral (Dashboard)', icon: '📊' },
  { id: 'transactions', label: 'Extrato de Transações', icon: '📝' },
  { id: 'accounts', label: 'Contas Bancárias & Saldos', icon: '🏦' },
  { id: 'cards', label: 'Cartões de Crédito', icon: '💳' },
  { id: 'bills', label: 'Contas a Pagar / Receber', icon: '🧾' },
  { id: 'budget', label: 'Orçamento (Regra 50/30/20)', icon: '⚖️' },
  { id: 'goals', label: 'Metas & Reserva', icon: '🎯' },
  { id: 'fire', label: 'Calculadora FIRE', icon: '🔥', badge: 'FIRE' },
  { id: 'split', label: 'Divisão de Gastos', icon: '👥' },
  { id: 'debts', label: 'Dívidas & Financiamentos', icon: '📉' },
  { id: 'investments', label: 'Carteira de Investimentos', icon: '📈' },
  { id: 'networth', label: 'Balanço Patrimonial', icon: '🏛️' },
  { id: 'calendar', label: 'Calendário Financeiro', icon: '📅' },
  { id: 'reports', label: 'Relatórios & Gráficos', icon: '📊' },
  { id: 'subscriptions', label: 'Assinaturas Recorrentes', icon: '🔁' },
  { id: 'canibuy', label: 'Posso Comprar? (IA)', icon: '🤖', badge: 'IA' },
  { id: 'ai_assistant', label: 'Assistente Inteligente', icon: '💬' },
  { id: 'settings', label: 'Configurações do Sistema', icon: '⚙️' },
];

export function renderSidebar(activeRoute = 'dashboard', userName = '') {
  const sanitizedName = (userName || 'Cliente').trim().replace(/\s+/g, '_');

  const itemsHtml = MENU_ITEMS.map(item => {
    const isActive = item.id === activeRoute;
    const activeClass = isActive
      ? 'bg-[#000080] text-white font-bold'
      : 'text-black hover:bg-[#000080] hover:text-white';

    return `
      <button data-route="${item.id}" class="sidebar-item w-full flex items-center gap-2 px-2 py-1 text-[11px] text-left rounded-none select-none ${activeClass}">
        <span class="text-sm">${item.icon}</span>
        <span class="truncate flex-1">${item.label}</span>
        ${item.badge ? `<span class="text-[9px] bg-yellow-300 text-black px-1 font-bold">${item.badge}</span>` : ''}
      </button>
    `;
  }).join('');

  return `
    <aside class="hidden lg:flex flex-col w-56 bg-[#c0c0c0] border-r-2 border-[#808080] select-none text-black">
      <!-- Cabeçalho Explorer -->
      <div class="px-3 py-1.5 bg-[#dfdfdf] border-b border-[#808080] font-bold text-[11px] flex items-center gap-1.5">
        <span>📁</span> <span>Pastas & Módulos</span>
      </div>

      <!-- Árvore de Diretórios -->
      <div class="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar win-inset bg-white">
        <div class="px-2 py-1 text-[10px] text-zinc-800 font-bold uppercase tracking-wider truncate" title="C:\\Gastosa_${sanitizedName}\\">
          📂 C:\\Gastosa_${sanitizedName}\\
        </div>
        ${itemsHtml}
      </div>

      <!-- Status do Usuário -->
      <div class="p-2 border-t border-[#808080] bg-[#c0c0c0] text-[10px] text-zinc-800 font-semibold flex items-center justify-between">
        <span class="flex items-center gap-1 truncate" title="${userName || 'Cliente'}">👤 ${userName || 'Cliente'}</span>
        <span class="font-mono text-zinc-600">Win98</span>
      </div>
    </aside>
  `;
}
