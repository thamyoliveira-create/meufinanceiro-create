// Modal de Edição de Transação - Meu Financeiro IA

export function renderEditTransactionModal(categories = [], accounts = []) {
  return `
    <div id="editTransactionModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Editar Movimentação</h3>
          </div>
          <button id="btnCloseEditTx" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Formulário -->
        <form id="editTxForm" class="p-5 space-y-3.5 text-xs">
          <input type="hidden" id="editTxId">

          <!-- Tipo (Receita vs Despesa) -->
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Tipo de Lançamento</label>
            <select id="editTxType" class="input-fintech font-semibold">
              <option value="expense">Despesa (-)</option>
              <option value="income">Receita (+)</option>
              <option value="transfer">Transferência (↔)</option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-zinc-400 mb-1">Descrição</label>
            <input type="text" id="editTxDescription" required class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" id="editTxAmount" required class="input-fintech font-mono font-bold text-white">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Data</label>
              <input type="date" id="editTxDate" required class="input-fintech">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Categoria</label>
              <select id="editTxCategory" class="input-fintech">
                ${categories.map(c => `<option value="${c.id}">${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Conta Vinculada</label>
              <select id="editTxAccount" class="input-fintech">
                ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelEditTx" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
