// Botão Flutuante e Chat IA Minimalista - Meu Financeiro IA

export function renderAiChatFloating() {
  return `
    <div class="fixed right-6 bottom-20 lg:bottom-6 z-40">
      <button id="btnToggleFloatingChat" class="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white text-black font-semibold shadow-xl hover:opacity-90 active:scale-95 transition-all text-xs">
        <i data-lucide="bot" class="w-4 h-4"></i>
        <span>IA Financeira</span>
      </button>

      <!-- Painel de Chat Minimalista -->
      <div id="floatingChatPanel" class="hidden absolute right-0 bottom-14 w-80 sm:w-96 bg-[#101218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fade-in z-50">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-semibold text-white">Assistente Financeiro IA</span>
          </div>
          <button id="btnCloseFloatingChat" class="text-zinc-500 hover:text-white p-1">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Mensagens -->
        <div id="floatingChatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
          <div class="p-3 bg-white/[0.04] border border-white/5 rounded-xl text-zinc-300 leading-relaxed">
            Olá. Estou conectado aos seus dados cadastrados. Como posso ajudar com suas finanças agora?
          </div>

          <!-- Sugestões Rápidas -->
          <div class="pt-2">
            <p class="text-[10px] uppercase font-bold text-zinc-500 mb-2">Sugestões Rápidas</p>
            <div class="flex flex-wrap gap-1.5">
              <button class="chat-quick-btn text-[11px] bg-white/[0.03] hover:bg-white/10 text-zinc-300 px-2.5 py-1.5 rounded-md border border-white/5 transition-colors" data-question="Quanto gastei com comida este mês?">
                🍽️ Quanto gastei com comida?
              </button>
              <button class="chat-quick-btn text-[11px] bg-white/[0.03] hover:bg-white/10 text-zinc-300 px-2.5 py-1.5 rounded-md border border-white/5 transition-colors" data-question="Onde estou gastando mais?">
                📊 Onde estou gastando mais?
              </button>
              <button class="chat-quick-btn text-[11px] bg-white/[0.03] hover:bg-white/10 text-zinc-300 px-2.5 py-1.5 rounded-md border border-white/5 transition-colors" data-question="Quanto estou gastando com assinaturas?">
                📱 Total de assinaturas
              </button>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-3 border-t border-white/[0.06] bg-[#0A0C10]">
          <form id="floatingChatForm" class="flex items-center gap-2">
            <input type="text" id="floatingChatInput" placeholder="Faça uma pergunta sobre seus gastos..." class="input-fintech text-xs py-2">
            <button type="submit" class="p-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition-opacity">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
