// Componente da Taskbar e Menu Iniciar Autênticos do Windows 98 - Gastosa 98

export function renderWin98Taskbar(activeRoute = 'dashboard', activeLabel = 'Dashboard', unreadCount = 0, userName = '') {
  const isPrivacyOn = window.__meuFinanceiroPrivacyMode;
  const displayName = userName ? `Gastosa de ${userName}` : 'Gastosa 98';

  return `
    <!-- Menu Iniciar do Windows 98 (Aberto ao Clicar em Iniciar) -->
    <div id="win98StartMenu" class="hidden win-start-menu animate-fade-in">
      <!-- Faixa Lateral Azul Windows 98 -->
      <div class="win-start-banner font-bold">
        <span>Windows<b>98</b></span>
      </div>

      <!-- Itens do Menu Iniciar -->
      <div class="win-start-items">
        <div class="px-2 py-1 border-b border-zinc-400 mb-1 text-[10px] text-zinc-800 font-bold truncate">
          ${displayName}
        </div>

        <button data-route="dashboard" class="sidebar-item win-start-item w-full text-left">
          <span>📊</span> <span>Dashboard</span>
        </button>
        <button data-route="transactions" class="sidebar-item win-start-item w-full text-left">
          <span>📝</span> <span>Transações</span>
        </button>
        <button data-route="accounts" class="sidebar-item win-start-item w-full text-left">
          <span>🏦</span> <span>Contas Bancárias</span>
        </button>
        <button data-route="cards" class="sidebar-item win-start-item w-full text-left">
          <span>💳</span> <span>Cartões de Crédito</span>
        </button>
        <button data-route="bills" class="sidebar-item win-start-item w-full text-left">
          <span>🧾</span> <span>Contas a Pagar / Receber</span>
        </button>
        <button data-route="budget" class="sidebar-item win-start-item w-full text-left">
          <span>⚖️</span> <span>Orçamento 50/30/20</span>
        </button>
        <button data-route="goals" class="sidebar-item win-start-item w-full text-left">
          <span>🎯</span> <span>Metas & Poupança</span>
        </button>
        <button data-route="fire" class="sidebar-item win-start-item w-full text-left">
          <span>🔥</span> <span>Calculadora FIRE</span>
        </button>
        <button data-route="split" class="sidebar-item win-start-item w-full text-left">
          <span>👥</span> <span>Divisão de Gastos</span>
        </button>
        <button data-route="investments" class="sidebar-item win-start-item w-full text-left">
          <span>📈</span> <span>Investimentos</span>
        </button>
        <button data-route="canibuy" class="sidebar-item win-start-item w-full text-left">
          <span>🤖</span> <span>Assistente IA (Posso Comprar?)</span>
        </button>

        <div class="border-t border-zinc-400 my-1"></div>

        <button id="btnStartMenuImport" class="win-start-item w-full text-left">
          <span>📂</span> <span>Importar Extrato (PDF/OFX)...</span>
        </button>
        <button id="btnStartMenuPrivacy" class="win-start-item w-full text-left">
          <span>👁️</span> <span>Modo Privacidade (${isPrivacyOn ? 'Desativar' : 'Ativar'})</span>
        </button>
        <button data-route="settings" class="sidebar-item win-start-item w-full text-left">
          <span>⚙️</span> <span>Painel de Controle</span>
        </button>

        <div class="border-t border-zinc-400 my-1"></div>

        <button id="btnStartMenuShutdown" class="win-start-item w-full text-left text-red-800 font-bold">
          <span>🛑</span> <span>Desligar o Computador...</span>
        </button>
      </div>
    </div>

    <!-- Barra de Tarefas (Taskbar) Fixa Inferior -->
    <div class="win-taskbar">
      <!-- Botão Iniciar com Logo Clássico 4 Cores -->
      <button id="btnWinStart" class="win-start-btn">
        <span class="text-xs leading-none">🪟</span>
        <span class="font-bold">Iniciar</span>
      </button>

      <!-- Botão da Janela Ativa na Barra -->
      <div class="flex-1 px-2 flex items-center gap-1 overflow-x-auto">
        <button class="win-btn win-btn-pressed py-1 px-3 text-xs font-bold flex items-center gap-1.5 max-w-[260px] truncate" title="${displayName} - ${activeLabel}">
          <span>📁</span>
          <span class="truncate">${displayName} - ${activeLabel}</span>
        </button>
      </div>

      <!-- Systray (Canto Inferior Direito com Relógio Digital) -->
      <div class="win-systray">
        <span id="btnTrayPrivacy" class="cursor-pointer" title="Modo Privacidade">${isPrivacyOn ? '🔒' : '👁️'}</span>
        <span title="Volume / Som">🔊</span>
        <span id="winClock" class="font-bold tracking-wider">12:00</span>
      </div>
    </div>
  `;
}
