// Controlador Principal da Aplicação - Meu Financeiro IA

import { auth } from './db/auth.js';
import { db } from './db/database.js';
import { loadDemoDataset } from './db/demoData.js';
import { FORMATTERS } from './config/constants.js';
import { FinanceEngine } from './services/financeEngine.js';
import { AIService } from './services/aiService.js';
import { ExportService } from './services/exportService.js';
import { NotificationService } from './services/notificationService.js';
import { StatementParser } from './services/statementParser.js';
import { ReceiptScanner } from './services/receiptScanner.js';
import { FireEngine } from './services/fireEngine.js';
import { SplitExpenseService } from './services/splitExpenseService.js';

// Componentes
import { renderSidebar, MENU_ITEMS } from './components/Sidebar.js';
import { renderNavbar } from './components/Navbar.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderQuickAddModal } from './components/QuickAddModal.js';
import { renderOnboardingModal } from './components/OnboardingModal.js';
import { renderAiChatFloating } from './components/AiChatFloating.js';
import { renderImportStatementModal } from './components/ImportStatementModal.js';
import { renderEditTransactionModal } from './components/EditTransactionModal.js';
import { renderEntityModals } from './components/EntityModals.js';
import { renderWin98Taskbar } from './components/Win98Taskbar.js';

// Visões
import { renderAuthView } from './components/views/AuthView.js';
import { renderDashboardView } from './components/views/DashboardView.js';
import { renderTransactionsView } from './components/views/TransactionsView.js';
import { renderAccountsView } from './components/views/AccountsView.js';
import { renderCardsView } from './components/views/CardsView.js';
import { renderBillsView } from './components/views/BillsView.js';
import { renderBudgetView } from './components/views/BudgetView.js';
import { renderGoalsView } from './components/views/GoalsView.js';
import { renderDebtsView } from './components/views/DebtsView.js';
import { renderInvestmentsView } from './components/views/InvestmentsView.js';
import { renderNetWorthView } from './components/views/NetWorthView.js';
import { renderCalendarView } from './components/views/CalendarView.js';
import { renderReportsView } from './components/views/ReportsView.js';
import { renderSubscriptionsView } from './components/views/SubscriptionsView.js';
import { renderCanIBuyItView } from './components/views/CanIBuyItView.js';
import { renderAiAssistantView } from './components/views/AiAssistantView.js';
import { renderSettingsView } from './components/views/SettingsView.js';
import { renderFireView } from './components/views/FireView.js';
import { renderSplitView } from './components/views/SplitView.js';

class App {
  constructor() {
    this.currentRoute = 'dashboard';
    this.user = null;
    this.theme = localStorage.getItem('meu_financeiro_theme') || 'dark';
    this.isPrivacyMode = localStorage.getItem('meu_financeiro_privacy_mode') === 'true';
    window.__meuFinanceiroPrivacyMode = this.isPrivacyMode;
    this.charts = {};
    this.pendingImportTransactions = [];
  }

  async init() {
    try {
      this.applyTheme(this.theme);
      await db.init();
      this.user = await auth.init();

      if (!this.user) {
        this.renderAuth();
      } else {
        await db.initDefaultCategories(this.user.id);
        await this.renderApp();

        if (!this.user.onboardingCompleted) {
          const onboardingEl = document.getElementById('onboardingModal');
          if (onboardingEl) onboardingEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error('Erro na inicialização da aplicação:', err);
      this.renderAuth();
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('meu_financeiro_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  togglePrivacyMode() {
    this.isPrivacyMode = !this.isPrivacyMode;
    window.__meuFinanceiroPrivacyMode = this.isPrivacyMode;
    localStorage.setItem('meu_financeiro_privacy_mode', String(this.isPrivacyMode));
    this.showToast(this.isPrivacyMode ? 'Modo Privacidade ativado (saldos ocultos)' : 'Modo Privacidade desativado', 'info');
    this.renderApp();
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : 'bg-zinc-800 border border-white/10')
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // ==========================================
  // RENDERIZAÇÃO DA TELA DE LOGIN / CADASTRO
  // ==========================================
  renderAuth(mode = 'login') {
    const root = document.getElementById('app');
    root.innerHTML = renderAuthView(mode);
    this.refreshIcons();

    document.getElementById('btnTabLogin')?.addEventListener('click', () => this.renderAuth('login'));
    document.getElementById('btnTabSignup')?.addEventListener('click', () => this.renderAuth('signup'));
    
    document.getElementById('btnForgotPassword')?.addEventListener('click', () => {
      document.getElementById('authLoginForm')?.classList.add('hidden');
      document.getElementById('authResetForm')?.classList.remove('hidden');
    });

    document.getElementById('btnCancelReset')?.addEventListener('click', () => {
      document.getElementById('authResetForm')?.classList.add('hidden');
      document.getElementById('authLoginForm')?.classList.remove('hidden');
    });

    document.getElementById('authLoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        this.user = await auth.login(email, pass);
        this.showToast('Login realizado com sucesso!');
        await this.init();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    document.getElementById('authSignupForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const pass = document.getElementById('signupPassword').value;
        this.user = await auth.signup(name, email, pass);
        this.showToast('Conta criada com sucesso!');
        await this.init();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    document.getElementById('authResetForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById('resetEmail').value;
        const newPass = document.getElementById('resetNewPassword').value;
        await auth.resetPassword(email, newPass);
        this.showToast('Senha alterada com sucesso! Faça login.');
        this.renderAuth('login');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });
  }

  // ==========================================
  // RENDERIZAÇÃO DA APLICAÇÃO PRINCIPAL
  // ==========================================
  async renderApp() {
    const userId = this.user.id;

    const [accounts, categories, transactions, creditCards, bills, receivables, budgets, goals, debts, investments, assets, liabilities, subscriptions, notifications] = await Promise.all([
      db.getAll('accounts', userId),
      db.getAll('categories', userId),
      db.getAll('transactions', userId),
      db.getAll('credit_cards', userId),
      db.getAll('bills', userId),
      db.getAll('income_receivables', userId),
      db.getAll('budgets', userId),
      db.getAll('goals', userId),
      db.getAll('debts', userId),
      db.getAll('investments', userId),
      db.getAll('assets', userId),
      db.getAll('liabilities', userId),
      db.getAll('subscriptions', userId),
      db.getAll('notifications', userId),
    ]);

    NotificationService.checkAndGenerateNotifications(db, userId);

    const metrics = await FinanceEngine.calculateDashboardMetrics(db, userId);
    const categoryBreakdown = FinanceEngine.calculateCategoryBreakdown(transactions.filter(t => t.date && t.date.startsWith(metrics.monthKey)), categories);
    const anomalies = AIService.detectAnomalies(transactions, categories);
    const insights = AIService.generateMonthlyInsights(metrics, categoryBreakdown, subscriptions, transactions, budgets);

    const isDemoActive = transactions.some(t => t.isDemo) || accounts.some(a => a.isDemo);

    const viewData = {
      user: this.user,
      metrics,
      categoryBreakdown,
      anomalies,
      insights,
      accounts,
      categories,
      transactions,
      creditCards,
      bills,
      receivables,
      budgets,
      goals,
      debts,
      investments,
      assets,
      liabilities,
      subscriptions,
      notifications,
      recentTransactions: transactions.slice(0, 10),
    };

    const currentMenuItem = MENU_ITEMS.find(m => m.id === this.currentRoute) || MENU_ITEMS[0];
    const root = document.getElementById('app');

    root.innerHTML = `
      <div class="min-h-screen bg-[#008080] p-1 sm:p-2.5 flex flex-col justify-between select-none">
        <!-- Janela Principal Windows 98 -->
        <div class="win-window flex-1 flex flex-col max-w-7xl w-full mx-auto shadow-2xl mb-8">
          <!-- Titlebar com Gradiente Azul Clássico e Botões _ □ ✕ -->
          <div class="win-titlebar">
            <div class="flex items-center gap-2">
              <span class="text-xs">🪟</span>
              <span>Meu Financeiro 98 - [${currentMenuItem.label}]</span>
            </div>
            <div class="flex items-center gap-1">
              <button class="win-btn-control" id="btnWinMinimize" title="Minimizar">_</button>
              <button class="win-btn-control" id="btnWinMaximize" title="Maximizar">□</button>
              <button class="win-btn-control font-bold" id="btnWinClose" title="Fechar">✕</button>
            </div>
          </div>

          <!-- Menubar Estilo Windows 98 -->
          <div class="win-menubar">
            <span class="win-menu-item" id="menuItemArquivo">Arquivo</span>
            <span class="win-menu-item" id="menuItemEditar">Editar</span>
            <span class="win-menu-item" id="menuItemExibir">Exibir</span>
            <span class="win-menu-item" id="menuItemLancamento">Novo Lançamento</span>
            <span class="win-menu-item" id="menuItemImportar">Importar Extrato</span>
            <span class="win-menu-item" id="menuItemAjuda">Ajuda</span>
          </div>

          <!-- Barra de Ferramentas com Botões Retro em Relevo 3D -->
          <div class="win-toolbar">
            <button id="btnQuickAddExpense" class="win-btn" title="Registrar Nova Movimentação">
              <span>➕</span> <strong>Novo Gasto</strong>
            </button>
            <button id="btnOpenImportModal" class="win-btn" title="Importar Extrato Bancário">
              <span>📁</span> <strong>Importar Extrato</strong>
            </button>
            <button id="btnTogglePrivacy" class="win-btn" title="Ocultar/Exibir Valores">
              <span>👁️</span> <strong>Modo Privacidade</strong>
            </button>
            <button id="btnExportCSV" class="win-btn" title="Exportar dados para Excel/CSV">
              <span>💾</span> <strong>Salvar CSV</strong>
            </button>
            <div class="h-4 w-px bg-zinc-500 mx-1"></div>
            <button data-route="dashboard" class="sidebar-item win-btn">
              <span>📊</span> Dashboard
            </button>
            <button data-route="transactions" class="sidebar-item win-btn">
              <span>📝</span> Transações
            </button>
            <button data-route="bills" class="sidebar-item win-btn">
              <span>🧾</span> A Pagar
            </button>
            <button data-route="fire" class="sidebar-item win-btn">
              <span>🔥</span> FIRE
            </button>
            <button data-route="split" class="sidebar-item win-btn">
              <span>👥</span> Dividir
            </button>
          </div>

          <!-- Barra de Endereço (Explorer) -->
          <div class="win-addressbar">
            <span class="font-bold text-zinc-700">Endereço:</span>
            <div class="win-inset flex-1 px-2 py-0.5 font-mono text-[11px] bg-white text-black flex items-center gap-1">
              <span>📂</span> C:\\Meus Documentos\\Financeiro98\\<strong>${this.currentRoute}.exe</strong>
            </div>
          </div>

          <!-- Corpo Dividido: Árvore Explorer + Área de Conteúdo -->
          <div class="flex-1 flex overflow-hidden min-h-[500px]">
            <!-- Sidebar Explorer -->
            ${renderSidebar(this.currentRoute)}

            <!-- Área de Conteúdo da Rota -->
            <main class="flex-1 p-3 sm:p-5 overflow-y-auto win-inset bg-white text-black custom-scrollbar">
              <div id="mainViewContainer">
                ${this.getViewHtml(this.currentRoute, viewData)}
              </div>
            </main>
          </div>

          <!-- Barra de Status do Windows 98 -->
          <div class="win-statusbar">
            <div class="win-status-pane">
              <span>Pronto. Sistema Financeiro 98 conectado.</span>
            </div>
            <div class="win-status-pane-fixed">
              Saldo: <strong>${FORMATTERS.formatCurrency(metrics.currentBalance)}</strong>
            </div>
          </div>
        </div>

        <!-- Modais 98 -->
        ${renderQuickAddModal(categories, accounts, creditCards)}
        ${renderEditTransactionModal(categories, accounts)}
        ${renderEntityModals(categories, accounts)}
        ${renderImportStatementModal(accounts, categories)}
        ${renderOnboardingModal()}
        ${renderAiChatFloating()}

        <!-- Taskbar Fixa Inferior com Iniciar e Systray -->
        ${renderWin98Taskbar(this.currentRoute, currentMenuItem.label, notifications.length)}
      </div>
    `;

    this.refreshIcons();
    this.attachEventListeners(viewData);

    if (this.currentRoute === 'dashboard') {
      this.initDashboardCharts(categoryBreakdown, transactions, metrics.monthKey);
    }
  }

  getViewHtml(route, data) {
    switch (route) {
      case 'dashboard': return renderDashboardView(data);
      case 'transactions': return renderTransactionsView(data);
      case 'accounts': return renderAccountsView(data);
      case 'cards': return renderCardsView(data);
      case 'bills': return renderBillsView(data);
      case 'budget': return renderBudgetView(data);
      case 'goals': return renderGoalsView(data);
      case 'fire': return renderFireView(data);
      case 'split': return renderSplitView(data);
      case 'debts': return renderDebtsView(data);
      case 'investments': return renderInvestmentsView(data);
      case 'networth': return renderNetWorthView(data);
      case 'calendar': return renderCalendarView(data);
      case 'reports': return renderReportsView(data);
      case 'subscriptions': return renderSubscriptionsView(data);
      case 'canibuy': return renderCanIBuyItView(data);
      case 'ai_assistant': return renderAiAssistantView(data);
      case 'settings': return renderSettingsView(data);
      default: return renderDashboardView(data);
    }
  }

  initDashboardCharts(categoryBreakdown, transactions, currentMonthKey) {
    Object.values(this.charts).forEach(c => { if (c && c.destroy) c.destroy(); });
    this.charts = {};

    const ctxCategory = document.getElementById('chartCategoryDoughnut');
    if (ctxCategory && categoryBreakdown.list.length > 0) {
      this.charts.category = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: categoryBreakdown.list.map(c => c.name),
          datasets: [{
            data: categoryBreakdown.list.map(c => c.amount),
            backgroundColor: categoryBreakdown.list.map(c => c.color || '#A1A1AA'),
            borderWidth: 0,
            hoverOffset: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.label}: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          cutout: '76%',
        }
      });
    }

    const ctxHistory = document.getElementById('chartCashflowHistory');
    if (ctxHistory) {
      const historyData = FinanceEngine.calculateMonthlyCashflow(transactions, 6);
      this.charts.history = new Chart(ctxHistory, {
        type: 'bar',
        data: {
          labels: historyData.map(h => h.label),
          datasets: [
            {
              label: 'Receitas',
              data: historyData.map(h => h.income),
              backgroundColor: '#10B981',
              borderRadius: 4,
              barPercentage: 0.6,
            },
            {
              label: 'Despesas',
              data: historyData.map(h => h.expense),
              backgroundColor: '#3F3F46',
              borderRadius: 4,
              barPercentage: 0.6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#71717A', boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.dataset.label}: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#71717A', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717A', font: { size: 10 } } }
          }
        }
      });
    }
  }

  attachEventListeners(viewData) {
    const userId = this.user.id;

    // Navegação de Rotas
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        if (route) {
          this.currentRoute = route;
          this.renderApp();
        }
      });
    });

    // Toggle Modo Privacidade
    document.getElementById('btnTogglePrivacy')?.addEventListener('click', () => {
      this.togglePrivacyMode();
    });

    // Dropdowns
    const btnNotifs = document.getElementById('btnNotifications');
    const notifsDropdown = document.getElementById('notificationsDropdown');
    btnNotifs?.addEventListener('click', () => notifsDropdown?.classList.toggle('hidden'));

    const btnProfile = document.getElementById('btnUserProfile');
    const userDropdown = document.getElementById('userDropdown');
    btnProfile?.addEventListener('click', () => userDropdown?.classList.toggle('hidden'));

    document.addEventListener('click', (e) => {
      if (!btnNotifs?.contains(e.target) && !notifsDropdown?.contains(e.target)) {
        notifsDropdown?.classList.add('hidden');
      }
      if (!btnProfile?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.add('hidden');
      }
    });

    // Alternar Tema
    document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
      const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
      this.showToast(`Tema alterado para ${nextTheme === 'dark' ? 'Escuro' : 'Claro'}`);
    });

    // Logout
    document.getElementById('btnLogout')?.addEventListener('click', () => {
      auth.logout();
      this.user = null;
      this.showToast('Você saiu da sua conta.');
      this.renderAuth();
    });

    // ==========================================
    // MODAL DE CADASTRO RÁPIDO & OCR DE FOTO
    // ==========================================
    const modalQuickAdd = document.getElementById('quickAddModal');
    const openQuickAdd = () => {
      if (modalQuickAdd) {
        modalQuickAdd.classList.remove('hidden');
        document.getElementById('txDate').value = FORMATTERS.toIsoDate();
      }
    };

    document.getElementById('btnQuickAddExpense')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnQuickAddHero')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnMobileAddCenter')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnOpenNewTxModal')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnCloseQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));
    document.getElementById('btnCancelQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));

    // OCR / Leitura de Foto de Comprovante
    document.getElementById('receiptImageInput')?.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.showToast('Lendo comprovante com IA...', 'info');
        const scanned = await ReceiptScanner.scanReceiptImage(e.target.files[0], viewData.categories);
        if (scanned) {
          document.getElementById('txDescription').value = scanned.description;
          document.getElementById('txAmount').value = scanned.amount;
          document.getElementById('txDate').value = scanned.date;
          if (scanned.categoryId) document.getElementById('txCategory').value = scanned.categoryId;
          if (scanned.paymentMethod) document.getElementById('txPaymentMethod').value = scanned.paymentMethod;
          this.showToast('Comprovante lido com sucesso! Confira os dados.', 'success');
        }
      }
    });

    // Checkbox Despesa Compartilhada
    document.getElementById('txIsShared')?.addEventListener('change', (e) => {
      const fields = document.getElementById('sharedExpenseFields');
      if (e.target.checked) fields?.classList.remove('hidden');
      else fields?.classList.add('hidden');
    });

    // Parser NL
    document.getElementById('btnParseNL')?.addEventListener('click', () => {
      const text = document.getElementById('nlInputText').value;
      if (!text) return;

      const parsed = AIService.parseNaturalLanguageExpense(text, viewData.categories);
      if (parsed) {
        document.getElementById('txDescription').value = parsed.description;
        if (parsed.amount > 0) document.getElementById('txAmount').value = parsed.amount;
        if (parsed.date) document.getElementById('txDate').value = parsed.date;
        if (parsed.categoryId) document.getElementById('txCategory').value = parsed.categoryId;
        if (parsed.paymentMethod) document.getElementById('txPaymentMethod').value = parsed.paymentMethod;

        if (parsed.installments > 1) {
          document.getElementById('installmentRow')?.classList.remove('hidden');
          document.getElementById('txInstallments').value = String(parsed.installments);
        }

        this.showToast('Dados identificados com sucesso!', 'info');
      }
    });

    // Salvar Transação
    document.getElementById('quickAddForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const type = document.querySelector('input[name="txType"]:checked').value;
        const description = document.getElementById('txDescription').value;
        const amount = parseFloat(document.getElementById('txAmount').value);
        const categoryId = document.getElementById('txCategory').value;
        const date = document.getElementById('txDate').value;
        const accountId = document.getElementById('txAccount').value;
        const paymentMethod = document.getElementById('txPaymentMethod').value;
        const creditCardId = paymentMethod === 'credit' ? document.getElementById('txCreditCard')?.value : null;
        const totalInstallments = paymentMethod === 'credit' ? parseInt(document.getElementById('txInstallments')?.value || '1', 10) : 1;

        const isShared = document.getElementById('txIsShared')?.checked || false;
        const sharedWith = isShared ? document.getElementById('txSharedWith')?.value : null;
        const otherSharePercent = isShared ? parseFloat(document.getElementById('txSharedPercent')?.value || '50') : 0;

        const newTx = {
          userId,
          type,
          description,
          amount,
          categoryId,
          date,
          accountId,
          paymentMethod,
          creditCardId,
          isPaid: true,
          isInstallment: totalInstallments > 1,
          totalInstallments,
          isShared,
          sharedWith,
          otherSharePercent,
        };

        await db.saveTransaction(newTx, userId);
        this.showToast('Lançamento registrado com sucesso!');
        modalQuickAdd.classList.add('hidden');
        document.getElementById('quickAddForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro: ' + err.message, 'error');
      }
    });

    // ==========================================
    // SIMULADOR FIRE FORM
    // ==========================================
    document.getElementById('fireForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentAge = parseInt(document.getElementById('fireAgeInput').value || '28', 10);
      const monthlyCostTarget = parseFloat(document.getElementById('fireCostInput').value || '5000');
      const currentInvested = parseFloat(document.getElementById('fireInvestedInput').value || '0');
      const monthlyContribution = parseFloat(document.getElementById('fireContributionInput').value || '1000');
      const realAnnualReturnRate = parseFloat(document.getElementById('fireReturnRateInput').value || '7');

      const fire = FireEngine.calculateFireProjection({
        currentAge,
        monthlyCostTarget,
        currentInvested,
        monthlyContribution,
        realAnnualReturnRate,
      });

      document.getElementById('fireTargetNumber').textContent = FORMATTERS.formatCurrency(fire.fireTargetNumber);
      document.getElementById('firePassiveIncome').textContent = `${FORMATTERS.formatCurrency(fire.passiveMonthlyIncome)}/mês`;
      document.getElementById('fireYears').textContent = `${fire.yearsToFire} anos`;
      document.getElementById('fireTargetAge').textContent = `${fire.fireAge} anos`;
      document.getElementById('fireProgress').textContent = `${fire.progressPercent.toFixed(1)}%`;
      document.getElementById('fireProgressBar').style.width = `${fire.progressPercent}%`;

      this.showToast('Projeção FIRE recalculada com sucesso!');
    });

    // ==========================================
    // MODAL DE IMPORTAÇÃO DE EXTRATOS
    // ==========================================
    const modalImport = document.getElementById('importStatementModal');
    const openImportModal = () => {
      if (modalImport) {
        modalImport.classList.remove('hidden');
        this.pendingImportTransactions = [];
        document.getElementById('recognizedTransactionsArea')?.classList.add('hidden');
        document.getElementById('btnConfirmImport')?.setAttribute('disabled', 'true');
        document.getElementById('btnConfirmImport')?.classList.add('opacity-50', 'cursor-not-allowed');
      }
    };

    document.getElementById('btnOpenImportModal')?.addEventListener('click', openImportModal);
    document.getElementById('btnCloseImportModal')?.addEventListener('click', () => modalImport?.classList.add('hidden'));
    document.getElementById('btnCancelImport')?.addEventListener('click', () => modalImport?.classList.add('hidden'));

    const tabUpload = document.getElementById('tabUploadFile');
    const tabPaste = document.getElementById('tabPasteText');
    const dropzone = document.getElementById('dropzoneArea');
    const pasteArea = document.getElementById('pasteTextArea');

    tabUpload?.addEventListener('click', () => {
      tabUpload.classList.add('bg-white/10', 'text-white');
      tabPaste.classList.remove('bg-white/10', 'text-white');
      tabPaste.classList.add('text-zinc-400');
      dropzone?.classList.remove('hidden');
      pasteArea?.classList.add('hidden');
    });

    tabPaste?.addEventListener('click', () => {
      tabPaste.classList.add('bg-white/10', 'text-white');
      tabUpload.classList.remove('bg-white/10', 'text-white');
      tabUpload.classList.add('text-zinc-400');
      pasteArea?.classList.remove('hidden');
      dropzone?.classList.add('hidden');
    });

    const fileInput = document.getElementById('statementFileInput');
    dropzone?.addEventListener('click', () => fileInput?.click());

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-white/40');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-white/40');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-white/40');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.processStatementFile(e.dataTransfer.files[0], viewData);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.processStatementFile(e.target.files[0], viewData);
      }
    });

    document.getElementById('btnProcessPastedText')?.addEventListener('click', () => {
      const rawText = document.getElementById('statementRawText').value;
      if (!rawText.trim()) return;

      const targetAccount = document.getElementById('importTargetAccount').value;
      const parsed = StatementParser.parseCSVOrText(rawText, targetAccount, viewData.categories, viewData.transactions);
      this.displayRecognizedTransactions(parsed, viewData);
    });

    document.getElementById('btnConfirmImport')?.addEventListener('click', async () => {
      const selected = this.pendingImportTransactions.filter(t => t.selected);
      if (selected.length === 0) {
        this.showToast('Nenhuma transação selecionada.', 'error');
        return;
      }

      const targetAccount = document.getElementById('importTargetAccount').value;

      for (const item of selected) {
        const newTx = {
          userId,
          accountId: targetAccount,
          categoryId: item.categoryId,
          type: item.type,
          description: item.description,
          amount: Number(item.amount),
          date: item.date,
          paymentMethod: item.paymentMethod || 'pix',
          isPaid: true,
          notes: 'Importado de extrato bancário',
        };
        await db.saveTransaction(newTx, userId);
      }

      this.showToast(`${selected.length} transações importadas com sucesso!`);
      modalImport?.classList.add('hidden');
      await this.renderApp();
    });

    document.getElementById('btnToggleSelectAll')?.addEventListener('click', () => {
      const allSelected = this.pendingImportTransactions.every(t => t.selected);
      this.pendingImportTransactions.forEach(t => t.selected = !allSelected);
      this.renderRecognizedRows(viewData.categories);
    });

    // Chat
    const floatingChatPanel = document.getElementById('floatingChatPanel');
    document.getElementById('btnToggleFloatingChat')?.addEventListener('click', () => {
      floatingChatPanel?.classList.toggle('hidden');
    });
    document.getElementById('btnCloseFloatingChat')?.addEventListener('click', () => {
      floatingChatPanel?.classList.add('hidden');
    });

    const handleChatSubmit = async (queryText, containerId) => {
      if (!queryText.trim()) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'flex items-start justify-end gap-2.5';
      userMsg.innerHTML = `
        <div class="p-2.5 bg-white text-black font-medium rounded-xl rounded-tr-none text-xs max-w-[85%]">
          ${queryText}
        </div>
      `;
      container.appendChild(userMsg);
      container.scrollTop = container.scrollHeight;

      const botMsg = document.createElement('div');
      botMsg.className = 'flex items-start gap-2.5';
      botMsg.innerHTML = `
        <div class="p-3 bg-white/[0.04] border border-white/5 rounded-xl text-zinc-300 text-xs leading-relaxed max-w-[85%]">
          <span class="animate-pulse">Consultando dados cadastrados...</span>
        </div>
      `;
      container.appendChild(botMsg);
      container.scrollTop = container.scrollHeight;

      const apiKey = localStorage.getItem('meu_financeiro_gemini_key') || '';
      const reply = await AIService.handleChatQuery(queryText, {
        metrics: viewData.metrics,
        categories: viewData.categories,
        transactions: viewData.transactions,
        goals: viewData.goals,
        debts: viewData.debts,
        subscriptions: viewData.subscriptions,
        apiKey,
      });

      botMsg.querySelector('div').innerHTML = reply.replace(/\n/g, '<br>');
      container.scrollTop = container.scrollHeight;
    };

    document.getElementById('floatingChatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('floatingChatInput');
      const text = input.value;
      input.value = '';
      handleChatSubmit(text, 'floatingChatMessages');
    });

    document.querySelectorAll('.chat-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-question');
        handleChatSubmit(q, 'floatingChatMessages');
      });
    });

    // ==========================================
    // MODAL DE ONBOARDING GUIADO
    // ==========================================
    const modalOnboarding = document.getElementById('onboardingModal');
    const dismissOnboarding = async () => {
      try {
        this.user.onboardingCompleted = true;
        await auth.updateProfile({ onboardingCompleted: true });
      } catch (err) {
        console.warn('Aviso ao salvar status do onboarding:', err);
      }
      modalOnboarding?.classList.add('hidden');
    };

    document.getElementById('btnSkipOnboarding')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOnboarding();
    });

    document.getElementById('btnSkipOnboardingFooter')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOnboarding();
    });

    // Fechar ao clicar fora da janela
    modalOnboarding?.addEventListener('click', (e) => {
      if (e.target === modalOnboarding) {
        dismissOnboarding();
      }
    });

    document.getElementById('btnSaveOnboarding')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const income = parseFloat(document.getElementById('onbIncome')?.value || '0');
        const monthlyCost = parseFloat(document.getElementById('onbMonthlyCost')?.value || '0');
        const accName = document.getElementById('onbAccountName')?.value.trim();
        const accBalance = parseFloat(document.getElementById('onbAccountBalance')?.value || '0');
        const cardName = document.getElementById('onbCardName')?.value.trim();
        const cardLimit = parseFloat(document.getElementById('onbCardLimit')?.value || '0');

        if (income > 0 || monthlyCost > 0) {
          await auth.updateProfile({
            monthlyIncome: income > 0 ? income : this.user.monthlyIncome,
            onboardingCompleted: true,
          });
        }

        if (accName) {
          await db.saveAccount({
            userId: this.user.id,
            name: accName,
            type: 'checking',
            initialBalance: isNaN(accBalance) ? 0 : accBalance,
            currentBalance: isNaN(accBalance) ? 0 : accBalance,
            color: '#3B82F6',
            icon: 'landmark',
          }, this.user.id);
        }

        if (cardName) {
          await db.save('credit_cards', {
            userId: this.user.id,
            name: cardName,
            limit: isNaN(cardLimit) ? 1000 : cardLimit,
            closingDay: 5,
            dueDay: 12,
            color: '#8B5CF6',
          });
        }

        await dismissOnboarding();
        this.showToast('Configuração inicial concluída com sucesso!');
        await this.renderApp();
      } catch (err) {
        console.error('Erro no onboarding:', err);
        await dismissOnboarding();
        await this.renderApp();
      }
    });

    // ==========================================
    // EDIÇÃO DIRETA E EM LOTE DE CATEGORIAS
    // ==========================================
    // 1. Alteração Direta de Categoria no Select da Tabela
    document.querySelectorAll('.change-cat-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const txId = e.target.getAttribute('data-id');
        const newCatId = e.target.value;
        const tx = await db.getById('transactions', txId);
        if (tx) {
          tx.categoryId = newCatId;
          await db.saveTransaction(tx, userId);
          const catName = viewData.categories.find(c => c.id === newCatId)?.name || 'Categoria';
          this.showToast(`Categoria alterada para "${catName}"!`);
          await this.renderApp();
        }
      });
    });

    // 2. Alternar Tipo Direto (Receita / Despesa) com 1 Clique
    document.querySelectorAll('.btn-toggle-tx-type').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const tx = await db.getById('transactions', id);
        if (tx) {
          tx.type = tx.type === 'income' ? 'expense' : 'income';
          // Ajusta categoria padrão para o novo tipo
          const suitableCat = viewData.categories.find(c => c.type === tx.type);
          if (suitableCat) tx.categoryId = suitableCat.id;

          await db.saveTransaction(tx, userId);
          this.showToast(`Lançamento alterado para ${tx.type === 'income' ? 'Receita (+)' : 'Despesa (-)'}!`);
          await this.renderApp();
        }
      });
    });

    // 3. Seleção em Lote (Checkboxes)
    const updateBulkBar = () => {
      const checked = document.querySelectorAll('.tx-row-check:checked');
      const bulkBar = document.getElementById('bulkActionsBar');
      const countSpan = document.getElementById('bulkSelectedCount');
      if (bulkBar && countSpan) {
        if (checked.length > 0) {
          bulkBar.classList.remove('hidden');
          countSpan.textContent = `${checked.length} transações selecionadas`;
        } else {
          bulkBar.classList.add('hidden');
        }
      }
    };

    document.getElementById('checkSelectAllTx')?.addEventListener('change', (e) => {
      document.querySelectorAll('.tx-row-check').forEach(chk => {
        chk.checked = e.target.checked;
      });
      updateBulkBar();
    });

    document.querySelectorAll('.tx-row-check').forEach(chk => {
      chk.addEventListener('change', updateBulkBar);
    });

    // 4. Mudar Tipo em Lote para Receita (+)
    document.getElementById('btnBulkSetIncome')?.addEventListener('click', async () => {
      const checked = document.querySelectorAll('.tx-row-check:checked');
      if (checked.length === 0) return;

      const incomeCat = viewData.categories.find(c => c.type === 'income');
      for (const chk of checked) {
        const txId = chk.getAttribute('data-id');
        const tx = await db.getById('transactions', txId);
        if (tx) {
          tx.type = 'income';
          if (incomeCat) tx.categoryId = incomeCat.id;
          await db.saveTransaction(tx, userId);
        }
      }
      this.showToast(`${checked.length} transações convertidas em Receitas (+)!`);
      await this.renderApp();
    });

    // 5. Mudar Tipo em Lote para Despesa (-)
    document.getElementById('btnBulkSetExpense')?.addEventListener('click', async () => {
      const checked = document.querySelectorAll('.tx-row-check:checked');
      if (checked.length === 0) return;

      const expenseCat = viewData.categories.find(c => c.type === 'expense');
      for (const chk of checked) {
        const txId = chk.getAttribute('data-id');
        const tx = await db.getById('transactions', txId);
        if (tx) {
          tx.type = 'expense';
          if (expenseCat) tx.categoryId = expenseCat.id;
          await db.saveTransaction(tx, userId);
        }
      }
      this.showToast(`${checked.length} transações convertidas em Despesas (-)!`);
      await this.renderApp();
    });

    // 6. Aplicar Categoria em Lote
    document.getElementById('btnApplyBulkCategory')?.addEventListener('click', async () => {
      const checked = document.querySelectorAll('.tx-row-check:checked');
      const newCatId = document.getElementById('bulkCategorySelect')?.value;
      if (checked.length === 0 || !newCatId) return;

      for (const chk of checked) {
        const txId = chk.getAttribute('data-id');
        const tx = await db.getById('transactions', txId);
        if (tx) {
          tx.categoryId = newCatId;
          await db.saveTransaction(tx, userId);
        }
      }
      const catName = viewData.categories.find(c => c.id === newCatId)?.name || 'Categoria';
      this.showToast(`${checked.length} transações alteradas para "${catName}"!`);
      await this.renderApp();
    });

    // 7. Excluir Selecionadas em Lote
    document.getElementById('btnDeleteBulkSelected')?.addEventListener('click', async () => {
      const checked = document.querySelectorAll('.tx-row-check:checked');
      if (checked.length === 0) return;
      if (confirm(`Excluir as ${checked.length} transações selecionadas?`)) {
        for (const chk of checked) {
          const txId = chk.getAttribute('data-id');
          await db.deleteTransaction(txId, userId);
        }
        this.showToast(`${checked.length} transações excluídas com sucesso.`);
        await this.renderApp();
      }
    });

    // 8. Modal de Edição Detalhada
    const modalEditTx = document.getElementById('editTransactionModal');
    document.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const tx = await db.getById('transactions', id);
        if (tx) {
          document.getElementById('editTxId').value = tx.id;
          document.getElementById('editTxType').value = tx.type || 'expense';
          document.getElementById('editTxDescription').value = tx.description;
          document.getElementById('editTxAmount').value = tx.amount;
          document.getElementById('editTxDate').value = tx.date;
          if (tx.categoryId) document.getElementById('editTxCategory').value = tx.categoryId;
          if (tx.accountId) document.getElementById('editTxAccount').value = tx.accountId;
          modalEditTx?.classList.remove('hidden');
        }
      });
    });

    document.getElementById('btnCloseEditTx')?.addEventListener('click', () => modalEditTx?.classList.add('hidden'));
    document.getElementById('btnCancelEditTx')?.addEventListener('click', () => modalEditTx?.classList.add('hidden'));

    document.getElementById('editTxForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editTxId').value;
      const tx = await db.getById('transactions', id);
      if (tx) {
        tx.type = document.getElementById('editTxType').value;
        tx.description = document.getElementById('editTxDescription').value;
        tx.amount = parseFloat(document.getElementById('editTxAmount').value);
        tx.date = document.getElementById('editTxDate').value;
        tx.categoryId = document.getElementById('editTxCategory').value;
        tx.accountId = document.getElementById('editTxAccount').value;
        await db.saveTransaction(tx, userId);
        this.showToast('Transação atualizada com sucesso!');
        modalEditTx?.classList.add('hidden');
        await this.renderApp();
      }
    });

    // ==========================================
    // MODAIS DE ENTIDADES (CONTAS A PAGAR, BANCOS, CARTÕES, ETC.)
    // ==========================================
    // 1. Contas a Pagar & Contas a Receber
    const modalBill = document.getElementById('billModal');
    document.getElementById('btnOpenNewBillModal')?.addEventListener('click', () => {
      document.getElementById('billKind').value = 'bill';
      document.getElementById('billModalTitle').textContent = 'Nova Conta a Pagar';
      document.getElementById('billDateLabel').textContent = 'Data de Vencimento';
      document.getElementById('billDueDate').value = FORMATTERS.toIsoDate();
      modalBill?.classList.remove('hidden');
    });

    document.getElementById('btnOpenNewReceivableModal')?.addEventListener('click', () => {
      document.getElementById('billKind').value = 'receivable';
      document.getElementById('billModalTitle').textContent = 'Nova Conta a Receber (Previsão)';
      document.getElementById('billDateLabel').textContent = 'Data Prevista';
      document.getElementById('billDueDate').value = FORMATTERS.toIsoDate();
      modalBill?.classList.remove('hidden');
    });

    document.getElementById('btnCloseBillModal')?.addEventListener('click', () => modalBill?.classList.add('hidden'));
    document.getElementById('btnCancelBillModal')?.addEventListener('click', () => modalBill?.classList.add('hidden'));

    document.getElementById('billForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const kind = document.getElementById('billKind').value;
        const description = document.getElementById('billDescription').value.trim();
        const amount = parseFloat(document.getElementById('billAmount').value);
        const dueDate = document.getElementById('billDueDate').value;
        const categoryId = document.getElementById('billCategory').value;
        const recurrence = document.getElementById('billRecurrence').value;

        if (kind === 'bill') {
          await db.save('bills', {
            userId,
            description,
            amount,
            dueDate,
            categoryId,
            recurrence,
            status: 'pending',
          });
          this.showToast('Conta a pagar cadastrada com sucesso!');
        } else {
          await db.save('income_receivables', {
            userId,
            description,
            amount,
            expectedDate: dueDate,
            categoryId,
            recurrence,
            status: 'pending',
          });
          this.showToast('Conta a receber cadastrada com sucesso!');
        }

        modalBill?.classList.add('hidden');
        document.getElementById('billForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao salvar conta: ' + err.message, 'error');
      }
    });

    // Pagar Conta (Efetivar)
    document.querySelectorAll('.btn-mark-bill-paid').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const bill = await db.getById('bills', id);
        if (bill) {
          bill.status = 'paid';
          bill.paidAt = new Date().toISOString();
          await db.save('bills', bill);

          // Gera lançamento automático de despesa no extrato
          await db.saveTransaction({
            userId,
            type: 'expense',
            description: `Pagamento: ${bill.description}`,
            amount: bill.amount,
            categoryId: bill.categoryId,
            date: FORMATTERS.toIsoDate(),
            paymentMethod: 'pix',
            isPaid: true,
            notes: 'Efetivação de conta a pagar',
          }, userId);

          this.showToast(`Conta "${bill.description}" marcada como paga e debitada no saldo!`);
          await this.renderApp();
        }
      });
    });

    // Receber Conta (Efetivar)
    document.querySelectorAll('.btn-mark-rec-received').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const rec = await db.getById('income_receivables', id);
        if (rec) {
          rec.status = 'received';
          rec.receivedAt = new Date().toISOString();
          await db.save('income_receivables', rec);

          // Gera lançamento automático de receita
          await db.saveTransaction({
            userId,
            type: 'income',
            description: `Recebimento: ${rec.description}`,
            amount: rec.amount,
            categoryId: rec.categoryId,
            date: FORMATTERS.toIsoDate(),
            paymentMethod: 'pix',
            isPaid: true,
            notes: 'Efetivação de conta a receber',
          }, userId);

          this.showToast(`Recebimento "${rec.description}" efetivado com sucesso!`);
          await this.renderApp();
        }
      });
    });

    // Excluir Conta a Pagar
    document.querySelectorAll('.btn-delete-bill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Excluir esta conta a pagar?')) {
          await db.delete('bills', id);
          this.showToast('Conta a pagar excluída.');
          await this.renderApp();
        }
      });
    });

    // Excluir Conta a Receber
    document.querySelectorAll('.btn-delete-rec').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Excluir esta conta a receber?')) {
          await db.delete('income_receivables', id);
          this.showToast('Recebível excluído.');
          await this.renderApp();
        }
      });
    });

    // 2. Contas Bancárias
    const modalAccount = document.getElementById('accountModal');
    document.getElementById('btnOpenNewAccountModal')?.addEventListener('click', () => modalAccount?.classList.remove('hidden'));
    document.getElementById('btnCloseAccountModal')?.addEventListener('click', () => modalAccount?.classList.add('hidden'));
    document.getElementById('btnCancelAccountModal')?.addEventListener('click', () => modalAccount?.classList.add('hidden'));

    document.getElementById('accountForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('accModalName').value.trim();
        const type = document.getElementById('accModalType').value;
        const balance = parseFloat(document.getElementById('accModalBalance').value || '0');

        await db.saveAccount({
          userId,
          name,
          type,
          initialBalance: balance,
          currentBalance: balance,
          color: '#3B82F6',
          icon: 'landmark',
        }, userId);

        this.showToast(`Conta "${name}" criada com sucesso!`);
        modalAccount?.classList.add('hidden');
        document.getElementById('accountForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao criar conta: ' + err.message, 'error');
      }
    });

    // 3. Cartões de Crédito
    const modalCard = document.getElementById('cardModal');
    document.getElementById('btnOpenNewCardModal')?.addEventListener('click', () => modalCard?.classList.remove('hidden'));
    document.getElementById('btnCloseCardModal')?.addEventListener('click', () => modalCard?.classList.add('hidden'));
    document.getElementById('btnCancelCardModal')?.addEventListener('click', () => modalCard?.classList.add('hidden'));

    document.getElementById('cardForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('cardModalName').value.trim();
        const limit = parseFloat(document.getElementById('cardModalLimit').value || '1000');
        const closingDay = parseInt(document.getElementById('cardModalClosing').value || '5', 10);
        const dueDay = parseInt(document.getElementById('cardModalDue').value || '12', 10);

        await db.save('credit_cards', {
          userId,
          name,
          limit,
          closingDay,
          dueDay,
          color: '#8B5CF6',
        });

        this.showToast(`Cartão "${name}" cadastrado com sucesso!`);
        modalCard?.classList.add('hidden');
        document.getElementById('cardForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao criar cartão: ' + err.message, 'error');
      }
    });

    // 4. Metas Financeiras
    const modalGoal = document.getElementById('goalModal');
    document.getElementById('btnOpenNewGoalModal')?.addEventListener('click', () => {
      document.getElementById('goalModalDeadline').value = FORMATTERS.toIsoDate();
      modalGoal?.classList.remove('hidden');
    });
    document.getElementById('btnCloseGoalModal')?.addEventListener('click', () => modalGoal?.classList.add('hidden'));
    document.getElementById('btnCancelGoalModal')?.addEventListener('click', () => modalGoal?.classList.add('hidden'));

    document.getElementById('goalForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('goalModalName').value.trim();
        const targetAmount = parseFloat(document.getElementById('goalModalTarget').value || '1000');
        const currentAmount = parseFloat(document.getElementById('goalModalCurrent').value || '0');
        const deadline = document.getElementById('goalModalDeadline').value;

        await db.save('goals', {
          userId,
          name,
          targetAmount,
          currentAmount,
          deadline,
          status: 'active',
          color: '#10B981',
        });

        this.showToast(`Meta "${name}" criada com sucesso!`);
        modalGoal?.classList.add('hidden');
        document.getElementById('goalForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao criar meta: ' + err.message, 'error');
      }
    });

    // 5. Dívidas
    const modalDebt = document.getElementById('debtModal');
    document.getElementById('btnOpenNewDebtModal')?.addEventListener('click', () => modalDebt?.classList.remove('hidden'));
    document.getElementById('btnCloseDebtModal')?.addEventListener('click', () => modalDebt?.classList.add('hidden'));
    document.getElementById('btnCancelDebtModal')?.addEventListener('click', () => modalDebt?.classList.add('hidden'));

    document.getElementById('debtForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('debtModalDesc').value.trim();
        const totalAmount = parseFloat(document.getElementById('debtModalAmount').value || '1000');
        const installmentAmount = parseFloat(document.getElementById('debtModalInstallment').value || '0');
        const interestRate = parseFloat(document.getElementById('debtModalRate').value || '1.5');
        const totalInstallments = parseInt(document.getElementById('debtModalTotalInstallments').value || '12', 10);

        await db.save('debts', {
          userId,
          name,
          totalAmount,
          remainingAmount: totalAmount,
          installmentAmount,
          interestRate,
          totalInstallments,
          remainingInstallments: totalInstallments,
          status: 'active',
        });

        this.showToast(`Dívida "${name}" registrada com sucesso!`);
        modalDebt?.classList.add('hidden');
        document.getElementById('debtForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao registrar dívida: ' + err.message, 'error');
      }
    });

    // 6. Investimentos
    const modalInv = document.getElementById('investmentModal');
    document.getElementById('btnOpenNewInvestmentModal')?.addEventListener('click', () => modalInv?.classList.remove('hidden'));
    document.getElementById('btnCloseInvestmentModal')?.addEventListener('click', () => modalInv?.classList.add('hidden'));
    document.getElementById('btnCancelInvestmentModal')?.addEventListener('click', () => modalInv?.classList.add('hidden'));

    document.getElementById('investmentForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('invModalName').value.trim();
        const type = document.getElementById('invModalType').value;
        const institution = document.getElementById('invModalInstitution').value.trim();
        const investedAmount = parseFloat(document.getElementById('invModalInvested').value || '0');
        const currentValue = parseFloat(document.getElementById('invModalCurrent').value || '0');

        await db.save('investments', {
          userId,
          name,
          type,
          institution,
          investedAmount,
          currentValue,
          lastUpdated: new Date().toISOString(),
        });

        this.showToast(`Ativo "${name}" cadastrado com sucesso!`);
        modalInv?.classList.add('hidden');
        document.getElementById('investmentForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao cadastrar ativo: ' + err.message, 'error');
      }
    });

    // 7. Assinaturas
    const modalSub = document.getElementById('subscriptionModal');
    document.getElementById('btnOpenNewSubModal')?.addEventListener('click', () => modalSub?.classList.remove('hidden'));
    document.getElementById('btnCloseSubscriptionModal')?.addEventListener('click', () => modalSub?.classList.add('hidden'));
    document.getElementById('btnCancelSubscriptionModal')?.addEventListener('click', () => modalSub?.classList.add('hidden'));

    document.getElementById('subscriptionForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('subModalName').value.trim();
        const amount = parseFloat(document.getElementById('subModalAmount').value || '0');
        const billingDay = parseInt(document.getElementById('subModalDay').value || '10', 10);

        await db.save('subscriptions', {
          userId,
          name,
          amount,
          billingDay,
          periodicity: 'monthly',
          isActive: true,
        });

        this.showToast(`Assinatura "${name}" cadastrada com sucesso!`);
        modalSub?.classList.add('hidden');
        document.getElementById('subscriptionForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao cadastrar assinatura: ' + err.message, 'error');
      }
    });

    // Fechamento no backdrop para todos os modais
    ['billModal', 'accountModal', 'cardModal', 'goalModal', 'debtModal', 'investmentModal', 'subscriptionModal', 'editTransactionModal'].forEach(mId => {
      const el = document.getElementById(mId);
      el?.addEventListener('click', (e) => {
        if (e.target === el) el.classList.add('hidden');
      });
    });

    // ==========================================
    // CONTROLES DO WINDOWS 98 (MENU INICIAR, TASKBAR & SYSTRAY)
    // ==========================================
    const startMenu = document.getElementById('win98StartMenu');
    const startBtn = document.getElementById('btnWinStart');

    // Alternar Menu Iniciar
    startBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      startMenu?.classList.toggle('hidden');
      startBtn?.classList.toggle('active');
    });

    // Fechar Menu Iniciar ao clicar fora
    document.addEventListener('click', (e) => {
      if (startMenu && !startMenu.contains(e.target) && e.target !== startBtn) {
        startMenu.classList.add('hidden');
        startBtn?.classList.remove('active');
      }
    });

    // Ações do Menu Iniciar
    document.getElementById('btnStartMenuImport')?.addEventListener('click', () => {
      startMenu?.classList.add('hidden');
      document.getElementById('importStatementModal')?.classList.remove('hidden');
    });

    document.getElementById('btnStartMenuPrivacy')?.addEventListener('click', () => {
      startMenu?.classList.add('hidden');
      window.__meuFinanceiroPrivacyMode = !window.__meuFinanceiroPrivacyMode;
      this.showToast(`Modo Privacidade ${window.__meuFinanceiroPrivacyMode ? 'Ativado' : 'Desativado'}!`);
      this.renderApp();
    });

    document.getElementById('btnTrayPrivacy')?.addEventListener('click', () => {
      window.__meuFinanceiroPrivacyMode = !window.__meuFinanceiroPrivacyMode;
      this.showToast(`Modo Privacidade ${window.__meuFinanceiroPrivacyMode ? 'Ativado' : 'Desativado'}!`);
      this.renderApp();
    });

    document.getElementById('btnStartMenuShutdown')?.addEventListener('click', () => {
      startMenu?.classList.add('hidden');
      if (confirm('Deseja realmente encerrar a sessão do Windows 98?')) {
        auth.logout();
        this.user = null;
        this.renderApp();
      }
    });

    // Botões de Janela _ □ ✕
    document.getElementById('btnWinMinimize')?.addEventListener('click', () => {
      this.showToast('Janela minimizada para a barra de tarefas.');
    });
    document.getElementById('btnWinMaximize')?.addEventListener('click', () => {
      this.showToast('Modo tela cheia ativado.');
    });
    document.getElementById('btnWinClose')?.addEventListener('click', () => {
      this.showToast('Para fechar, use o Menu Iniciar > Desligar.');
    });

    // Relógio Digital do Systray (Atualiza em tempo real)
    const updateWinClock = () => {
      const clockEl = document.getElementById('winClock');
      if (clockEl) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}`;
      }
    };
    updateWinClock();
    if (!window.__winClockInterval) {
      window.__winClockInterval = setInterval(updateWinClock, 1000);
    }

    // Menubar do Topo
    document.getElementById('menuItemLancamento')?.addEventListener('click', () => {
      document.getElementById('quickAddModal')?.classList.remove('hidden');
    });
    document.getElementById('menuItemImportar')?.addEventListener('click', () => {
      document.getElementById('importStatementModal')?.classList.remove('hidden');
    });
    document.getElementById('menuItemAjuda')?.addEventListener('click', () => {
      alert('Meu Financeiro 98 SE\nVersão 4.10.1998\nSistema Pessoal de Finanças com IA e Nostalgia');
    });

    // Outros listeners gerais
    document.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Excluir esta transação?')) {
          await db.deleteTransaction(id, userId);
          this.showToast('Transação excluída.');
          await this.renderApp();
        }
      });
    });

    document.querySelectorAll('.btn-duplicate-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const tx = await db.getById('transactions', id);
        if (tx) {
          const dup = { ...tx, id: null, description: `${tx.description} (Cópia)` };
          await db.saveTransaction(dup, userId);
          this.showToast('Transação duplicada.');
          await this.renderApp();
        }
      });
    });

    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      ExportService.exportTransactionsToCSV(viewData.transactions, viewData.categories, viewData.accounts);
      this.showToast('CSV exportado!');
    });

    document.getElementById('btnPrintPDF')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnLoadDemoData')?.addEventListener('click', async () => {
      if (confirm('Carregar dados de demonstração em BRL?')) {
        await loadDemoDataset(db, userId);
        this.showToast('Dados de demonstração carregados.');
        await this.renderApp();
      }
    });

    document.getElementById('btnWipeDemoData')?.addEventListener('click', async () => {
      if (confirm('Remover dados fictícios de demonstração?')) {
        await db.wipeDemoData(userId);
        this.showToast('Dados de demonstração removidos.');
        await this.renderApp();
      }
    });
  }

  processStatementFile(file, viewData) {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const targetAccount = document.getElementById('importTargetAccount').value;
        this.showToast(isPdf ? 'Processando páginas do PDF...' : 'Analisando extrato...', 'info');
        const parsed = await StatementParser.parseStatement(content, file.name, targetAccount, viewData.categories, viewData.transactions);
        this.displayRecognizedTransactions(parsed, viewData);
      } catch (err) {
        console.error('Erro ao ler extrato:', err);
        this.showToast('Erro ao ler o arquivo: ' + err.message, 'error');
      }
    };

    if (isPdf) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }

  displayRecognizedTransactions(transactions, viewData) {
    this.pendingImportTransactions = transactions;
    const tableArea = document.getElementById('recognizedTransactionsArea');
    const badge = document.getElementById('recognizedCountBadge');
    const confirmBtn = document.getElementById('btnConfirmImport');

    if (transactions.length === 0) {
      this.showToast('Nenhuma transação válida identificada.', 'error');
      return;
    }

    tableArea?.classList.remove('hidden');
    if (badge) badge.textContent = String(transactions.length);

    if (confirmBtn) {
      confirmBtn.removeAttribute('disabled');
      confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    this.renderRecognizedRows(viewData.categories);
    this.refreshIcons();
  }

  renderRecognizedRows(categories) {
    const tbody = document.getElementById('recognizedTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.pendingImportTransactions.map((tx, idx) => `
      <tr class="hover:bg-white/[0.02] text-xs">
        <td class="p-2 text-center">
          <input type="checkbox" class="stmt-check" data-index="${idx}" ${tx.selected ? 'checked' : ''}>
        </td>
        <td class="p-2 font-mono text-zinc-400 text-[11px]">${FORMATTERS.formatDate(tx.date)}</td>
        <td class="p-2">
          <input type="text" value="${tx.description}" class="input-fintech text-xs py-1 px-1.5 stmt-desc" data-index="${idx}">
          ${tx.isDuplicate ? '<span class="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20 font-semibold">Possível Duplicata</span>' : ''}
        </td>
        <td class="p-2">
          <select class="input-fintech text-[10px] py-1 px-1.5 stmt-type font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}" data-index="${idx}">
            <option value="expense" ${tx.type === 'expense' ? 'selected' : ''}>- Despesa</option>
            <option value="income" ${tx.type === 'income' ? 'selected' : ''}>+ Receita</option>
          </select>
        </td>
        <td class="p-2">
          <select class="input-fintech text-[11px] py-1 px-1.5 stmt-cat" data-index="${idx}">
            ${categories.filter(c => c.type === tx.type).map(c => `
              <option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </td>
        <td class="p-2 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}">
          ${tx.type === 'income' ? '+' : '-'} ${FORMATTERS.formatCurrency(tx.amount)}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.stmt-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].selected = e.target.checked;
        this.updateImportSummary();
      });
    });

    tbody.querySelectorAll('.stmt-type').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        const newType = e.target.value;
        this.pendingImportTransactions[idx].type = newType;
        const matchingCat = categories.find(c => c.type === newType);
        if (matchingCat) this.pendingImportTransactions[idx].categoryId = matchingCat.id;
        this.renderRecognizedRows(categories);
      });
    });

    tbody.querySelectorAll('.stmt-desc').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].description = e.target.value;
      });
    });

    tbody.querySelectorAll('.stmt-cat').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this.pendingImportTransactions[idx].categoryId = e.target.value;
      });
    });

    this.updateImportSummary();
  }

  updateImportSummary() {
    const selected = this.pendingImportTransactions.filter(t => t.selected);
    const totalAmount = selected.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
    const summaryText = document.getElementById('importSummaryText');
    if (summaryText) {
      summaryText.textContent = `${selected.length} de ${this.pendingImportTransactions.length} lançamentos selecionados (Impacto: ${FORMATTERS.formatCurrency(totalAmount)})`;
    }
  }

  refreshIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}

const app = new App();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
