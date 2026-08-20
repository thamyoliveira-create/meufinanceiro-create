// Visão de Autenticação Minimalista - Meu Financeiro IA

export function renderAuthView(mode = 'login') {
  return `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-[#08090C] relative animate-fade-in">
      <div class="w-full max-w-sm bg-[#0E1015] border border-white/10 rounded-2xl p-7 shadow-2xl space-y-6">
        <!-- Logo e Título -->
        <div class="text-center space-y-1.5">
          <div class="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center mx-auto font-bold text-sm">
            <i data-lucide="sparkles" class="w-4 h-4 stroke-[2.5]"></i>
          </div>
          <h2 class="text-lg font-bold text-white tracking-tight pt-2">Meu Financeiro IA</h2>
          <p class="text-xs text-zinc-400">Controle financeiro pessoal inteligente</p>
        </div>

        <!-- Abas -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-lg border border-white/5 text-xs">
          <button id="btnTabLogin" class="py-1.5 font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:text-white'}">
            Entrar
          </button>
          <button id="btnTabSignup" class="py-1.5 font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:text-white'}">
            Criar Conta
          </button>
        </div>

        <!-- Login -->
        <form id="authLoginForm" class="${mode === 'login' ? 'space-y-3.5' : 'hidden space-y-3.5'} text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">E-mail</label>
            <input type="email" id="loginEmail" required placeholder="seu@email.com" class="input-fintech">
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-medium text-zinc-400">Senha</label>
              <button type="button" id="btnForgotPassword" class="text-[11px] text-zinc-400 hover:text-white hover:underline">Esqueci</button>
            </div>
            <input type="password" id="loginPassword" required placeholder="••••••••" class="input-fintech">
          </div>

          <button type="submit" class="w-full btn-primary justify-center py-2 mt-2 text-xs">
            Acessar Conta
          </button>
        </form>

        <!-- Cadastro -->
        <form id="authSignupForm" class="${mode === 'signup' ? 'space-y-3.5' : 'hidden space-y-3.5'} text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Nome Completo</label>
            <input type="text" id="signupName" required placeholder="Seu nome" class="input-fintech">
          </div>

          <div>
            <label class="block font-medium text-zinc-400 mb-1">E-mail</label>
            <input type="email" id="signupEmail" required placeholder="seu@email.com" class="input-fintech">
          </div>

          <div>
            <label class="block font-medium text-zinc-400 mb-1">Senha (Mínimo 6 caracteres)</label>
            <input type="password" id="signupPassword" required minlength="6" placeholder="••••••••" class="input-fintech">
          </div>

          <button type="submit" class="w-full btn-primary justify-center py-2 mt-2 text-xs">
            Criar Conta
          </button>
        </form>

        <!-- Reset Senha -->
        <form id="authResetForm" class="hidden space-y-3.5 text-xs">
          <p class="text-xs text-zinc-400">Digite seu e-mail para redefinir a senha.</p>
          <div>
            <label class="block font-medium text-zinc-400 mb-1">E-mail</label>
            <input type="email" id="resetEmail" required placeholder="seu@email.com" class="input-fintech">
          </div>
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Nova Senha</label>
            <input type="password" id="resetNewPassword" required minlength="6" placeholder="Nova senha" class="input-fintech">
          </div>
          <button type="submit" class="w-full btn-primary justify-center py-2 text-xs">
            Salvar Nova Senha
          </button>
          <button type="button" id="btnCancelReset" class="w-full text-center text-xs text-zinc-400 hover:text-white py-1">
            Voltar ao Login
          </button>
        </form>
      </div>
    </div>
  `;
}
