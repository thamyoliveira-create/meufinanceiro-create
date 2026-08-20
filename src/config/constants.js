// Constantes e Configurações Globais - Meu Financeiro IA

export const APP_CONFIG = {
  name: 'Meu Financeiro IA',
  version: '1.0.0',
  storagePrefix: 'meu_financeiro_ia_',
  currency: 'BRL',
  locale: 'pt-BR',
  dateFormat: 'DD/MM/YYYY',
  defaultMonthStartDay: 1,
};

export const TRANSACTION_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  TRANSFER: 'transfer',
};

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'Pix', icon: 'zap' },
  { id: 'credit', label: 'Cartão de Crédito', icon: 'credit-card' },
  { id: 'debit', label: 'Cartão de Débito', icon: 'credit-card' },
  { id: 'money', label: 'Dinheiro', icon: 'banknote' },
  { id: 'boleto', label: 'Boleto Bancário', icon: 'barcode' },
  { id: 'transfer', label: 'Transferência Bancária', icon: 'arrow-right-left' },
  { id: 'other', label: 'Outro', icon: 'circle-dot' },
];

export const ACCOUNT_TYPES = [
  { id: 'checking', label: 'Conta Corrente', icon: 'landmark', color: '#3B82F6' },
  { id: 'savings', label: 'Conta Poupança', icon: 'piggy-bank', color: '#10B981' },
  { id: 'digital_wallet', label: 'Carteira Digital (Nubank/Inter/Mercado Pago)', icon: 'smartphone', color: '#8B5CF6' },
  { id: 'investment', label: 'Conta de Investimentos (XP/BTG/Clear)', icon: 'trending-up', color: '#F59E0B' },
  { id: 'cash', label: 'Dinheiro em Espécie', icon: 'banknote', color: '#06B6D4' },
  { id: 'other', label: 'Outra Conta', icon: 'wallet', color: '#6B7280' },
];

export const RECURRENCE_FREQUENCIES = [
  { id: 'weekly', label: 'Semanal' },
  { id: 'biweekly', label: 'Quinzenal' },
  { id: 'monthly', label: 'Mensal' },
  { id: 'quarterly', label: 'Trimestral' },
  { id: 'yearly', label: 'Anual' },
];

export const GOAL_CATEGORIES = [
  { id: 'emergency', label: 'Reserva de Emergência', icon: 'shield-alert', color: '#10B981' },
  { id: 'travel', label: 'Viagem', icon: 'plane', color: '#3B82F6' },
  { id: 'car', label: 'Carro / Veículo', icon: 'car', color: '#8B5CF6' },
  { id: 'house', label: 'Casa Própria / Reforma', icon: 'home', color: '#F59E0B' },
  { id: 'debt_payoff', label: 'Quitar Dívidas', icon: 'trending-down', color: '#EF4444' },
  { id: 'custom', label: 'Outro Objetivo', icon: 'target', color: '#6366F1' },
];

export const INVESTMENT_TYPES = [
  { id: 'tesouro', label: 'Tesouro Direto' },
  { id: 'cdb', label: 'CDB / LC' },
  { id: 'stocks', label: 'Ações (B3)' },
  { id: 'funds', label: 'Fundos Imobiliários (FIIs) / Multimercado' },
  { id: 'etf', label: 'ETFs' },
  { id: 'crypto', label: 'Criptomoedas (Bitcoin/ETH)' },
  { id: 'savings', label: 'Poupança' },
  { id: 'other', label: 'Outros Investimentos' },
];

export const ASSET_TYPES = [
  { id: 'cash', label: 'Dinheiro / Saldos' },
  { id: 'investments', label: 'Investimentos Financeiros' },
  { id: 'real_estate', label: 'Imóveis' },
  { id: 'vehicles', label: 'Veículos' },
  { id: 'other', label: 'Outros Bens' },
];

export const LIABILITY_TYPES = [
  { id: 'financing', label: 'Financiamento Imobiliário / Veicular' },
  { id: 'loan', label: 'Empréstimo Pessoal' },
  { id: 'card_debt', label: 'Dívida de Cartão' },
  { id: 'other', label: 'Outro Passivo' },
];

export const FORMATTERS = {
  formatCurrency(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(num);
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('pt-BR');
  },

  formatPercent(value, decimals = 1) {
    const num = Number(value) || 0;
    return `${num.toFixed(decimals)}%`;
  },

  toIsoDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getCurrentMonthKey(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  getMonthName(monthNum) {
    const names = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return names[monthNum - 1] || '';
  }
};
