// Componente de Barra de Topo Minimalista com Modo Privacidade - Meu Financeiro IA

export function renderNavbar(title, user, notifications = [], isDemoActive = false) {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isPrivacyOn = window.__meuFinanceiroPrivacyMode;

  return `
    <header class="h-16 border-b border-white/[0.06] bg-[#090A0D]/70 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button id="mobileMenuToggle" class="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold text-white tracking-tight">${title}</h2>
          ${isDemoActive ? '<span class="text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">Demo</span>' : ''}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Botão Olho Mágico (Modo Privacidade) -->
        <button id="btnTogglePrivacy" class="p-2 rounded-lg ${isPrivacyOn ? 'text-emerald-400 bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'} transition-colors" title="${isPrivacyOn ? 'Mostrar Saldos' : 'Ocultar Saldos (Modo Privacidade)'}">
          <i data-lucide="${isPrivacyOn ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>
        </button>

        <!-- Botão Registrar Gasto Minimalista -->
        <button id="btnQuickAddExpense" class="btn-primary py-1.5 px-3 text-xs">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Registrar Gasto</span>
        </button>

        <!-- Notificações -->
        <div class="relative">
          <button id="btnNotifications" class="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors relative">
            <i data-lucide="bell" class="w-4 h-4"></i>
            ${unreadCount > 0 ? `<span class="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>` : ''}
          </button>

          <div id="notificationsDropdown" class="hidden absolute right-0 mt-2 w-80 bg-[#12141A] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
            <div class="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span class="font-semibold text-white">Notificações</span>
              <span class="text-zinc-400 text-[11px]">${unreadCount} não lidas</span>
            </div>
            <div class="max-h-64 overflow-y-auto divide-y divide-white/5 py-2 custom-scrollbar text-xs">
              ${notifications.length === 0 ? '<p class="text-zinc-500 text-center py-6">Nenhuma notificação recente.</p>' : notifications.map(n => `
                <div class="py-2.5 px-2 hover:bg-white/[0.02] rounded-lg">
                  <p class="font-medium text-zinc-200">${n.title}</p>
                  <p class="text-[11px] text-zinc-400 mt-0.5">${n.message}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Perfil Minimalista -->
        <div class="relative">
          <button id="btnUserProfile" class="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
            <div class="w-7 h-7 rounded-md bg-zinc-800 text-zinc-200 border border-white/10 flex items-center justify-center font-mono text-xs font-bold">
              ${(user?.fullName || 'U').charAt(0)}
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-zinc-500"></i>
          </button>

          <div id="userDropdown" class="hidden absolute right-0 mt-2 w-52 bg-[#12141A] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in text-xs">
            <div class="px-2.5 py-2 border-b border-white/10 mb-1">
              <p class="font-semibold text-white truncate">${user?.fullName || 'Minha Conta'}</p>
              <p class="text-[11px] text-zinc-400 truncate">${user?.email || ''}</p>
            </div>
            
            <button id="btnThemeToggle" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg">
              <i data-lucide="sun-moon" class="w-3.5 h-3.5"></i> Alternar Tema
            </button>

            <button data-route="settings" class="sidebar-item w-full flex items-center gap-2 px-2.5 py-1.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg">
              <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i> Configurações
            </button>

            <div class="border-t border-white/10 my-1"></div>

            <button id="btnLogout" class="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}
