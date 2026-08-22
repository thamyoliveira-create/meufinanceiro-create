// Modal de Lançamento de Receitas e Despesas - Gastosa 98

export function renderQuickAddModal(categories = [], accounts = [], creditCards = []) {
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return `
    <div id="quickAddModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-overlay animate-fade-in select-none">
      <div class="win-window w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Titlebar Windows 98 -->
        <div class="win-titlebar">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">⚡</span>
            <span id="quickAddTitle">Lançar Movimentação - Gastosa 98</span>
          </div>
          <button id="btnCloseQuickAdd" class="win-btn-control font-bold" title="Fechar">✕</button>
        </div>

        <!-- Conteúdo do Formulário -->
        <div class="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar text-xs text-black win-inset bg-white m-2">
          <!-- Reconhecimento Rápido por IA / Texto ou Comprovante -->
          <div class="win-outset p-2 space-y-1.5 bg-[#f0f0f0]">
            <div class="flex items-center justify-between">
              <label class="font-bold text-black text-[11px] flex items-center gap-1">
                <span>🤖</span> Digite em Linguagem Natural ou Fotografe:
              </label>
              <span class="text-[10px] text-zinc-600 font-mono">IA Assistente</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="relative flex-1">
                <input type="text" id="nlInputText" placeholder='Ex: "Recebi 3.500 de salário no Nubank" ou "Almoço 45"' class="input-fintech w-full text-xs py-1 pr-16">
                <button type="button" id="btnParseNL" class="absolute right-0.5 top-0.5 bottom-0.5 win-btn font-bold text-[10px] px-2">
                  Analisar
                </button>
              </div>

              <!-- Botão Scanner de Foto -->
              <label for="receiptImageInput" class="win-btn font-bold py-1 px-2 text-xs cursor-pointer" title="Ler Comprovante / Recibo por Foto">
                <span>📷</span> Foto
                <input type="file" id="receiptImageInput" accept="image/*" class="hidden">
              </label>
            </div>
          </div>

          <!-- Formulário Detalhado -->
          <form id="quickAddForm" class="space-y-3 text-xs">
            <!-- Seletor de Tipo (Receita / Despesa / Transferência) -->
            <div class="grid grid-cols-3 gap-1 p-1 win-inset-gray">
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="income" id="radioTypeIncome" class="peer sr-only">
                <div class="text-center py-1.5 font-bold rounded-none win-btn w-full peer-checked:win-btn-pressed peer-checked:text-[#006600]">
                  📥 Receita (+)
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="expense" id="radioTypeExpense" checked class="peer sr-only">
                <div class="text-center py-1.5 font-bold rounded-none win-btn w-full peer-checked:win-btn-pressed peer-checked:text-[#aa0000]">
                  📤 Despesa (-)
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="transfer" id="radioTypeTransfer" class="peer sr-only">
                <div class="text-center py-1.5 font-bold rounded-none win-btn w-full peer-checked:win-btn-pressed peer-checked:text-[#000080]">
                  ↔ Transferência
                </div>
              </label>
            </div>

            <!-- Banner Explicativo do Tipo -->
            <div id="txTypeHelperBanner" class="p-2 win-outset text-xs flex items-center gap-1.5 font-medium">
              <span id="txTypeIcon">📤</span>
              <span id="txTypeHelperText">Registrando uma saída / despesa da sua conta.</span>
            </div>

            <!-- Descrição e Valor -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-black mb-1">Descrição:</label>
                <input type="text" id="txDescription" required placeholder="Ex: Salário, Pix recebido, Mercado..." class="input-fintech w-full">
              </div>
              <div>
                <label class="block font-bold text-black mb-1">Valor (R$):</label>
                <input type="number" step="0.01" min="0.01" id="txAmount" required placeholder="0,00" class="input-fintech font-mono font-bold w-full text-sm">
              </div>
            </div>

            <!-- Categoria e Data -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-black mb-1" id="labelCategory">Categoria:</label>
                <select id="txCategory" class="input-fintech w-full font-medium">
                  <!-- Populado dinamicamente com base no tipo -->
                  ${expenseCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-bold text-black mb-1">Data da Movimentação:</label>
                <input type="date" id="txDate" required class="input-fintech w-full font-medium">
              </div>
            </div>

            <!-- Conta e Pagamento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-black mb-1" id="labelAccount">Conta Onde Caiu / Saiu:</label>
                <select id="txAccount" class="input-fintech w-full font-medium">
                  ${accounts.map(a => `<option value="${a.id}">${a.name} (R$ ${Number(a.currentBalance || 0).toFixed(2)})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-bold text-black mb-1">Meio / Forma:</label>
                <select id="txPaymentMethod" class="input-fintech w-full font-medium">
                  <option value="pix">Pix (Transferência Instantânea)</option>
                  <option value="transfer">TED / DOC / Transferência</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="money">Dinheiro em Espécie</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <!-- Parcelas (Apenas para despesas no cartão) -->
            <div id="installmentRow" class="hidden grid grid-cols-2 gap-2 p-2 win-outset bg-[#f9f9f9]">
              <div>
                <label class="block font-bold text-black mb-0.5">Cartão de Crédito:</label>
                <select id="txCreditCard" class="input-fintech w-full">
                  ${creditCards.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-bold text-black mb-0.5">Parcelamento:</label>
                <select id="txInstallments" class="input-fintech w-full">
                  <option value="1">1x (À vista)</option>
                  <option value="2">2x</option>
                  <option value="3">3x</option>
                  <option value="4">4x</option>
                  <option value="5">5x</option>
                  <option value="6">6x</option>
                  <option value="10">10x</option>
                  <option value="12">12x</option>
                </select>
              </div>
            </div>

            <!-- Divisão de Gastos (Opcional) -->
            <div id="sharedExpenseBlock" class="p-2 win-outset bg-[#f9f9f9] space-y-1.5">
              <label class="flex items-center gap-2 cursor-pointer font-bold text-black">
                <input type="checkbox" id="txIsShared">
                <span>Dividir este valor com alguém (Ex: parceiro/amigo)</span>
              </label>

              <div id="sharedExpenseFields" class="hidden grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label class="block font-bold text-zinc-700 text-[10px]">Nome da pessoa:</label>
                  <input type="text" id="txSharedWith" value="Parceiro(a)" placeholder="Ex: Lucas" class="input-fintech text-[11px] py-0.5 w-full">
                </div>
                <div>
                  <label class="block font-bold text-zinc-700 text-[10px]">Parte da pessoa (%):</label>
                  <select id="txSharedPercent" class="input-fintech text-[11px] py-0.5 w-full">
                    <option value="50" selected>50% (Meio a meio)</option>
                    <option value="60">60%</option>
                    <option value="40">40%</option>
                    <option value="100">100% (Reembolso total)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Botões de Ação do Rodapé -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-400">
              <button type="button" id="btnCancelQuickAdd" class="win-btn px-3 py-1">Cancelar</button>
              <button type="submit" id="btnSubmitQuickAdd" class="win-btn font-bold px-4 py-1 text-black">
                [ OK ] Salvar Lançamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
