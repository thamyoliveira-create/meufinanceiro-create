// Visão de Autenticação Windows 98 - Meu Financeiro 98

export function renderAuthView(mode = 'login') {
  return `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-[#008080] relative animate-fade-in select-none">
      <!-- Caixa de Diálogo de Logon do Windows 98 -->
      <div class="win-window w-full max-w-sm shadow-2xl">
        <!-- Titlebar -->
        <div class="win-titlebar">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">🔐</span>
            <span>Logon do Windows 98 - Meu Financeiro</span>
          </div>
          <button class="win-btn-control font-bold" onclick="alert('Digite suas credenciais para entrar no sistema.')">?</button>
        </div>

        <div class="p-5 space-y-4 text-xs text-black">
          <!-- Logo e Descrição -->
          <div class="flex items-center gap-3 border-b border-zinc-400 pb-3">
            <div class="w-10 h-10 bg-white win-inset flex items-center justify-center text-xl flex-shrink-0">
              🪟
            </div>
            <div>
              <h2 class="text-sm font-bold text-black">Meu Financeiro 98</h2>
              <p class="text-[11px] text-zinc-700">Digite seu e-mail e senha para acessar o sistema.</p>
            </div>
          </div>

          <!-- Abas de Entrada -->
          <div class="grid grid-cols-2 gap-1 p-1 win-inset-gray">
            <button id="btnTabLogin" class="py-1 text-xs font-bold ${mode === 'login' ? 'win-btn win-btn-pressed' : 'win-btn'}">
              Entrar (Logon)
            </button>
            <button id="btnTabSignup" class="py-1 text-xs font-bold ${mode === 'signup' ? 'win-btn win-btn-pressed' : 'win-btn'}">
              Criar Conta
            </button>
          </div>

          <!-- Formulário de Login -->
          <form id="authLoginForm" class="${mode === 'login' ? 'space-y-3' : 'hidden space-y-3'}">
            <div>
              <label class="block font-bold text-black mb-1">Nome de Usuário / E-mail:</label>
              <input type="email" id="loginEmail" required placeholder="usuario@email.com" class="input-fintech w-full">
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-bold text-black">Senha:</label>
                <button type="button" id="btnForgotPassword" class="text-[11px] text-blue-900 underline font-semibold">Esqueci a Senha</button>
              </div>
              <input type="password" id="loginPassword" required placeholder="••••••••" class="input-fintech w-full">
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-400">
              <button type="submit" class="win-btn font-bold px-4 py-1">
                [ OK ] Entrar
              </button>
            </div>
          </form>

          <!-- Formulário de Cadastro -->
          <form id="authSignupForm" class="${mode === 'signup' ? 'space-y-3' : 'hidden space-y-3'}">
            <div>
              <label class="block font-bold text-black mb-1">Nome Completo:</label>
              <input type="text" id="signupName" required placeholder="Seu nome" class="input-fintech w-full">
            </div>

            <div>
              <label class="block font-bold text-black mb-1">E-mail:</label>
              <input type="email" id="signupEmail" required placeholder="usuario@email.com" class="input-fintech w-full">
            </div>

            <div>
              <label class="block font-bold text-black mb-1">Senha (Mínimo 6 caracteres):</label>
              <input type="password" id="signupPassword" required minlength="6" placeholder="••••••••" class="input-fintech w-full">
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-400">
              <button type="submit" class="win-btn font-bold px-4 py-1">
                [ OK ] Criar Conta
              </button>
            </div>
          </form>

          <!-- Formulário de Reset de Senha -->
          <form id="authResetForm" class="hidden space-y-3">
            <p class="text-[11px] text-zinc-700">Digite seu e-mail para cadastrar uma nova senha.</p>
            <div>
              <label class="block font-bold text-black mb-1">E-mail:</label>
              <input type="email" id="resetEmail" required placeholder="usuario@email.com" class="input-fintech w-full">
            </div>
            <div>
              <label class="block font-bold text-black mb-1">Nova Senha:</label>
              <input type="password" id="resetNewPassword" required minlength="6" placeholder="Nova senha" class="input-fintech w-full">
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-zinc-400">
              <button type="button" id="btnCancelReset" class="win-btn text-[11px]">
                Voltar
              </button>
              <button type="submit" class="win-btn font-bold px-3 py-1">
                [ OK ] Salvar Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
