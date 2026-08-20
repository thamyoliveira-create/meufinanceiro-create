// Visão de Autenticação (Login, Cadastro e Recuperação de Senha) - Meu Financeiro IA

export function renderAuthView(mode = 'login') {
  return `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden animate-fade-in">
      <!-- Elementos Decorativos de Fundo (Glow Fintech) -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <!-- Logo e Cabeçalho -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <i data-lucide="sparkles" class="w-6 h-6 text-slate-950 font-bold"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5 mt-3">
            Meu Financeiro <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold">IA</span>
          </h2>
          <p class="text-xs text-slate-400">Controle financeiro inteligente com inteligência artificial</p>
        </div>

        <!-- Abas: Entrar vs Cadastrar -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button id="btnTabLogin" class="py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'login' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}">
            Entrar
          </button>
          <button id="btnTabSignup" class="py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'signup' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}">
            Criar Conta
          </button>
        </div>

        <!-- Formulário de Login -->
        <form id="authLoginForm" class="${mode === 'login' ? 'space-y-4' : 'hidden space-y-4'} text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">E-mail</label>
            <div class="relative">
              <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="email" id="loginEmail" required placeholder="seu@email.com" class="input-fintech pl-9">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-slate-300">Senha</label>
              <button type="button" id="btnForgotPassword" class="text-[11px] text-emerald-400 hover:underline">Esqueci a senha</button>
            </div>
            <div class="relative">
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="password" id="loginPassword" required placeholder="••••••••" class="input-fintech pl-9">
            </div>
          </div>

          <button type="submit" class="w-full btn-primary justify-center py-2.5 mt-2 text-xs">
            <i data-lucide="log-in" class="w-4 h-4"></i> Acessar Minha Conta
          </button>
        </form>

        <!-- Formulário de Cadastro -->
        <form id="authSignupForm" class="${mode === 'signup' ? 'space-y-4' : 'hidden space-y-4'} text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Nome Completo</label>
            <div class="relative">
              <i data-lucide="user" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="text" id="signupName" required placeholder="Seu nome" class="input-fintech pl-9">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">E-mail</label>
            <div class="relative">
              <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="email" id="signupEmail" required placeholder="seu@email.com" class="input-fintech pl-9">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Senha (Mínimo 6 caracteres)</label>
            <div class="relative">
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input type="password" id="signupPassword" required minlength="6" placeholder="••••••••" class="input-fintech pl-9">
            </div>
          </div>

          <button type="submit" class="w-full btn-primary justify-center py-2.5 mt-2 text-xs">
            <i data-lucide="user-plus" class="w-4 h-4"></i> Cadastrar e Começar
          </button>
        </form>

        <!-- Formulário de Recuperação de Senha -->
        <form id="authResetForm" class="hidden space-y-4 text-xs">
          <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs">
            Digite seu e-mail cadastrado e sua nova senha para redefinir o acesso.
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">E-mail</label>
            <input type="email" id="resetEmail" required placeholder="seu@email.com" class="input-fintech">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Nova Senha</label>
            <input type="password" id="resetNewPassword" required minlength="6" placeholder="Nova senha" class="input-fintech">
          </div>
          <button type="submit" class="w-full btn-primary justify-center py-2.5 text-xs">
            Redefinir Senha
          </button>
          <button type="button" id="btnCancelReset" class="w-full text-center text-xs text-slate-400 hover:text-white py-1">
            Voltar ao Login
          </button>
        </form>

        <!-- Informação de Segurança -->
        <div class="pt-4 border-t border-slate-800 text-center">
          <p class="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
            Dados isolados com criptografia e persistência segura
          </p>
        </div>
      </div>
    </div>
  `;
}
