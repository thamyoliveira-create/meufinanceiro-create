// Motor de Cálculo FIRE (Financial Independence, Retire Early) - Meu Financeiro IA

export const FireEngine = {
  // Calcula o Número FIRE e a Curva de Independência Financeira
  calculateFireProjection({
    currentAge = 30,
    monthlyCostTarget = 5000,
    currentInvested = 15000,
    monthlyContribution = 1200,
    realAnnualReturnRate = 7, // 7% a.a. acima da inflação (padrão histórico de renda variável / bolsa / tesouro)
    safeWithdrawalRate = 4, // Regra dos 4% (Trinity Study)
  }) {
    const annualCost = monthlyCostTarget * 12;
    // Número FIRE = Custo Anual / (Taxa de Retirada / 100) -> Normalmente Custo Anual * 25
    const fireTargetNumber = annualCost / (safeWithdrawalRate / 100);

    const monthlyRate = Math.pow(1 + realAnnualReturnRate / 100, 1 / 12) - 1;
    let balance = currentInvested;
    let months = 0;
    const maxMonths = 12 * 60; // Limite de 60 anos

    const yearlyEvolution = [{
      year: 0,
      age: currentAge,
      balance: Math.round(balance),
      passiveMonthlyIncome: Math.round((balance * (safeWithdrawalRate / 100)) / 12),
      isAchieved: balance >= fireTargetNumber,
    }];

    while (balance < fireTargetNumber && months < maxMonths) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;

      if (months % 12 === 0) {
        const year = months / 12;
        yearlyEvolution.push({
          year,
          age: currentAge + year,
          balance: Math.round(balance),
          passiveMonthlyIncome: Math.round((balance * (safeWithdrawalRate / 100)) / 12),
          isAchieved: balance >= fireTargetNumber,
        });
      }
    }

    const yearsToFire = Number((months / 12).toFixed(1));
    const fireAge = Math.round(currentAge + yearsToFire);
    const progressPercent = Math.min(100, (currentInvested / fireTargetNumber) * 100);

    return {
      fireTargetNumber,
      monthlyCostTarget,
      currentInvested,
      monthlyContribution,
      yearsToFire,
      fireAge,
      progressPercent,
      passiveMonthlyIncome: monthlyCostTarget,
      yearlyEvolution,
    };
  }
};
