// Constantes e Configurações Globais - Meu Financeiro IA

export const APP_CONFIG = {
  name: 'Gastosa',
  version: '1.2.0',
  storagePrefix: 'gastosa_app_',
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

// Classificação para a Regra 50 / 30 / 20
export const RULE_50_30_20_MAP = {
  needs: ['moradia', 'alimentação', 'transporte', 'saúde', 'educação', 'contas'], // 50% Necessidades
  wants: ['lazer', 'assinaturas', 'compras', 'viagem', 'passeios', 'jogos', 'restaurante'], // 30% Estilo de Vida
  savings: ['investimentos', 'reserva', 'dívidas', 'aportes', 'previdência'], // 20% Futuro
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
  { id: 'digital_wallet', label: 'Carteira Digital', icon: 'smartphone', color: '#8B5CF6' },
  { id: 'investment', label: 'Conta de Investimentos', icon: 'trending-up', color: '#F59E0B' },
  { id: 'cash', label: 'Dinheiro em Espécie', icon: 'banknote', color: '#06B6D4' },
  { id: 'other', label: 'Outra Conta', icon: 'wallet', color: '#6B7280' },
];

export const INVESTMENT_TYPES = [
  { id: 'fixed_income', label: 'Renda Fixa (CDB, LCI, LCA, Tesouro Direto)', icon: 'shield-check' },
  { id: 'stocks', label: 'Ações Brasileiras (B3)', icon: 'trending-up' },
  { id: 'reits', label: 'Fundos Imobiliários (FIIs)', icon: 'building' },
  { id: 'international', label: 'Internacional / Stocks / ETFs', icon: 'globe' },
  { id: 'crypto', label: 'Criptomoedas (Bitcoin, Ethereum)', icon: 'coins' },
  { id: 'funds', label: 'Fundos de Investimento', icon: 'pie-chart' },
  { id: 'other', label: 'Outros Ativos', icon: 'layers' },
];

export const FORMATTERS = {
  formatCurrency(value, forcePrivacy = false) {
    if (forcePrivacy || window.__meuFinanceiroPrivacyMode) {
      return 'R$ ••••••';
    }
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
