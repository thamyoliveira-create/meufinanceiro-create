// Modal de Importação e Reconhecimento de Extratos Bancários (PDF, OFX, CSV) - Gastosa 98

export function renderImportStatementModal(accounts = [], categories = []) {
  return `
    <div id="importStatementModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-overlay animate-fade-in select-none">
      <div class="win-window w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Titlebar Windows 98 -->
        <div class="win-titlebar">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">📂</span>
            <span>Importador de Extrato Bancário - Gastosa 98</span>
          </div>
          <button id="btnCloseImportModal" class="win-btn-control font-bold" title="Fechar">✕</button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs text-black win-inset bg-white m-2">
          <!-- Seleção da Conta de Destino -->
          <div class="win-outset p-2.5 space-y-1">
            <label class="block font-bold text-black text-xs">Vincular Lançamentos à Conta:</label>
            <select id="importTargetAccount" class="input-fintech w-full font-medium">
              ${accounts.map(a => `<option value="${a.id}">${a.name} (Saldo: R$ ${Number(a.currentBalance || 0).toFixed(2)})</option>`).join('')}
            </select>
          </div>

          <!-- Abas de Entrada -->
          <div class="flex items-center gap-1 win-inset-gray p-1">
            <button id="tabUploadFile" class="win-btn win-btn-pressed flex-1 font-bold text-xs py-1">
              📁 Arquivo (PDF / OFX / CSV)
            </button>
            <button id="tabPasteText" class="win-btn flex-1 font-bold text-xs py-1">
              📋 Colar Texto do Extrato
            </button>
          </div>

          <!-- 1. Área de Upload (Drag & Drop) com suporte a PDF -->
          <div id="dropzoneArea" class="border-2 border-dashed border-zinc-500 bg-[#f9f9f9] hover:bg-[#eef2f8] p-6 text-center cursor-pointer transition-colors space-y-2">
            <input type="file" id="statementFileInput" accept=".pdf,.ofx,.csv,.txt" class="hidden">
            <div class="text-3xl">📄</div>
            <div>
              <p class="font-bold text-black text-xs">Clique aqui para selecionar seu extrato ou fatura (<strong class="text-blue-900">PDF</strong>, <strong class="text-blue-900">OFX</strong> ou <strong class="text-blue-900">CSV</strong>)</p>
              <p class="text-[11px] text-zinc-600 mt-1">Compatível com extratos do Nubank, Itaú, Bradesco, Santander, Inter, BB, C6, Caixa, etc.</p>
            </div>
            <button type="button" id="btnChooseFileTrigger" class="win-btn font-bold px-3 py-1 mt-2">
              📂 Procurar Arquivo no Computador...
            </button>
          </div>

          <!-- 2. Área de Colar Texto -->
          <div id="pasteTextArea" class="hidden space-y-2">
            <label class="block font-bold text-black">Cole as linhas do seu extrato ou internet banking:</label>
            <textarea id="statementRawText" rows="6" placeholder="15/08/2026 iFood Burger -R$ 48,00&#10;16/08/2026 Uber Viagem -R$ 24,50&#10;18/08/2026 Salario Empresa +R$ 5.000,00" class="input-fintech font-mono text-xs w-full"></textarea>
            <button id="btnProcessPastedText" class="win-btn font-bold">
              <span>⚡</span> Reconhecer Linhas Coladas
            </button>
          </div>

          <!-- 3. Tabela de Transações Reconhecidas -->
          <div id="recognizedTransactionsArea" class="hidden space-y-2 pt-2 border-t border-zinc-300">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-black">Transações Identificadas:</span>
                <span id="recognizedCountBadge" class="text-xs bg-green-100 text-[#006600] border border-[#006600] px-2 py-0.2 font-mono font-bold">0</span>
              </div>
              <button id="btnToggleSelectAll" class="win-btn text-[11px]">
                Marcar / Desmarcar Todos
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto win-inset bg-white">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th class="py-1.5 px-2 w-8 text-center">✓</th>
                    <th class="py-1.5 px-2">Data</th>
                    <th class="py-1.5 px-2">Descrição</th>
                    <th class="py-1.5 px-2 w-28">Tipo</th>
                    <th class="py-1.5 px-2">Categoria</th>
                    <th class="py-1.5 px-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody id="recognizedTableBody" class="divide-y divide-zinc-200"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer / Botões de Ação -->
        <div class="px-4 py-2.5 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between text-xs">
          <p id="importSummaryText" class="text-[11px] text-zinc-800 font-medium">Selecione um arquivo PDF, OFX ou CSV para iniciar.</p>
          <div class="flex items-center gap-2">
            <button type="button" id="btnCancelImport" class="win-btn">Cancelar</button>
            <button type="button" id="btnConfirmImport" disabled class="win-btn font-bold opacity-50 cursor-not-allowed">
              <span>💾</span> Salvar Transações no Banco
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
