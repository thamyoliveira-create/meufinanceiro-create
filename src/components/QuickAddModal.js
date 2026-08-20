// Modal de Cadastro Rápido com Inteligência Artificial - Meu Financeiro IA

export function renderQuickAddModal(categories = [], accounts = [], creditCards = []) {
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return `
    <div id="quickAddModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Registrar Movimentação</h3>
              <p class="text-xs text-slate-400">Escreva naturalmente ou preencha o formulário</p>
            </div>
          </div>
          <button id="btnCloseQuickAdd" class="text-slate-400 hover:text-white p-1 rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="p-6 space-y-5">
          <!-- Campo de Linguagem Natural com IA -->
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="bot" class="w-3.5 h-3.5"></i> Interpretação por IA (Opcional)
            </label>
            <div class="relative">
              <input type="text" id="nlInputText" placeholder='Ex: "Gastei 48 reais no Uber hoje" ou "Mercado 158,90 em 2x"' class="input-fintech pr-20 text-sm">
              <button id="btnParseNL" class="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors">
                <i data-lucide="wand-2" class="w-3 h-3"></i> Analisar
              </button>
            </div>
            <p class="text-[11px] text-slate-400">A IA preenche os campos abaixo para você conferir antes de salvar.</p>
          </div>

          <!-- Divisor Visual -->
          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-800 w-full"></div>
            <span class="bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">Conferência dos Dados</span>
          </div>

          <!-- Formulário Detalhado -->
          <form id="quickAddForm" class="space-y-4">
            <!-- Tipo: Despesa vs Receita vs Transferência -->
            <div class="grid grid-cols-3 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="expense" checked class="peer sr-only">
                <div class="text-center py-2 text-xs font-bold rounded-lg text-slate-400 peer-checked:bg-red-500/20 peer-checked:text-red-400 transition-colors">
                  Despesa
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="income" class="peer sr-only">
                <div class="text-center py-2 text-xs font-bold rounded-lg text-slate-400 peer-checked:bg-emerald-500/20 peer-checked:text-emerald-400 transition-colors">
                  Receita
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="txType" value="transfer" class="peer sr-only">
                <div class="text-center py-2 text-xs font-bold rounded-lg text-slate-400 peer-checked:bg-blue-500/20 peer-checked:text-blue-400 transition-colors">
                  Transferência
                </div>
              </label>
            </div>

            <!-- Descrição e Valor -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <input type="text" id="txDescription" required placeholder="Ex: Supermercado" class="input-fintech">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" min="0.01" id="txAmount" required placeholder="0,00" class="input-fintech font-mono font-bold text-white">
              </div>
            </div>

            <!-- Categoria e Data -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="categoryContainer">
                <label class="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select id="txCategory" class="input-fintech">
                  ${expenseCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                <input type="date" id="txDate" required class="input-fintech">
              </div>
            </div>

            <!-- Conta e Forma de Pagamento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Conta de Origem</label>
                <select id="txAccount" class="input-fintech">
                  ${accounts.map(a => `<option value="${a.id}">${a.name} (R$ ${Number(a.currentBalance || 0).toFixed(2)})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
                <select id="txPaymentMethod" class="input-fintech">
                  <option value="pix">Pix</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="money">Dinheiro</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <!-- Parcelamento (Condicional para Cartão) -->
            <div id="installmentRow" class="hidden grid grid-cols-2 gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Cartão de Crédito</label>
                <select id="txCreditCard" class="input-fintech">
                  ${creditCards.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Nº de Parcelas</label>
                <select id="txInstallments" class="input-fintech">
                  <option value="1">1x (À vista na fatura)</option>
                  <option value="2">2x</option>
                  <option value="3">3x</option>
                  <option value="4">4x</option>
                  <option value="5">5x</option>
                  <option value="6">6x</option>
                  <option value="10">10x</option>
                  <option value="12">12x</option>
                  <option value="24">24x</option>
                </select>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" id="btnCancelQuickAdd" class="btn-secondary text-xs">Cancelar</button>
              <button type="submit" class="btn-primary text-xs">
                <i data-lucide="check" class="w-4 h-4"></i> Confirmar e Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
