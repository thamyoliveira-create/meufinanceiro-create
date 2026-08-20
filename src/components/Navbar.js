// Componente de Barra de Topo (Navbar) - Meu Financeiro IA

export function renderNavbar(title, user, notifications = [], isDemoActive = false) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return `
    <header class="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between gap-4">
      <!-- Título da Rota / Breadcrumb -->
      <div class="flex items-center gap-3">
        <button id="mobileMenuToggle" class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            ${title}
            ${isDemoActive ? '<span class="text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="flask-conical" class="w-3 h-3"></i> Modo Demonstração</span>' : ''}
          </h2>
        </div>
      </div>

      <!-- Ações da Direita -->
      <div class="flex items-center gap-3">
        <!-- Botão Destaque: Registrar Gasto com IA -->
        <button id="btnQuickAddExpense" class="btn-primary py-2 px-3.5 text-xs sm:text-sm shadow-emerald-500/20">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Registrar Gasto</span>
          <span class="sm:hidden">Gasto</span>
        </button>

        <!-- Central de Notificações com Dropdown -->
        <div class="relative">
          <button id="btnNotifications" class="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <i data-lucide="bell" class="w-5 h-5"></i>
            ${unreadCount > 0 ? `<span class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">${unreadCount}</span>` : ''}
          </button>

          <div id="notificationsDropdown" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <i data-lucide="bell" class="w-4 h-4 text-emerald-400"></i> Notificações
              </h4>
              <span class="text-xs text-slate-400">${unreadCount} não lidas</span>
            </div>
            <div class="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-2 custom-scrollbar">
              ${notifications.length === 0 ? '<p class="text-xs text-slate-400 text-center py-6">Nenhuma notificação no momento.</p>' : notifications.map(n => `
                <div class="py-2.5 px-2 hover:bg-slate-800/40 rounded-lg transition-colors flex items-start gap-3">
                  <div class="p-1.5 rounded-lg ${n.type === 'bill_due' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} mt-0.5">
                    <i data-lucide="${n.type === 'bill_due' ? 'alert-triangle' : 'sparkles'}" class="w-3.5 h-3.5"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-semibold text-slate-200">${n.title}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">${n.message}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Perfil do Usuário com Dropdown -->
        <div class="relative">
          <button id="btnUserProfile" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
              ${(user?.fullName || 'U').charAt(0)}
            </div>
            <span class="hidden md:inline text-xs font-semibold text-slate-200">${user?.fullName?.split(' ')[0] || 'Usuário'}</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
          </button>

          <div id="userDropdown" class="hidden absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
            <div class="px-3 py-2 border-b border-slate-800 mb-1">
              <p class="text-xs font-bold text-white truncate">${user?.fullName || 'Minha Conta'}</p>
              <p class="text-[11px] text-slate-400 truncate">${user?.email || ''}</p>
            </div>
            
            <button id="btnThemeToggle" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg">
              <i data-lucide="sun-moon" class="w-4 h-4 text-amber-400"></i>
              <span>Alternar Tema</span>
            </button>

            <button data-route="settings" class="sidebar-item w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg">
              <i data-lucide="settings" class="w-4 h-4 text-slate-400"></i>
              <span>Configurações</span>
            </button>

            <div class="border-t border-slate-800 my-1"></div>

            <button id="btnLogout" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg">
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}
