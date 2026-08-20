// Modal de Cadastro Rápido Minimalista - Meu Financeiro IA

export function renderQuickAddModal(categories = [], accounts = [], creditCards = []) {
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return `
    <div id="quickAddModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Nova Movimentação</h3>
          </div>
          <button id="btnCloseQuickAdd" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="p-5 space-y-4">
          <!-- Campo de Linguagem Natural com IA -->
          <div class="space-y-1.5">
            <div class="relative">
              <input type="text" id="nlInputText" placeholder='Ex: "Gastei 48 reais no Uber hoje" ou "Mercado 150 em 2x"' class="input-fintech pr-20 text-xs py-2.5">
              <button id="btnParseNL" class="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-medium transition-colors">
                Analisar
              </button>
            </div>
          </div>

          <!-- Formulário Detalhado -->
          <form id="quickAddForm" class="space-y-3.5 text-xs">
            <!-- Tipo -->
            <div class="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-white/5">
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="expense" checked class="peer sr-only">
                <div class="text-center py-1.5 font-medium rounded text-zinc-400 peer-checked:bg-white/10 peer-checked:text-white transition-colors">
                  Despesa
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="income" class="peer sr-only">
                <div class="text-center py-1.5 font-medium rounded text-zinc-400 peer-checked:bg-white/10 peer-checked:text-white transition-colors">
                  Receita
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="transfer" class="peer sr-only">
                <div class="text-center py-1.5 font-medium rounded text-zinc-400 peer-checked:bg-white/10 peer-checked:text-white transition-colors">
                  Transferência
                </div>
              </label>
            </div>

            <!-- Descrição e Valor -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Descrição</label>
                <input type="text" id="txDescription" required placeholder="Ex: Supermercado" class="input-fintech">
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" min="0.01" id="txAmount" required placeholder="0,00" class="input-fintech font-mono font-bold text-white">
              </div>
            </div>

            <!-- Categoria e Data -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Categoria</label>
                <select id="txCategory" class="input-fintech">
                  ${expenseCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Data</label>
                <input type="date" id="txDate" required class="input-fintech">
              </div>
            </div>

            <!-- Conta e Pagamento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Conta de Origem</label>
                <select id="txAccount" class="input-fintech">
                  ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Forma de Pagamento</label>
                <select id="txPaymentMethod" class="input-fintech">
                  <option value="pix">Pix</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="money">Dinheiro</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <!-- Parcelas -->
            <div id="installmentRow" class="hidden grid grid-cols-2 gap-3 p-3 bg-zinc-950 rounded-lg border border-white/5">
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Cartão de Crédito</label>
                <select id="txCreditCard" class="input-fintech">
                  ${creditCards.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-medium text-zinc-400 mb-1">Parcelas</label>
                <select id="txInstallments" class="input-fintech">
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

            <!-- Ações -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button type="button" id="btnCancelQuickAdd" class="btn-secondary text-xs">Cancelar</button>
              <button type="submit" class="btn-primary text-xs">
                Confirmar e Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
