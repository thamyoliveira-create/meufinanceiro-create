// Motor de Cálculos Financeiros Determinísticos - Meu Financeiro IA
// Todos os cálculos matemáticos críticos são processados via código confiável

export const FinanceEngine = {
  // Retorna métricas consolidadas para o Dashboard
  async calculateDashboardMetrics(db, userId, targetDate = new Date()) {
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth(); // 0-indexed

    const accounts = await db.getAll('accounts', userId);
    const transactions = await db.getAll('transactions', userId);
    const creditCards = await db.getAll('credit_cards', userId);
    const debts = await db.getAll('debts', userId);
    const investments = await db.getAll('investments', userId);
    const bills = await db.getAll('bills', userId);
    const receivables = await db.getAll('income_receivables', userId);

    // 1. Saldo Consolidado Atual das Contas Ativas
    const currentBalance = accounts
      .filter(a => a.isActive !== false)
      .reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);

    // 2. Transações do Mês Atual vs Mês Anterior
    const currentMonthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    const prevDate = new Date(y, m - 1, 1);
    const prevMonthPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix));
    const prevMonthTxs = transactions.filter(t => t.date && t.date.startsWith(prevMonthPrefix));

    // Totais Mês Atual (Apenas transações pagas/efetivadas que não sejam transferências internas)
    const currentIncome = currentMonthTxs
      .filter(t => t.type === 'income' && t.isPaid !== false)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const currentExpense = currentMonthTxs
      .filter(t => t.type === 'expense' && t.isPaid !== false)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const currentSavings = currentIncome - currentExpense;
    const savingsRate = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : 0;
    const committedIncomePercent = currentIncome > 0 ? (currentExpense / currentIncome) * 100 : 0;

    // Totais Mês Anterior
    const prevIncome = prevMonthTxs
      .filter(t => t.type === 'income' && t.isPaid !== false)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const prevExpense = prevMonthTxs
      .filter(t => t.type === 'expense' && t.isPaid !== false)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Variações Comparativas (%)
    const expenseDiff = currentExpense - prevExpense;
    const expenseVarPercent = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;

    const incomeDiff = currentIncome - prevIncome;
    const incomeVarPercent = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;

    // 3. Total Investido
    const totalInvestedFromInv = investments.reduce((sum, inv) => sum + Number(inv.currentValue || inv.investedAmount || 0), 0);
    const investmentAccountsBalance = accounts
      .filter(a => a.type === 'investment' && a.isActive !== false)
      .reduce((sum, a) => sum + Number(a.currentBalance || 0), 0);
    const totalInvested = Math.max(totalInvestedFromInv, investmentAccountsBalance) || totalInvestedFromInv + investmentAccountsBalance;

    // 4. Total de Dívidas Ativas
    const totalDebts = debts
      .filter(d => !d.isCleared)
      .reduce((sum, d) => sum + Number(d.currentBalance || 0), 0);

    // 5. Projeção de Valor Disponível até o Fim do Mês
    const pendingBills = bills
      .filter(b => b.status === 'pending' && b.dueDate && b.dueDate.startsWith(currentMonthPrefix))
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    const pendingReceivables = receivables
      .filter(r => r.status === 'pending' && r.expectedDate && r.expectedDate.startsWith(currentMonthPrefix))
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const projectedEndBalance = currentBalance + pendingReceivables - pendingBills;

    return {
      currentBalance,
      currentIncome,
      currentExpense,
      currentSavings,
      savingsRate,
      committedIncomePercent,
      prevIncome,
      prevExpense,
      expenseDiff,
      expenseVarPercent,
      incomeDiff,
      incomeVarPercent,
      totalInvested,
      totalDebts,
      pendingBills,
      pendingReceivables,
      projectedEndBalance,
      monthKey: currentMonthPrefix,
    };
  },

  // Distribuição de gastos por categoria no mês
  calculateCategoryBreakdown(transactions, categories, type = 'expense') {
    const categoryMap = new Map();
    categories.forEach(c => categoryMap.set(c.id, c));

    const totals = {};
    let grandTotal = 0;

    transactions
      .filter(t => t.type === type && t.isPaid !== false)
      .forEach(t => {
        const cat = categoryMap.get(t.categoryId) || { name: 'Outros', color: '#9CA3AF', icon: 'more-horizontal' };
        const val = Number(t.amount || 0);
        if (!totals[cat.name]) {
          totals[cat.name] = {
            id: cat.id || 'other',
            name: cat.name,
            color: cat.color || '#6B7280',
            icon: cat.icon || 'tag',
            amount: 0,
            count: 0,
          };
        }
        totals[cat.name].amount += val;
        totals[cat.name].count += 1;
        grandTotal += val;
      });

    const list = Object.values(totals).map(item => ({
      ...item,
      percentage: grandTotal > 0 ? (item.amount / grandTotal) * 100 : 0,
    }));

    list.sort((a, b) => b.amount - a.amount);
    return { list, grandTotal };
  },

  // Fluxo Mensal Histórico (Receitas vs Despesas vs Saldo) para N meses
  calculateMonthlyCashflow(transactions, monthsBack = 6) {
    const result = [];
    const now = new Date();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' }) + '/' + String(y).slice(2);

      const monthTxs = transactions.filter(t => t.date && t.date.startsWith(key) && t.isPaid !== false);
      const income = monthTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = monthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const balance = income - expense;

      result.push({
        key,
        label: monthLabel.toUpperCase(),
        income,
        expense,
        balance,
      });
    }

    return result;
  },

  // Gastos diários ao longo do mês para detectar picos
  calculateDailyExpenses(transactions, monthKey) {
    const daysInMonth = 31;
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: `${monthKey}-${String(i + 1).padStart(2, '0')}`,
      amount: 0,
      count: 0,
    }));

    transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(monthKey) && t.isPaid !== false)
      .forEach(t => {
        const dayNum = parseInt(t.date.split('-')[2], 10);
        if (dayNum >= 1 && dayNum <= daysInMonth) {
          daily[dayNum - 1].amount += Number(t.amount || 0);
          daily[dayNum - 1].count += 1;
        }
      });

    return daily;
  },

  // Calculadora de Reserva de Emergência
  calculateEmergencyFund(averageMonthlyCost, currentSaved = 0) {
    const cost = Number(averageMonthlyCost) || 0;
    const saved = Number(currentSaved) || 0;

    const scenarios = [
      { months: 3, label: '3 Meses (Perfil Concursado / Renda Muito Estável)', target: cost * 3 },
      { months: 6, label: '6 Meses (Recomendado Padrão / CLT)', target: cost * 6 },
      { months: 12, label: '12 Meses (Autônomos, PJs, Empreendedores)', target: cost * 12 },
    ].map(s => {
      const remaining = Math.max(0, s.target - saved);
      const progress = s.target > 0 ? Math.min(100, (saved / s.target) * 100) : 0;
      return {
        ...s,
        saved,
        remaining,
        progress,
      };
    });

    return { averageMonthlyCost: cost, currentSaved: saved, scenarios };
  },

  // Pontuação de Saúde Financeira Transparente (0 a 100)
  calculateFinancialHealthScore(metrics, emergencyFundRatio = 0, hasOverdueBills = false) {
    let score = 0;
    const factors = [];

    // 1. Relação Despesa / Renda (Até 30 pts)
    const committed = metrics.committedIncomePercent || 0;
    if (metrics.currentIncome > 0) {
      if (committed <= 60) {
        score += 30;
        factors.push({ name: 'Gastos dentro do ideal (<=60% da renda)', points: 30, max: 30, status: 'good' });
      } else if (committed <= 80) {
        score += 20;
        factors.push({ name: 'Gastos moderados (60% a 80% da renda)', points: 20, max: 30, status: 'warning' });
      } else {
        score += 5;
        factors.push({ name: 'Renda altamente comprometida (>80%)', points: 5, max: 30, status: 'danger' });
      }
    } else {
      factors.push({ name: 'Renda mensal não informada', points: 15, max: 30, status: 'neutral' });
      score += 15;
    }

    // 2. Taxa de Economia / Aporte (Até 25 pts)
    const savingsRate = metrics.savingsRate || 0;
    if (savingsRate >= 25) {
      score += 25;
      factors.push({ name: 'Excelente taxa de poupança/investimento (>=25%)', points: 25, max: 25, status: 'good' });
    } else if (savingsRate >= 10) {
      score += 18;
      factors.push({ name: 'Boa taxa de poupança (10% a 25%)', points: 18, max: 25, status: 'good' });
    } else if (savingsRate > 0) {
      score += 10;
      factors.push({ name: 'Economia baixa (<10%)', points: 10, max: 25, status: 'warning' });
    } else {
      score += 0;
      factors.push({ name: 'Gastando mais do que ganha no mês', points: 0, max: 25, status: 'danger' });
    }

    // 3. Reserva de Emergência (Até 25 pts)
    if (emergencyFundRatio >= 1.0) {
      score += 25;
      factors.push({ name: 'Reserva de emergência completa (>= 6 meses)', points: 25, max: 25, status: 'good' });
    } else if (emergencyFundRatio >= 0.5) {
      score += 15;
      factors.push({ name: 'Reserva em construção (>= 3 meses)', points: 15, max: 25, status: 'warning' });
    } else if (emergencyFundRatio > 0) {
      score += 8;
      factors.push({ name: 'Reserva inicial iniciada (< 3 meses)', points: 8, max: 25, status: 'warning' });
    } else {
      score += 0;
      factors.push({ name: 'Sem reserva de emergência declarada', points: 0, max: 25, status: 'danger' });
    }

    // 4. Dívidas e Atrasos (Até 20 pts)
    if (hasOverdueBills) {
      score += 0;
      factors.push({ name: 'Possui contas em atraso pendentes', points: 0, max: 20, status: 'danger' });
    } else if (metrics.totalDebts === 0) {
      score += 20;
      factors.push({ name: 'Livre de dívidas onerosas', points: 20, max: 20, status: 'good' });
    } else if (metrics.totalDebts < (metrics.currentIncome * 3)) {
      score += 12;
      factors.push({ name: 'Dívidas sob controle relativo', points: 12, max: 20, status: 'warning' });
    } else {
      score += 4;
      factors.push({ name: 'Endividamento elevado em relação à renda', points: 4, max: 20, status: 'danger' });
    }

    let classification = 'Regular';
    let color = '#F59E0B';
    if (score >= 80) {
      classification = 'Excelente';
      color = '#10B981';
    } else if (score >= 60) {
      classification = 'Boa';
      color = '#3B82F6';
    } else if (score < 40) {
      classification = 'Crítica / Atenção';
      color = '#EF4444';
    }

    return { score, classification, color, factors };
  },

  // Simulador "Posso Comprar?"
  simulateCanIBuy({
    amount,
    installments = 1,
    paymentMethod = 'credit',
    currentBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    futureInstallmentsCommitment = 0,
  }) {
    const purchaseAmount = Number(amount) || 0;
    const numInstallments = Math.max(1, parseInt(installments, 10));
    const installmentValue = Number((purchaseAmount / numInstallments).toFixed(2));

    const currentMargin = monthlyIncome - monthlyExpenses;
    const newMonthlyCommitment = futureInstallmentsCommitment + installmentValue;
    const remainingMargin = currentMargin - installmentValue;
    const newCommittedPercent = monthlyIncome > 0 ? ((monthlyExpenses + installmentValue) / monthlyIncome) * 100 : 100;

    let impactLevel = 'low';
    let impactTitle = 'Baixo Impacto';
    let impactColor = '#10B981';
    const reasons = [];

    if (purchaseAmount > currentBalance && paymentMethod !== 'credit') {
      impactLevel = 'high';
      impactTitle = 'Alto Impacto (Saldo Insuficiente)';
      impactColor = '#EF4444';
      reasons.push(`O valor à vista (R$ ${purchaseAmount.toFixed(2)}) ultrapassa seu saldo atual em conta (R$ ${currentBalance.toFixed(2)}).`);
    } else if (remainingMargin < 0) {
      impactLevel = 'high';
      impactTitle = 'Alto Impacto (Orçamento Negativo)';
      impactColor = '#EF4444';
      reasons.push(`A parcela de R$ ${installmentValue.toFixed(2)} fará suas despesas mensais superarem sua renda em R$ ${Math.abs(remainingMargin).toFixed(2)}.`);
    } else if (newCommittedPercent > 85) {
      impactLevel = 'moderate';
      impactTitle = 'Impacto Moderado (Renda Perto do Limite)';
      impactColor = '#F59E0B';
      reasons.push(`Sua renda mensal ficará ${newCommittedPercent.toFixed(1)}% comprometida com despesas.`);
    } else {
      reasons.push(`A parcela de R$ ${installmentValue.toFixed(2)} cabe na sua margem mensal de economia de R$ ${currentMargin.toFixed(2)}.`);
      reasons.push(`Após a compra, você ainda terá uma sobra estimada de R$ ${remainingMargin.toFixed(2)} por mês.`);
    }

    return {
      purchaseAmount,
      numInstallments,
      installmentValue,
      remainingMargin,
      newCommittedPercent,
      impactLevel,
      impactTitle,
      impactColor,
      reasons,
    };
  }
};
