// Serviço de Divisão de Despesas e Contas Compartilhadas (Casais e Famílias) - Meu Financeiro IA

export const SplitExpenseService = {
  // Calcula balanço de acerto de contas compartilhadas
  calculateSharedBalance(transactions = []) {
    const sharedTxs = transactions.filter(t => t.isShared && t.isPaid !== false);
    
    let totalPaidByMe = 0;
    let totalOtherOwesMe = 0;
    const peopleTotals = {};

    sharedTxs.forEach(tx => {
      const amount = Number(tx.amount || 0);
      const otherSharePercent = Number(tx.otherSharePercent || 50); // padrão 50%
      const otherPerson = tx.sharedWith || 'Parceiro(a)';
      const otherAmount = (amount * otherSharePercent) / 100;

      totalPaidByMe += amount;
      totalOtherOwesMe += otherAmount;

      if (!peopleTotals[otherPerson]) {
        peopleTotals[otherPerson] = {
          name: otherPerson,
          totalOwedToMe: 0,
          txCount: 0,
          transactions: [],
        };
      }

      peopleTotals[otherPerson].totalOwedToMe += otherAmount;
      peopleTotals[otherPerson].txCount += 1;
      peopleTotals[otherPerson].transactions.push({
        ...tx,
        otherAmount,
        otherSharePercent,
      });
    });

    return {
      sharedTxs,
      totalPaidByMe,
      totalOtherOwesMe,
      people: Object.values(peopleTotals),
    };
  }
};
