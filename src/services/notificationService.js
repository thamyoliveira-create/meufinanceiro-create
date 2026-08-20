// Central de Notificações Inteligentes - Meu Financeiro IA

import { FORMATTERS } from '../config/constants.js';

export const NotificationService = {
  // Verifica e gera notificações automáticas
  async checkAndGenerateNotifications(db, userId) {
    const todayStr = FORMATTERS.toIsoDate();
    const today = new Date();

    const bills = await db.getAll('bills', userId);
    const creditCards = await db.getAll('credit_cards', userId);
    const existingNotifs = await db.getAll('notifications', userId);

    const newNotifications = [];

    // 1. Contas a Pagar (Vencendo hoje ou nos próximos 2 dias)
    bills.filter(b => b.status === 'pending' && b.dueDate).forEach(bill => {
      const dueDate = new Date(bill.dueDate + 'T12:00:00');
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const title = 'Conta vence HOJE!';
        const message = `A conta "${bill.description}" (${FORMATTERS.formatCurrency(bill.amount)}) vence hoje.`;
        if (!this._hasRecentNotif(existingNotifs, title, message)) {
          newNotifications.push({ userId, title, message, type: 'bill_due', isRead: false });
        }
      } else if (diffDays === 1) {
        const title = 'Conta vence amanhã';
        const message = `A conta "${bill.description}" (${FORMATTERS.formatCurrency(bill.amount)}) vence amanhã.`;
        if (!this._hasRecentNotif(existingNotifs, title, message)) {
          newNotifications.push({ userId, title, message, type: 'bill_due', isRead: false });
        }
      } else if (diffDays < 0 && bill.status !== 'paid') {
        const title = 'Conta em atraso!';
        const message = `A conta "${bill.description}" (${FORMATTERS.formatCurrency(bill.amount)}) venceu em ${FORMATTERS.formatDate(bill.dueDate)}.`;
        if (!this._hasRecentNotif(existingNotifs, title, message)) {
          newNotifications.push({ userId, title, message, type: 'bill_due', isRead: false });
        }
      }
    });

    // 2. Faturas de Cartão (Fechamento e Vencimento)
    const currentDay = today.getDate();
    creditCards.filter(c => c.isActive !== false).forEach(card => {
      if (card.closingDay && Math.abs(card.closingDay - currentDay) <= 2) {
        const title = `Fatura ${card.name} fechando`;
        const message = `A fatura do seu cartão ${card.name} fecha no dia ${card.closingDay}.`;
        if (!this._hasRecentNotif(existingNotifs, title, message)) {
          newNotifications.push({ userId, title, message, type: 'card_invoice', isRead: false });
        }
      }
    });

    for (const notif of newNotifications) {
      await db.put('notifications', notif);
    }

    return newNotifications;
  },

  _hasRecentNotif(existingNotifs, title, message) {
    return existingNotifs.some(n => n.title === title && n.message === message);
  }
};
