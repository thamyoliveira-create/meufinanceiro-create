// Gerador de Dados de Demonstração Realistas em BRL - Meu Financeiro IA

import { FORMATTERS } from '../config/constants.js';

export async function loadDemoDataset(db, userId) {
  // Inicializa categorias
  const categories = await db.initDefaultCategories(userId);

  const getCatId = (namePart) => {
    const found = categories.find(c => c.name.toLowerCase().includes(namePart.toLowerCase()));
    return found ? found.id : null;
  };

  const catMoradia = getCatId('moradia');
  const catAlim = getCatId('alimentação');
  const catTransp = getCatId('transporte');
  const catSaude = getCatId('saúde');
  const catLazer = getCatId('lazer');
  const catAssin = getCatId('assinaturas');
  const catEdu = getCatId('educação');
  const catCompras = getCatId('compras');
  const catSalario = getCatId('salário');
  const catExtra = getCatId('renda extra');
  const catInvest = getCatId('investimentos');

  // 1. CONTAS
  const accNubank = {
    id: `acc_nu_${userId}`,
    userId,
    name: 'Nubank Conta Principal',
    institution: 'Nubank',
    type: 'digital_wallet',
    initialBalance: 3200.00,
    currentBalance: 3850.40,
    color: '#8B5CF6',
    icon: 'smartphone',
    isDemo: true,
  };

  const accItau = {
    id: `acc_itau_${userId}`,
    userId,
    name: 'Itaú Corrente',
    institution: 'Itaú Unibanco',
    type: 'checking',
    initialBalance: 1500.00,
    currentBalance: 1620.00,
    color: '#F59E0B',
    icon: 'landmark',
    isDemo: true,
  };

  const accDinheiro = {
    id: `acc_cash_${userId}`,
    userId,
    name: 'Dinheiro na Carteira',
    institution: 'Espécie',
    type: 'cash',
    initialBalance: 200.00,
    currentBalance: 280.00,
    color: '#10B981',
    icon: 'banknote',
    isDemo: true,
  };

  const accXP = {
    id: `acc_xp_${userId}`,
    userId,
    name: 'XP Investimentos',
    institution: 'XP Investimentos',
    type: 'investment',
    initialBalance: 10000.00,
    currentBalance: 14500.00,
    color: '#3B82F6',
    icon: 'trending-up',
    isDemo: true,
  };

  await db.put('accounts', accNubank);
  await db.put('accounts', accItau);
  await db.put('accounts', accDinheiro);
  await db.put('accounts', accXP);

  // 2. CARTÕES DE CRÉDITO
  const cardNubank = {
    id: `card_nu_${userId}`,
    userId,
    name: 'Nubank Ultravioleta',
    institution: 'Nubank',
    creditLimit: 10000.00,
    closingDay: 25,
    dueDay: 5,
    color: '#8B5CF6',
    brand: 'Mastercard Black',
    isDemo: true,
  };

  const cardItau = {
    id: `card_itau_${userId}`,
    userId,
    name: 'Itaú Click Visa',
    institution: 'Itaú',
    creditLimit: 5000.00,
    closingDay: 15,
    dueDay: 25,
    color: '#F59E0B',
    brand: 'Visa Platinum',
    isDemo: true,
  };

  await db.put('credit_cards', cardNubank);
  await db.put('credit_cards', cardItau);

  // 3. TRANSAÇÕES REALISTAS (Mês Atual e Anteriores)
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  const dateStr = (offsetDays, monthOffset = 0) => {
    const d = new Date(y, m + monthOffset, offsetDays);
    return FORMATTERS.toIsoDate(d);
  };

  const demoTransactions = [
    // Salários
    {
      userId,
      accountId: accNubank.id,
      categoryId: catSalario,
      type: 'income',
      amount: 6200.00,
      date: dateStr(5, 0),
      description: 'Salário Mensal - Tech Corp',
      establishment: 'Tech Corp Brasil',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catExtra,
      type: 'income',
      amount: 1400.00,
      date: dateStr(18, 0),
      description: 'Projeto Freelance Website',
      establishment: 'Studio Digital',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    // Moradia e Fixas
    {
      userId,
      accountId: accNubank.id,
      categoryId: catMoradia,
      type: 'expense',
      amount: 1650.00,
      date: dateStr(10, 0),
      description: 'Aluguel do Apartamento',
      establishment: 'Imobiliária Central',
      paymentMethod: 'boleto',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catMoradia,
      type: 'expense',
      amount: 420.00,
      date: dateStr(12, 0),
      description: 'Condomínio Mensal',
      establishment: 'Condomínio Residencial Park',
      paymentMethod: 'boleto',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catMoradia,
      type: 'expense',
      amount: 185.40,
      date: dateStr(14, 0),
      description: 'Energia Elétrica - Enel',
      establishment: 'Enel Distribuição',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    // Alimentação e Mercado
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catAlim,
      type: 'expense',
      amount: 480.90,
      date: dateStr(3, 0),
      description: 'Compras do Mês no Supermercado',
      establishment: 'Pão de Açúcar',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catAlim,
      type: 'expense',
      amount: 195.30,
      date: dateStr(11, 0),
      description: 'Hortifruti & Feira da Semana',
      establishment: 'Natural da Terra',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catAlim,
      type: 'expense',
      amount: 86.50,
      date: dateStr(15, 0),
      description: 'Jantar Restaurante Italiano',
      establishment: 'Trattoria Bella',
      paymentMethod: 'debit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catAlim,
      type: 'expense',
      amount: 64.90,
      date: dateStr(17, 0),
      description: 'Delivery iFood Burger',
      establishment: 'Hamburgueria Artesanal',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    // Transporte
    {
      userId,
      accountId: accNubank.id,
      categoryId: catTransp,
      type: 'expense',
      amount: 220.00,
      date: dateStr(4, 0),
      description: 'Abastecimento Gasolina Comum',
      establishment: 'Posto Shell',
      paymentMethod: 'debit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catTransp,
      type: 'expense',
      amount: 42.80,
      date: dateStr(8, 0),
      description: 'Uber ida e volta reunião',
      establishment: 'Uber',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    // Saúde
    {
      userId,
      accountId: accNubank.id,
      categoryId: catSaude,
      type: 'expense',
      amount: 142.60,
      date: dateStr(7, 0),
      description: 'Farmácia - Vitaminas e Remédios',
      establishment: 'Droga Raia',
      paymentMethod: 'debit',
      isPaid: true,
      isDemo: true,
    },
    // Lazer
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catLazer,
      type: 'expense',
      amount: 120.00,
      date: dateStr(13, 0),
      description: 'Ingressos de Cinema IMAX e Pipoca',
      establishment: 'Cinemark Shopping',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    // Assinaturas
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catAssin,
      type: 'expense',
      amount: 55.90,
      date: dateStr(2, 0),
      description: 'Netflix 4K Plano Familiar',
      establishment: 'Netflix',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catAssin,
      type: 'expense',
      amount: 21.90,
      date: dateStr(2, 0),
      description: 'Spotify Premium Individual',
      establishment: 'Spotify',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catAssin,
      type: 'expense',
      amount: 119.90,
      date: dateStr(1, 0),
      description: 'Mensalidade Academia SmartFit',
      establishment: 'SmartFit',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    // Compras Parceladas (Notebook 4/10)
    {
      userId,
      accountId: accNubank.id,
      creditCardId: cardNubank.id,
      categoryId: catCompras,
      type: 'expense',
      amount: 380.00,
      date: dateStr(6, 0),
      description: 'Notebook Dell Inspiron (4/10)',
      establishment: 'Dell Computadores',
      paymentMethod: 'credit',
      isPaid: true,
      isInstallment: true,
      installmentNumber: 4,
      totalInstallments: 10,
      isDemo: true,
    },
    // Aporte Investimento
    {
      userId,
      accountId: accXP.id,
      categoryId: catInvest,
      type: 'expense',
      amount: 800.00,
      date: dateStr(9, 0),
      description: 'Aporte Mensal Tesouro Selic 2029',
      establishment: 'Tesouro Direto',
      paymentMethod: 'transfer',
      isPaid: true,
      isDemo: true,
    },
    // Mês Anterior (Para comparações de gráficos e IA)
    {
      userId,
      accountId: accNubank.id,
      categoryId: catSalario,
      type: 'income',
      amount: 6200.00,
      date: dateStr(5, -1),
      description: 'Salário Mensal - Tech Corp',
      establishment: 'Tech Corp Brasil',
      paymentMethod: 'pix',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catMoradia,
      type: 'expense',
      amount: 1650.00,
      date: dateStr(10, -1),
      description: 'Aluguel do Apartamento',
      establishment: 'Imobiliária Central',
      paymentMethod: 'boleto',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catAlim,
      type: 'expense',
      amount: 820.00,
      date: dateStr(14, -1),
      description: 'Supermercado e Feira Total',
      establishment: 'Carrefour',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catTransp,
      type: 'expense',
      amount: 340.00,
      date: dateStr(16, -1),
      description: 'Combustível e Uber Mês Anterior',
      establishment: 'Posto Shell',
      paymentMethod: 'debit',
      isPaid: true,
      isDemo: true,
    },
    {
      userId,
      accountId: accNubank.id,
      categoryId: catLazer,
      type: 'expense',
      amount: 450.00,
      date: dateStr(20, -1),
      description: 'Fim de semana e Restaurantes',
      establishment: 'Bares & Restaurantes',
      paymentMethod: 'credit',
      isPaid: true,
      isDemo: true,
    },
  ];

  for (const tx of demoTransactions) {
    await db.put('transactions', tx);
  }

  // 4. CONTAS A PAGAR E A RECEBER
  const demoBills = [
    {
      userId,
      categoryId: catMoradia,
      accountId: accNubank.id,
      description: 'Internet Fibra 600MB',
      amount: 129.90,
      dueDate: dateStr(22, 0),
      status: 'pending',
      notes: 'Vencimento em poucos dias',
      isDemo: true,
    },
    {
      userId,
      categoryId: catMoradia,
      accountId: accNubank.id,
      description: 'Conta de Água e Saneamento - Sabesp',
      amount: 78.40,
      dueDate: dateStr(25, 0),
      status: 'pending',
      isDemo: true,
    },
    {
      userId,
      categoryId: catSaude,
      accountId: accNubank.id,
      description: 'Plano de Saúde Unimed',
      amount: 380.00,
      dueDate: dateStr(28, 0),
      status: 'pending',
      isDemo: true,
    },
  ];

  for (const bill of demoBills) {
    await db.put('bills', bill);
  }

  const demoReceivables = [
    {
      userId,
      categoryId: catExtra,
      accountId: accNubank.id,
      description: 'Reembolso Deslocamento Trabalho',
      amount: 240.00,
      expectedDate: dateStr(26, 0),
      status: 'pending',
      isDemo: true,
    }
  ];

  for (const rec of demoReceivables) {
    await db.put('income_receivables', rec);
  }

  // 5. ORÇAMENTOS
  const demoBudget = {
    id: `budget_${userId}_${y}_${m + 1}`,
    userId,
    month: m + 1,
    year: y,
    totalBudgetLimit: 4500.00,
    isDemo: true,
  };
  await db.put('budgets', demoBudget);

  // 6. METAS FINANCEIRAS
  const demoGoals = [
    {
      userId,
      name: 'Reserva de Emergência (6 Meses)',
      targetAmount: 18000.00,
      currentAmount: 11400.00,
      deadline: `${y}-12-31`,
      icon: 'shield-check',
      color: '#10B981',
      category: 'emergency',
      isCompleted: false,
      notes: 'Alocada 100% no Tesouro Selic com liquidez diária',
      isDemo: true,
    },
    {
      userId,
      name: 'Viagem de Férias para Europa',
      targetAmount: 12000.00,
      currentAmount: 4500.00,
      deadline: `${y + 1}-06-30`,
      icon: 'plane',
      color: '#3B82F6',
      category: 'travel',
      isCompleted: false,
      notes: 'Passagens e hospedagem em Lisboa e Madri',
      isDemo: true,
    },
    {
      userId,
      name: 'Troca de Computador Trabalho',
      targetAmount: 6000.00,
      currentAmount: 3200.00,
      deadline: `${y}-11-30`,
      icon: 'laptop',
      color: '#8B5CF6',
      category: 'custom',
      isCompleted: false,
      isDemo: true,
    },
  ];

  for (const goal of demoGoals) {
    await db.put('goals', goal);
  }

  // 7. DÍVIDAS E FINANCIAMENTOS
  const demoDebts = [
    {
      userId,
      name: 'Financiamento Veículo Tracker',
      institution: 'Banco Santander',
      originalAmount: 32000.00,
      currentBalance: 14200.00,
      interestRateMonthly: 1.35,
      monthlyPayment: 740.00,
      remainingInstallments: 21,
      dueDay: 15,
      isCleared: false,
      notes: 'Taxa pré-fixada. Prioridade moderada de amortização.',
      isDemo: true,
    },
    {
      userId,
      name: 'Empréstimo Pessoal Consignado',
      institution: 'Banco do Brasil',
      originalAmount: 8000.00,
      currentBalance: 2400.00,
      interestRateMonthly: 1.85,
      monthlyPayment: 480.00,
      remainingInstallments: 5,
      dueDay: 10,
      isCleared: false,
      notes: 'Quitação prevista para os próximos 5 meses.',
      isDemo: true,
    },
  ];

  for (const debt of demoDebts) {
    await db.put('debts', debt);
  }

  // 8. INVESTIMENTOS
  const demoInvestments = [
    {
      userId,
      name: 'Tesouro Selic 2029',
      institution: 'XP Investimentos',
      type: 'tesouro',
      quantity: 0.65,
      investedAmount: 8000.00,
      currentValue: 8650.00,
      investmentDate: `${y - 1}-08-15`,
      notes: 'Reserva de liquidez',
      isDemo: true,
    },
    {
      userId,
      name: 'CDB 110% CDI Liquidez Diária',
      institution: 'Banco Sofisa',
      type: 'cdb',
      quantity: 1,
      investedAmount: 4000.00,
      currentValue: 4320.00,
      investmentDate: `${y - 1}-10-01`,
      isDemo: true,
    },
    {
      userId,
      name: 'FII HGLG11 - Logística',
      institution: 'XP Investimentos',
      type: 'funds',
      quantity: 10,
      investedAmount: 1550.00,
      currentValue: 1680.00,
      investmentDate: `${y}-01-10`,
      notes: 'Rendimentos mensais isentos',
      isDemo: true,
    },
  ];

  for (const inv of demoInvestments) {
    await db.put('investments', inv);
  }

  // 9. ATIVOS E PASSIVOS (PATRIMÔNIO)
  const demoAssets = [
    { userId, name: 'Saldos em Bancos & Carteiras', type: 'cash', value: 5750.40, isDemo: true },
    { userId, name: 'Carteira de Investimentos', type: 'investments', value: 14650.00, isDemo: true },
    { userId, name: 'Veículo Chevrolet Tracker Turbo', type: 'vehicles', value: 78000.00, isDemo: true },
    { userId, name: 'Apartamento Residencial', type: 'real_estate', value: 340000.00, isDemo: true },
  ];

  const demoLiabilities = [
    { userId, name: 'Saldo Devedor Financiamento Veículo', type: 'financing', value: 14200.00, isDemo: true },
    { userId, name: 'Saldo Devedor Empréstimo Consignado', type: 'loan', value: 2400.00, isDemo: true },
    { userId, name: 'Saldo Devedor Financiamento Habitacional', type: 'financing', value: 185000.00, isDemo: true },
  ];

  for (const asset of demoAssets) await db.put('assets', asset);
  for (const liab of demoLiabilities) await db.put('liabilities', liab);

  // 10. ASSINATURAS RECORRENTES
  const demoSubscriptions = [
    { userId, name: 'Netflix Plano Familiar', serviceProvider: 'Netflix', amount: 55.90, billingCycle: 'monthly', dueDay: 2, isDemo: true },
    { userId, name: 'Spotify Individual', serviceProvider: 'Spotify', amount: 21.90, billingCycle: 'monthly', dueDay: 2, isDemo: true },
    { userId, name: 'Academia SmartFit Black', serviceProvider: 'SmartFit', amount: 119.90, billingCycle: 'monthly', dueDay: 1, isDemo: true },
    { userId, name: 'Amazon Prime Video', serviceProvider: 'Amazon', amount: 19.90, billingCycle: 'monthly', dueDay: 14, isDemo: true },
    { userId, name: 'Google One 2TB', serviceProvider: 'Google', amount: 38.90, billingCycle: 'monthly', dueDay: 20, isDemo: true },
    { userId, name: 'ChatGPT Plus IA', serviceProvider: 'OpenAI', amount: 110.00, billingCycle: 'monthly', dueDay: 18, isDemo: true },
  ];

  for (const sub of demoSubscriptions) {
    await db.put('subscriptions', sub);
  }

  // 11. NOTIFICAÇÕES INICIAIS
  const demoNotifications = [
    {
      userId,
      title: 'Conta prestes a vencer',
      message: 'A sua conta de Internet Fibra (R$ 129,90) vence em 2 dias.',
      type: 'bill_due',
      isRead: false,
      isDemo: true,
    },
    {
      userId,
      title: 'Atingiu 63% da sua Reserva de Emergência!',
      message: 'Parabéns! Você já acumulou R$ 11.400,00 da sua meta de R$ 18.000,00.',
      type: 'goal_milestone',
      isRead: false,
      isDemo: true,
    },
  ];

  for (const notif of demoNotifications) {
    await db.put('notifications', notif);
  }

  return { success: true, count: demoTransactions.length };
}
