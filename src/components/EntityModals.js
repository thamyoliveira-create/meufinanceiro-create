// Modais de Criação de Entidades (Contas a Pagar/Receber, Contas Bancárias, Cartões, Metas, Dívidas, Investimentos, Assinaturas) - Meu Financeiro IA

export function renderEntityModals(categories = [], accounts = []) {
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return `
    <!-- 1. Modal Conta a Pagar / Receber -->
    <div id="billModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="receipt" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider" id="billModalTitle">Nova Conta a Pagar</h3>
          </div>
          <button id="btnCloseBillModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="billForm" class="p-5 space-y-3.5 text-xs">
          <input type="hidden" id="billKind" value="bill"> <!-- 'bill' ou 'receivable' -->

          <div>
            <label class="block font-medium text-zinc-400 mb-1">Descrição</label>
            <input type="text" id="billDescription" required placeholder="Ex: Aluguel, Conta de Luz, Salário Previsto" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" id="billAmount" required placeholder="0,00" class="input-fintech font-mono font-bold text-white">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1" id="billDateLabel">Vencimento</label>
              <input type="date" id="billDueDate" required class="input-fintech">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Categoria</label>
              <select id="billCategory" class="input-fintech">
                ${categories.map(c => `<option value="${c.id}">${c.name} (${c.type === 'income' ? 'Receita' : 'Despesa'})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Recorrência</label>
              <select id="billRecurrence" class="input-fintech">
                <option value="none">Apenas Este Mês</option>
                <option value="monthly" selected>Mensal (Todo Mês)</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelBillModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Conta
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. Modal Nova Conta Bancária -->
    <div id="accountModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="wallet-cards" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Nova Conta Bancária</h3>
          </div>
          <button id="btnCloseAccountModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="accountForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Nome da Conta / Banco</label>
            <input type="text" id="accModalName" required placeholder="Ex: Nubank, Itaú, Inter, Caixa" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Tipo de Conta</label>
              <select id="accModalType" class="input-fintech">
                <option value="checking">Conta Corrente</option>
                <option value="digital_wallet">Carteira Digital</option>
                <option value="savings">Poupança</option>
                <option value="investment">Investimentos</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Saldo Atual (R$)</label>
              <input type="number" step="0.01" id="accModalBalance" required placeholder="0,00" class="input-fintech font-mono font-bold text-white">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelAccountModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Conta
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 3. Modal Novo Cartão de Crédito -->
    <div id="cardModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="credit-card" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Novo Cartão de Crédito</h3>
          </div>
          <button id="btnCloseCardModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="cardForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Nome do Cartão</label>
            <input type="text" id="cardModalName" required placeholder="Ex: Nubank Ultravioleta, Itaú Click" class="input-fintech">
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1">
              <label class="block font-medium text-zinc-400 mb-1">Limite (R$)</label>
              <input type="number" step="100" min="1" id="cardModalLimit" required placeholder="5000,00" class="input-fintech font-mono font-bold text-white">
            </div>
            <div class="col-span-1">
              <label class="block font-medium text-zinc-400 mb-1">Dia Fechamento</label>
              <input type="number" min="1" max="31" id="cardModalClosing" required value="5" class="input-fintech font-mono">
            </div>
            <div class="col-span-1">
              <label class="block font-medium text-zinc-400 mb-1">Dia Vencimento</label>
              <input type="number" min="1" max="31" id="cardModalDue" required value="12" class="input-fintech font-mono">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelCardModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Cartão
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 4. Modal Nova Meta Financeira -->
    <div id="goalModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="target" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Nova Meta / Reserva</h3>
          </div>
          <button id="btnCloseGoalModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="goalForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Objetivo da Meta</label>
            <input type="text" id="goalModalName" required placeholder="Ex: Reserva de Emergência, Viagem Europa, Carro Novo" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor Alvo (R$)</label>
              <input type="number" step="100" min="1" id="goalModalTarget" required placeholder="10000,00" class="input-fintech font-mono font-bold text-white">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor Atual Guardado (R$)</label>
              <input type="number" step="50" min="0" id="goalModalCurrent" required value="0" class="input-fintech font-mono">
            </div>
          </div>

          <div>
            <label class="block font-medium text-zinc-400 mb-1">Data Limite Desejada</label>
            <input type="date" id="goalModalDeadline" required class="input-fintech">
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelGoalModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Meta
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 5. Modal Nova Dívida -->
    <div id="debtModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="percent" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Nova Dívida / Financiamento</h3>
          </div>
          <button id="btnCloseDebtModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="debtForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Descrição da Dívida</label>
            <input type="text" id="debtModalDesc" required placeholder="Ex: Financiamento Imobiliário, Empréstimo, Cheque Especial" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Saldo Devedor Atual (R$)</label>
              <input type="number" step="100" min="1" id="debtModalAmount" required placeholder="15000,00" class="input-fintech font-mono font-bold text-white">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Parcela Mensal (R$)</label>
              <input type="number" step="10" min="0" id="debtModalInstallment" required placeholder="450,00" class="input-fintech font-mono">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Taxa de Juros (% a.m.)</label>
              <input type="number" step="0.1" id="debtModalRate" value="1.5" class="input-fintech font-mono">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Total de Parcelas Restantes</label>
              <input type="number" id="debtModalTotalInstallments" value="24" class="input-fintech font-mono">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelDebtModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Dívida
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 6. Modal Novo Investimento -->
    <div id="investmentModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="trending-up" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Novo Ativo de Investimento</h3>
          </div>
          <button id="btnCloseInvestmentModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="investmentForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Nome do Ativo / Ticker</label>
            <input type="text" id="invModalName" required placeholder="Ex: Tesouro Selic 2029, MXRF11, PETR4, Bitcoin" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Tipo de Investimento</label>
              <select id="invModalType" class="input-fintech">
                <option value="fixed_income">Renda Fixa / Tesouro</option>
                <option value="stocks">Ações (B3)</option>
                <option value="reits">Fundos Imobiliários (FIIs)</option>
                <option value="crypto">Criptomoedas</option>
                <option value="international">Internacional / ETFs</option>
                <option value="funds">Fundos de Investimento</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Corretora / Banco</label>
              <input type="text" id="invModalInstitution" placeholder="Ex: NuInvest, XP, BTG, Inter" class="input-fintech">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Total Aportado (R$)</label>
              <input type="number" step="0.01" min="0.01" id="invModalInvested" required placeholder="1000,00" class="input-fintech font-mono">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor Atual da Posição (R$)</label>
              <input type="number" step="0.01" min="0" id="invModalCurrent" required placeholder="1050,00" class="input-fintech font-mono font-bold text-emerald-400">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelInvestmentModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 7. Modal Nova Assinatura -->
    <div id="subscriptionModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div class="bg-[#101218] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="repeat" class="w-4 h-4 text-zinc-300"></i>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider">Nova Assinatura Recorrente</h3>
          </div>
          <button id="btnCloseSubscriptionModal" class="text-zinc-500 hover:text-white p-1 rounded-md">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="subscriptionForm" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-zinc-400 mb-1">Serviço / Assinatura</label>
            <input type="text" id="subModalName" required placeholder="Ex: Netflix, Spotify, ChatGPT Plus, Academia" class="input-fintech">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Valor Mensal (R$)</label>
              <input type="number" step="0.01" min="0.01" id="subModalAmount" required placeholder="39,90" class="input-fintech font-mono font-bold text-white">
            </div>
            <div>
              <label class="block font-medium text-zinc-400 mb-1">Dia de Cobrança (1-31)</label>
              <input type="number" min="1" max="31" id="subModalDay" required value="10" class="input-fintech font-mono">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button type="button" id="btnCancelSubscriptionModal" class="btn-secondary text-xs">Cancelar</button>
            <button type="submit" class="btn-primary text-xs">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Assinatura
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
