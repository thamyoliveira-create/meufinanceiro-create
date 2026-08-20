// Visão de Configurações - Meu Financeiro IA

export function renderSettingsView(data) {
  const { user } = data;

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header -->
      <div class="card-fintech p-6">
        <h3 class="text-base font-bold text-white">Configurações e Preferências</h3>
        <p class="text-xs text-slate-400">Personalize moeda, temas, conexões com banco e inteligência artificial</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Perfil e Preferências Regionais -->
        <div class="card-fintech p-6 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="user" class="w-4 h-4 text-emerald-400"></i> Perfil do Usuário
          </h4>

          <form id="profileSettingsForm" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Nome Completo</label>
              <input type="text" id="setFullName" value="${user?.fullName || ''}" class="input-fintech">
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">E-mail Cadastrado</label>
              <input type="email" value="${user?.email || ''}" disabled class="input-fintech opacity-60 cursor-not-allowed">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Moeda Principal</label>
                <select id="setCurrency" class="input-fintech">
                  <option value="BRL" selected>Real Brasileiro (R$ - BRL)</option>
                  <option value="USD">Dólar Americano ($ - USD)</option>
                  <option value="EUR">Euro (€ - EUR)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Formato de Data</label>
                <select id="setDateFormat" class="input-fintech">
                  <option value="DD/MM/YYYY" selected>DD/MM/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                </select>
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" class="btn-primary text-xs py-2 px-4">
                <i data-lucide="save" class="w-4 h-4"></i> Salvar Preferências
              </button>
            </div>
          </form>
        </div>

        <!-- 2. Tema e Aparência Visual -->
        <div class="card-fintech p-6 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="sun-moon" class="w-4 h-4 text-amber-400"></i> Tema e Aparência
          </h4>

          <p class="text-xs text-slate-400">Escolha a aparência visual da interface:</p>

          <div class="grid grid-cols-2 gap-3">
            <button id="btnSetThemeDark" class="p-4 rounded-2xl border border-slate-700 bg-slate-950 text-left hover:border-emerald-500 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <i data-lucide="moon" class="w-5 h-5 text-indigo-400"></i>
                <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">Padrão</span>
              </div>
              <h5 class="text-xs font-bold text-white">Tema Escuro</h5>
              <p class="text-[11px] text-slate-400 mt-0.5">Estética moderna fintech dark</p>
            </button>

            <button id="btnSetThemeLight" class="p-4 rounded-2xl border border-slate-700 bg-slate-900 text-left hover:border-emerald-500 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <i data-lucide="sun" class="w-5 h-5 text-amber-400"></i>
              </div>
              <h5 class="text-xs font-bold text-white">Tema Claro</h5>
              <p class="text-[11px] text-slate-400 mt-0.5">Interface limpa com fundo branco</p>
            </button>
          </div>
        </div>

        <!-- 3. Gerenciador de Dados de Demonstração -->
        <div class="card-fintech p-6 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="flask-conical" class="w-4 h-4 text-emerald-400"></i> Dados de Demonstração (Demo)
          </h4>

          <p class="text-xs text-slate-400">
            Você pode carregar um conjunto completo de contas, cartões e transações de exemplo para explorar o app, ou remover os dados fictícios a qualquer momento com 1 clique:
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button id="btnLoadDemoData" class="btn-primary text-xs py-2 px-3">
              <i data-lucide="plus-circle" class="w-4 h-4"></i> Carregar Dados de Demonstração
            </button>
            <button id="btnWipeDemoData" class="btn-secondary text-xs py-2 px-3 text-amber-400">
              <i data-lucide="trash" class="w-4 h-4"></i> Limpar Apenas Dados Demo
            </button>
          </div>
        </div>

        <!-- 4. Chave Gemini API (Opcional) -->
        <div class="card-fintech p-6 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-indigo-400"></i> Chave Gemini API (Opcional)
          </h4>

          <p class="text-xs text-slate-400">
            O aplicativo já possui um motor determinístico interno completo. Se desejar usar o modelo Gemini 2.0 Flash diretamente para consultas avançadas em linguagem natural, insira sua chave da API:
          </p>

          <div class="space-y-2 text-xs">
            <input type="password" id="geminiApiKeyInput" placeholder="AIzaSy..." class="input-fintech">
            <button id="btnSaveGeminiKey" class="btn-secondary text-xs py-1.5 px-3">
              <i data-lucide="key" class="w-3.5 h-3.5 text-indigo-400"></i> Salvar Chave Gemini
            </button>
          </div>
        </div>
      </div>

      <!-- Zona de Segurança e Backup -->
      <div class="card-fintech p-6 border-red-500/30 space-y-4">
        <h4 class="text-sm font-bold text-red-400 flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4"></i> Segurança, Backup e Privacidade
        </h4>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold text-slate-200">Exportar Backup Completo (JSON)</p>
            <p class="text-[11px] text-slate-400">Baixe uma cópia integral de todos os seus registros financeiros em formato JSON</p>
          </div>
          <button id="btnDownloadBackup" class="btn-secondary text-xs py-2 px-3">
            <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-400"></i> Baixar Backup
          </button>
        </div>

        <div class="border-t border-slate-800 my-2"></div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold text-red-400">Excluir Todos os Meus Dados</p>
            <p class="text-[11px] text-slate-400">Apaga permanentemente todas as movimentações, contas e metas deste usuário.</p>
          </div>
          <button id="btnWipeAllUserData" class="btn-secondary text-xs py-2 px-3 border-red-500/40 text-red-400 hover:bg-red-500/10">
            <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i> Apagar Todos os Meus Registros
          </button>
        </div>
      </div>
    </div>
  `;
}
