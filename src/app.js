// Controlador Principal da Aplicação - Meu Financeiro IA

import { auth } from './db/auth.js';
import { db } from './db/database.js';
import { loadDemoDataset } from './db/demoData.js';
import { FORMATTERS } from './config/constants.js';
import { FinanceEngine } from './services/financeEngine.js';
import { AIService } from './services/aiService.js';
import { ExportService } from './services/exportService.js';
import { NotificationService } from './services/notificationService.js';

// Componentes
import { renderSidebar, MENU_ITEMS } from './components/Sidebar.js';
import { renderNavbar } from './components/Navbar.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderQuickAddModal } from './components/QuickAddModal.js';
import { renderOnboardingModal } from './components/OnboardingModal.js';
import { renderAiChatFloating } from './components/AiChatFloating.js';

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

class App {
  constructor() {
    this.currentRoute = 'dashboard';
    this.user = null;
    this.theme = localStorage.getItem('meu_financeiro_theme') || 'dark';
    this.charts = {};
  }

  async init() {
    this.applyTheme(this.theme);
    await db.init();
    this.user = await auth.init();

    if (!this.user) {
      this.renderAuth();
    } else {
      await db.initDefaultCategories(this.user.id);
      await this.renderApp();

      // Checa se precisa exibir o onboarding inicial
      if (!this.user.onboardingCompleted) {
        const onboardingEl = document.getElementById('onboardingModal');
        if (onboardingEl) onboardingEl.classList.remove('hidden');
      }
    }
  }

  // Alternar Tema
  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('meu_financeiro_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Notificações Toast
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-red-600' : 'bg-indigo-600')
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // RENDERIZAÇÃO DA TELA DE LOGIN / CADASTRO
  // ==========================================
  renderAuth(mode = 'login') {
    const root = document.getElementById('app');
    root.innerHTML = renderAuthView(mode);
    this.refreshIcons();

    // Eventos de troca de aba
    document.getElementById('btnTabLogin')?.addEventListener('click', () => this.renderAuth('login'));
    document.getElementById('btnTabSignup')?.addEventListener('click', () => this.renderAuth('signup'));
    
    // Esqueci a senha
    document.getElementById('btnForgotPassword')?.addEventListener('click', () => {
      document.getElementById('authLoginForm')?.classList.add('hidden');
      document.getElementById('authResetForm')?.classList.remove('hidden');
    });

    document.getElementById('btnCancelReset')?.addEventListener('click', () => {
      document.getElementById('authResetForm')?.classList.add('hidden');
      document.getElementById('authLoginForm')?.classList.remove('hidden');
    });

    // Submissão Login
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

    // Submissão Cadastro
    document.getElementById('authSignupForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const pass = document.getElementById('signupPassword').value;
        this.user = await auth.signup(name, email, pass);
        this.showToast('Conta criada com sucesso! Bem-vindo(a).');
        await this.init();
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    // Submissão Reset de Senha
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

    // 1. Carrega dados do banco do usuário
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

    // Executa verificação de alertas
    NotificationService.checkAndGenerateNotifications(db, userId);

    // 2. Cálculos Financeiros
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

    // 3. Renderiza Estrutura da Interface
    const currentMenuItem = MENU_ITEMS.find(m => m.id === this.currentRoute) || MENU_ITEMS[0];
    const root = document.getElementById('app');

    root.innerHTML = `
      <div class="min-h-screen bg-slate-950 flex">
        <!-- Sidebar Desktop -->
        ${renderSidebar(this.currentRoute)}

        <!-- Área Principal de Conteúdo -->
        <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <!-- Navbar -->
          ${renderNavbar(currentMenuItem.label, this.user, notifications, isDemoActive)}

          <!-- Conteúdo da Rota Ativa -->
          <main class="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            <div id="mainViewContainer">
              ${this.getViewHtml(this.currentRoute, viewData)}
            </div>
          </main>
        </div>

        <!-- Navegação Mobile Inferior -->
        ${renderMobileNav(this.currentRoute)}

        <!-- Modal de Cadastro Rápido com IA -->
        ${renderQuickAddModal(categories, accounts, creditCards)}

        <!-- Modal de Onboarding -->
        ${renderOnboardingModal()}

        <!-- Assistente IA Flutuante -->
        ${renderAiChatFloating()}
      </div>
    `;

    this.refreshIcons();
    this.attachEventListeners(viewData);

    // Inicializa gráficos se estiver no Dashboard
    if (this.currentRoute === 'dashboard') {
      this.initDashboardCharts(categoryBreakdown, transactions, metrics.monthKey);
    }
  }

  // Obter HTML da visão selecionada
  getViewHtml(route, data) {
    switch (route) {
      case 'dashboard': return renderDashboardView(data);
      case 'transactions': return renderTransactionsView(data);
      case 'accounts': return renderAccountsView(data);
      case 'cards': return renderCardsView(data);
      case 'bills': return renderBillsView(data);
      case 'budget': return renderBudgetView(data);
      case 'goals': return renderGoalsView(data);
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

  // ==========================================
  // GRÁFICOS CHART.JS DO DASHBOARD
  // ==========================================
  initDashboardCharts(categoryBreakdown, transactions, currentMonthKey) {
    // Destrói gráficos anteriores se existirem
    Object.values(this.charts).forEach(c => { if (c && c.destroy) c.destroy(); });
    this.charts = {};

    // 1. Doughnut de Categorias
    const ctxCategory = document.getElementById('chartCategoryDoughnut');
    if (ctxCategory && categoryBreakdown.list.length > 0) {
      this.charts.category = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: categoryBreakdown.list.map(c => c.name),
          datasets: [{
            data: categoryBreakdown.list.map(c => c.amount),
            backgroundColor: categoryBreakdown.list.map(c => c.color || '#10B981'),
            borderWidth: 0,
            hoverOffset: 6,
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
          cutout: '72%',
        }
      });
    }

    // 2. Histórico de 6 Meses Receitas x Despesas
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
              borderRadius: 6,
            },
            {
              label: 'Despesas',
              data: historyData.map(h => h.expense),
              backgroundColor: '#EF4444',
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#9CA3AF', font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (item) => ` ${item.dataset.label}: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
          }
        }
      });
    }

    // 3. Gastos Diários ao Longo do Mês (Picos)
    const ctxDaily = document.getElementById('chartDailyExpenses');
    if (ctxDaily) {
      const dailyData = FinanceEngine.calculateDailyExpenses(transactions, currentMonthKey);
      this.charts.daily = new Chart(ctxDaily, {
        type: 'line',
        data: {
          labels: dailyData.map(d => `Dia ${d.day}`),
          datasets: [{
            label: 'Gasto no Dia (R$)',
            data: dailyData.map(d => d.amount),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => ` Gasto: ${FORMATTERS.formatCurrency(item.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF', maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
          }
        }
      });
    }
  }

  // ==========================================
  // EVENT LISTENERS E INTERAÇÕES
  // ==========================================
  attachEventListeners(viewData) {
    const userId = this.user.id;

    // Navegação de Rotas
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = btn.getAttribute('data-route');
        if (route) {
          this.currentRoute = route;
          this.renderApp();
        }
      });
    });

    // Toggle Dropdowns
    const btnNotifs = document.getElementById('btnNotifications');
    const notifsDropdown = document.getElementById('notificationsDropdown');
    btnNotifs?.addEventListener('click', () => notifsDropdown?.classList.toggle('hidden'));

    const btnProfile = document.getElementById('btnUserProfile');
    const userDropdown = document.getElementById('userDropdown');
    btnProfile?.addEventListener('click', () => userDropdown?.classList.toggle('hidden'));

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
      if (!btnNotifs?.contains(e.target) && !notifsDropdown?.contains(e.target)) {
        notifsDropdown?.classList.add('hidden');
      }
      if (!btnProfile?.contains(e.target) && !userDropdown?.contains(e.target)) {
        userDropdown?.classList.add('hidden');
      }
    });

    // Alternar Tema no Navbar
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
    // MODAL DE CADASTRO RÁPIDO COM IA
    // ==========================================
    const modalQuickAdd = document.getElementById('quickAddModal');
    const openQuickAdd = () => {
      if (modalQuickAdd) {
        modalQuickAdd.classList.remove('hidden');
        document.getElementById('txDate').value = FORMATTERS.toIsoDate();
      }
    };

    document.getElementById('btnQuickAddExpense')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnMobileAddCenter')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnEmptyAddTx')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnOpenNewTxModal')?.addEventListener('click', openQuickAdd);
    document.getElementById('btnCloseQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));
    document.getElementById('btnCancelQuickAdd')?.addEventListener('click', () => modalQuickAdd?.classList.add('hidden'));

    // Parser de Linguagem Natural com IA
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

        // Se for crédito com parcelas
        if (parsed.installments > 1) {
          document.getElementById('installmentRow')?.classList.remove('hidden');
          document.getElementById('txInstallments').value = String(parsed.installments);
        }

        this.showToast('Dados interpretados com sucesso pela IA! Confira e confirme.', 'info');
      }
    });

    // Exibe ou oculta opções de parcelamento quando selecionar Cartão de Crédito
    document.getElementById('txPaymentMethod')?.addEventListener('change', (e) => {
      const row = document.getElementById('installmentRow');
      if (e.target.value === 'credit') {
        row?.classList.remove('hidden');
      } else {
        row?.classList.add('hidden');
      }
    });

    // Salvar Transação do Modal
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
        };

        await db.saveTransaction(newTx, userId);
        this.showToast('Transação registrada e saldo atualizado com sucesso!');
        modalQuickAdd.classList.add('hidden');
        document.getElementById('quickAddForm').reset();
        await this.renderApp();
      } catch (err) {
        this.showToast('Erro ao salvar transação: ' + err.message, 'error');
      }
    });

    // Ações na Tabela de Transações (Excluir e Duplicar)
    document.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Deseja realmente excluir esta transação? O saldo da conta será recalculado.')) {
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
          this.showToast('Transação duplicada com sucesso!');
          await this.renderApp();
        }
      });
    });

    // Exportar CSV
    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      ExportService.exportTransactionsToCSV(viewData.transactions, viewData.categories, viewData.accounts);
      this.showToast('Arquivo CSV gerado com sucesso!');
    });

    document.getElementById('btnExportFullCSV')?.addEventListener('click', () => {
      ExportService.exportTransactionsToCSV(viewData.transactions, viewData.categories, viewData.accounts);
      this.showToast('Relatório CSV exportado!');
    });

    document.getElementById('btnPrintPDF')?.addEventListener('click', () => {
      window.print();
    });

    // ==========================================
    // CONTAS A PAGAR E A RECEBER
    // ==========================================
    document.querySelectorAll('.btn-mark-bill-paid').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await db.markBillAsPaid(id, null, FORMATTERS.toIsoDate(), userId);
          this.showToast('Conta marcada como paga e despesa registrada no saldo!');
          await this.renderApp();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    });

    document.querySelectorAll('.btn-mark-rec-received').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await db.markReceivableAsReceived(id, null, FORMATTERS.toIsoDate(), userId);
          this.showToast('Recebimento confirmado e adicionado ao saldo!');
          await this.renderApp();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    });

    // ==========================================
    // DADOS DE DEMONSTRAÇÃO E CONFIGURAÇÕES
    // ==========================================
    document.getElementById('btnLoadDemoData')?.addEventListener('click', async () => {
      if (confirm('Deseja carregar os dados de demonstração em BRL?')) {
        await loadDemoDataset(db, userId);
        this.showToast('Dados de demonstração carregados com sucesso!');
        await this.renderApp();
      }
    });

    document.getElementById('btnWipeDemoData')?.addEventListener('click', async () => {
      if (confirm('Deseja remover todos os registros demonstrativos?')) {
        await db.wipeDemoData(userId);
        this.showToast('Dados de demonstração removidos!');
        await this.renderApp();
      }
    });

    document.getElementById('btnDownloadBackup')?.addEventListener('click', async () => {
      const backupData = {
        user: this.user,
        transactions: viewData.transactions,
        accounts: viewData.accounts,
        categories: viewData.categories,
        creditCards: viewData.creditCards,
        goals: viewData.goals,
        debts: viewData.debts,
        investments: viewData.investments,
        subscriptions: viewData.subscriptions,
        exportedAt: new Date().toISOString(),
      };
      ExportService.exportFullBackup(backupData);
      this.showToast('Backup JSON baixado com sucesso!');
    });

    document.getElementById('btnWipeAllUserData')?.addEventListener('click', async () => {
      if (confirm('ATENÇÃO: Deseja apagar PERMANENTEMENTE todos os seus registros financeiros?')) {
        await db.wipeUserData(userId);
        this.showToast('Todos os registros foram apagados com sucesso.');
        await this.renderApp();
      }
    });

    // Onboarding Form
    document.getElementById('btnSaveOnboarding')?.addEventListener('click', async () => {
      const income = parseFloat(document.getElementById('onbIncome')?.value || '0');
      const accName = document.getElementById('onbAccountName')?.value;
      const accBal = parseFloat(document.getElementById('onbAccountBalance')?.value || '0');
      const cardName = document.getElementById('onbCardName')?.value;
      const cardLimit = parseFloat(document.getElementById('onbCardLimit')?.value || '0');

      if (accName) {
        await db.put('accounts', {
          userId,
          name: accName,
          type: 'checking',
          initialBalance: accBal,
          currentBalance: accBal,
          color: '#3B82F6',
        });
      }

      if (cardName && cardLimit > 0) {
        await db.put('credit_cards', {
          userId,
          name: cardName,
          creditLimit: cardLimit,
          closingDay: 25,
          dueDay: 5,
          color: '#8B5CF6',
        });
      }

      await auth.updateProfile({ monthlyIncome: income, onboardingCompleted: true });
      this.showToast('Configurações salvas! Bem-vindo ao Meu Financeiro IA.');
      document.getElementById('onboardingModal')?.classList.add('hidden');
      await this.renderApp();
    });

    document.getElementById('btnSkipOnboarding')?.addEventListener('click', async () => {
      await auth.updateProfile({ onboardingCompleted: true });
      document.getElementById('onboardingModal')?.classList.add('hidden');
    });

    // ==========================================
    // CHAT FLUTUANTE E FULLSCREEN COM IA
    // ==========================================
    const floatingChatPanel = document.getElementById('floatingChatPanel');
    document.getElementById('btnToggleFloatingChat')?.addEventListener('click', () => {
      floatingChatPanel?.classList.toggle('hidden');
    });
    document.getElementById('btnCloseFloatingChat')?.addEventListener('click', () => {
      floatingChatPanel?.classList.add('hidden');
    });

    // Chat Flutuante Form
    const handleChatSubmit = async (queryText, containerId) => {
      if (!queryText.trim()) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      // Mensagem do Usuário
      const userMsg = document.createElement('div');
      userMsg.className = 'flex items-start justify-end gap-2.5';
      userMsg.innerHTML = `
        <div class="p-3 bg-emerald-600 text-white rounded-2xl rounded-tr-none text-xs max-w-[85%]">
          ${queryText}
        </div>
      `;
      container.appendChild(userMsg);
      container.scrollTop = container.scrollHeight;

      // Mensagem de "Pensando..."
      const botMsg = document.createElement('div');
      botMsg.className = 'flex items-start gap-2.5';
      botMsg.innerHTML = `
        <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i data-lucide="bot" class="w-4 h-4"></i>
        </div>
        <div class="p-3 bg-slate-800/80 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-300 text-xs leading-relaxed max-w-[85%]">
          <span class="animate-pulse">Consultando dados cadastrados...</span>
        </div>
      `;
      container.appendChild(botMsg);
      container.scrollTop = container.scrollHeight;
      this.refreshIcons();

      // Consulta IA
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

      botMsg.querySelector('div:last-child').innerHTML = reply.replace(/\n/g, '<br>');
      container.scrollTop = container.scrollHeight;
      this.refreshIcons();
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

    document.getElementById('fullChatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('fullChatInput');
      const text = input.value;
      input.value = '';
      handleChatSubmit(text, 'fullChatMessages');
    });

    // Simulador "Posso Comprar?"
    document.getElementById('canIBuyForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('simAmount').value || '0');
      const paymentMethod = document.getElementById('simPaymentMethod').value;
      const installments = parseInt(document.getElementById('simInstallments').value, 10);

      const sim = FinanceEngine.simulateCanIBuy({
        amount,
        installments,
        paymentMethod,
        currentBalance: viewData.metrics.currentBalance,
        monthlyIncome: viewData.metrics.currentIncome,
        monthlyExpenses: viewData.metrics.currentExpense,
        futureInstallmentsCommitment: 380,
      });

      document.getElementById('simRiskBadge').textContent = sim.impactTitle;
      document.getElementById('simRiskBadge').className = `px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
        sim.impactLevel === 'high' ? 'bg-red-500/20 text-red-400' : (sim.impactLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
      }`;
      document.getElementById('simInstallmentValue').textContent = `${FORMATTERS.formatCurrency(sim.installmentValue)}/mês`;
      document.getElementById('simCommittedPercent').textContent = `${sim.newCommittedPercent.toFixed(1)}%`;
      document.getElementById('simRemainingMargin').textContent = FORMATTERS.formatCurrency(sim.remainingMargin);

      const reasonsHtml = sim.reasons.map(r => `
        <div class="flex items-start gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"></i>
          <span>${r}</span>
        </div>
      `).join('');
      document.getElementById('simReasonsList').innerHTML = reasonsHtml;
      this.refreshIcons();
    });

    // Salvar Chave Gemini
    document.getElementById('btnSaveGeminiKey')?.addEventListener('click', () => {
      const key = document.getElementById('geminiApiKeyInput').value;
      localStorage.setItem('meu_financeiro_gemini_key', key.trim());
      this.showToast('Chave Gemini salva com sucesso!');
    });
  }

  refreshIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
}

// Inicializa a aplicação
const app = new App();
window.addEventListener('DOMContentLoaded', () => app.init());
