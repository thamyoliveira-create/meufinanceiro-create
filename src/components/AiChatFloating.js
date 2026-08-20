// Botão Flutuante e Painel de Chat com Assistente IA - Meu Financeiro IA

export function renderAiChatFloating() {
  return `
    <!-- Botão Flutuante IA -->
    <div class="fixed right-6 bottom-20 lg:bottom-6 z-40">
      <button id="btnToggleFloatingChat" class="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200">
        <div class="relative flex items-center justify-center">
          <i data-lucide="bot" class="w-5 h-5"></i>
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping"></span>
        </div>
        <span class="text-xs tracking-wide">Assistente IA</span>
      </button>

      <!-- Painel de Chat Flutuante -->
      <div id="floatingChatPanel" class="hidden absolute right-0 bottom-16 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-fade-in z-50">
        <!-- Header do Chat -->
        <div class="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold">
              <i data-lucide="sparkles" class="w-4 h-4 text-white"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                Assistente Financeiro
                <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">IA</span>
              </h4>
              <p class="text-[11px] text-slate-400">Consultando seus dados reais</p>
            </div>
          </div>
          <button id="btnCloseFloatingChat" class="text-slate-400 hover:text-white p-1 rounded-lg">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Mensagens do Chat -->
        <div id="floatingChatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="bot" class="w-4 h-4"></i>
            </div>
            <div class="p-3 bg-slate-800/80 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-200 leading-relaxed max-w-[85%]">
              Olá! Eu sou o seu <strong>Assistente Financeiro IA</strong>. Tenho acesso seguro aos seus registros cadastrados para tirar dúvidas, calcular projeções ou analisar despesas. Como posso ajudar agora?
            </div>
          </div>

          <!-- Sugestões Rápidas -->
          <div class="pt-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Perguntas Rápidas</p>
            <div class="flex flex-wrap gap-1.5">
              <button class="chat-quick-btn text-[11px] bg-slate-800/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left" data-question="Quanto gastei com comida este mês?">
                🍽️ Quanto gastei com comida?
              </button>
              <button class="chat-quick-btn text-[11px] bg-slate-800/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left" data-question="Onde estou gastando mais?">
                📊 Onde estou gastando mais?
              </button>
              <button class="chat-quick-btn text-[11px] bg-slate-800/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left" data-question="Quanto falta para minha reserva de emergência?">
                🛡️ Minha reserva de emergência
              </button>
              <button class="chat-quick-btn text-[11px] bg-slate-800/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left" data-question="Quanto estou gastando com assinaturas?">
                📱 Total de assinaturas
              </button>
            </div>
          </div>
        </div>

        <!-- Input do Chat -->
        <div class="p-3 border-t border-slate-800 bg-slate-950/80">
          <form id="floatingChatForm" class="flex items-center gap-2">
            <input type="text" id="floatingChatInput" placeholder="Faça uma pergunta sobre seus gastos..." class="input-fintech text-xs py-2">
            <button type="submit" class="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-transform active:scale-95">
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
