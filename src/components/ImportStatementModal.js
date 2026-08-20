// Modal de Importação e Reconhecimento de Extratos Bancários (PDF, OFX, CSV) - Meu Financeiro IA

export function renderImportStatementModal(accounts = [], categories = []) {
  return `
    <div id="importStatementModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
              <i data-lucide="file-up" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Importar Extrato Bancário</h3>
              <p class="text-[11px] text-zinc-400">Reconhecimento automático de PDF, OFX, CSV ou texto copiado</p>
            </div>
          </div>
          <button id="btnCloseImportModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          <!-- Seleção da Conta de Destino -->
          <div>
            <label class="block font-medium text-zinc-300 mb-1.5">Vincular à Conta:</label>
            <select id="importTargetAccount" class="input-fintech">
              ${accounts.map(a => `<option value="${a.id}">${a.name} (Saldo: R$ ${Number(a.currentBalance || 0).toFixed(2)})</option>`).join('')}
            </select>
          </div>

          <!-- Abas de Entrada -->
          <div class="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-lg border border-white/5">
            <button id="tabUploadFile" class="py-1.5 font-medium rounded-md bg-white/10 text-white transition-colors">
              📁 Arquivo (PDF / OFX / CSV)
            </button>
            <button id="tabPasteText" class="py-1.5 font-medium rounded-md text-zinc-400 hover:text-white transition-colors">
              📋 Colar Texto do Banco
            </button>
          </div>

          <!-- 1. Área de Upload (Drag & Drop) com suporte a PDF -->
          <div id="dropzoneArea" class="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3">
            <input type="file" id="statementFileInput" accept=".pdf,.ofx,.csv,.txt" class="hidden">
            <i data-lucide="file-text" class="w-10 h-10 mx-auto text-zinc-400"></i>
            <div>
              <p class="font-medium text-zinc-200">Clique para selecionar ou arraste seu extrato em <strong class="text-white">PDF</strong>, <strong class="text-white">OFX</strong> ou <strong class="text-white">CSV</strong></p>
              <p class="text-[11px] text-zinc-500 mt-1">Compatível com extratos e faturas do Nubank, Itaú, Bradesco, Santander, Inter, BB, C6, Caixa, etc.</p>
            </div>
          </div>

          <!-- 2. Área de Colar Texto -->
          <div id="pasteTextArea" class="hidden space-y-2">
            <label class="block font-medium text-zinc-400">Cole as linhas do seu extrato ou internet banking:</label>
            <textarea id="statementRawText" rows="6" placeholder="15/08/2026 iFood Burger -R$ 48,00&#10;16/08/2026 Uber Viagem -R$ 24,50&#10;18/08/2026 Salario Empresa +R$ 5.000,00" class="input-fintech font-mono text-xs"></textarea>
            <button id="btnProcessPastedText" class="btn-secondary text-xs py-1.5 px-3">
              <i data-lucide="wand-2" class="w-3.5 h-3.5"></i> Reconhecer Linhas
            </button>
          </div>

          <!-- 3. Tabela de Transações Reconhecidas -->
          <div id="recognizedTransactionsArea" class="hidden space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white">Transações Identificadas no PDF/Extrato</span>
                <span id="recognizedCountBadge" class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">0</span>
              </div>
              <button id="btnToggleSelectAll" class="text-[11px] text-zinc-400 hover:text-white underline">
                Marcar / Desmarcar Todos
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto border border-white/5 rounded-xl bg-zinc-950 divide-y divide-white/5 custom-scrollbar">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="text-[10px] uppercase font-bold text-zinc-500 bg-white/[0.02]">
                    <th class="p-2.5 w-8 text-center">✓</th>
                    <th class="p-2.5">Data</th>
                    <th class="p-2.5">Descrição</th>
                    <th class="p-2.5 w-28">Tipo</th>
                    <th class="p-2.5">Categoria Sugerida</th>
                    <th class="p-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody id="recognizedTableBody" class="divide-y divide-white/5"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-white/[0.06] bg-[#0A0C10] flex items-center justify-between">
          <p id="importSummaryText" class="text-[11px] text-zinc-400">Selecione um arquivo PDF ou OFX para iniciar.</p>
          <div class="flex items-center gap-2">
            <button type="button" id="btnCancelImport" class="btn-secondary text-xs">Cancelar</button>
            <button type="button" id="btnConfirmImport" disabled class="btn-primary text-xs opacity-50 cursor-not-allowed">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Importar Selecionados
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
