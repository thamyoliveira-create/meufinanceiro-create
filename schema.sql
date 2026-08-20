-- ==============================================================================
-- MEU FINANCEIRO IA - SCHEMA DE BANCO DE DADOS POSTGRESQL / SUPABASE
-- Sistema completo de gestão financeira pessoal com Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency VARCHAR(10) DEFAULT 'BRL',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    month_start_day INT DEFAULT 1,
    theme VARCHAR(20) DEFAULT 'system',
    monthly_income NUMERIC(15, 2) DEFAULT 0.00,
    emergency_fund_target_months INT DEFAULT 6,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CONTAS BANCÁRIAS E CARTEIRAS
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    institution VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'cash', 'digital_wallet', 'investment', 'other'
    initial_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'wallet',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CATEGORIAS E SUBCATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'expense', 'income'
    icon VARCHAR(50) DEFAULT 'tag',
    color VARCHAR(20) DEFAULT '#6B7280',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CARTÕES DE CRÉDITO
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    institution VARCHAR(100),
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    closing_day INT NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INT NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    color VARCHAR(20) DEFAULT '#8B5CF6',
    brand VARCHAR(50) DEFAULT 'Mastercard',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TRANSAÇÕES
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    establishment VARCHAR(100),
    payment_method VARCHAR(50), -- 'money', 'pix', 'debit', 'credit', 'boleto', 'transfer'
    is_paid BOOLEAN DEFAULT TRUE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_transaction_id UUID,
    is_installment BOOLEAN DEFAULT FALSE,
    installment_number INT DEFAULT 1,
    total_installments INT DEFAULT 1,
    parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    transfer_target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RECORRÊNCIAS
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(30) NOT NULL, -- 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
    day_of_month INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CONTAS A PAGAR E A RECEBER
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_date DATE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.income_receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    expected_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    received_date DATE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ORÇAMENTOS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL,
    total_budget_limit NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    limit_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(budget_id, category_id)
);

-- 10. METAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    deadline DATE,
    icon VARCHAR(50) DEFAULT 'target',
    color VARCHAR(20) DEFAULT '#10B981',
    category VARCHAR(50) DEFAULT 'general',
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. DÍVIDAS
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    institution VARCHAR(100),
    original_amount NUMERIC(15, 2) NOT NULL,
    current_balance NUMERIC(15, 2) NOT NULL,
    interest_rate_monthly NUMERIC(6, 3) DEFAULT 0.00,
    monthly_payment NUMERIC(15, 2) DEFAULT 0.00,
    remaining_installments INT DEFAULT 0,
    due_day INT DEFAULT 10,
    is_cleared BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. INVESTIMENTOS
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    institution VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    quantity NUMERIC(15, 4) DEFAULT 1,
    invested_amount NUMERIC(15, 2) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    investment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. ATIVOS E PASSIVOS
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.liabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. ASSINATURAS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    service_provider VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    due_day INT DEFAULT 1,
    payment_method VARCHAR(50),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. NOTIFICAÇÕES E INSIGHTS DA IA
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    metrics_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
