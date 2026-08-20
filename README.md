# 💰 Meu Financeiro IA

> Aplicativo completo, moderno e intuitivo de gestão financeira pessoal com Inteligência Artificial, gráficos interativos, isolamento de usuários, persistência e motor financeiro determinístico.

---

## ✨ Principais Funcionalidades

### 1. 🔐 Autenticação & Persistência Segura
- **Isolamento de Dados**: Cada usuário acessa única e exclusivamente seus próprios registros financeiros.
- **Persistência Confiável**: Base de dados em **IndexedDB multi-usuário com persistência em disco** e suporte nativo a **PostgreSQL / Supabase** com `schema.sql` e políticas de segurança RLS (*Row Level Security*).
- **Segurança Criptográfica**: Senhas com hash SHA-256 (Web Crypto API).

### 2. 📊 Dashboard Completo & Gráficos Interativos
- **Cards de Indicadores**: Saldo atual consolidado, Receitas do mês, Despesas do mês, Economia do mês, % de renda comprometida, Valor disponível até o fim do mês, Total investido e Total de dívidas.
- **Comparativo com Mês Anterior**: Variação percentual visual (ex: `↓ 8% em relação ao mês anterior`).
- **Gráficos Interativos (Chart.js)**:
  - Gastos por categoria (Doughnut).
  - Receitas vs Despesas (Histórico em barras).
  - Picos de gastos ao longo dos dias do mês.
  - Visão resumida **"Meu Mês"**.

### 3. 🤖 Inteligência Artificial Financeira & NLP
- **Cadastro Rápido em Linguagem Natural**:
  - Digite *"Gastei 48 reais no Uber hoje"* ou *"Mercado 158,90 em 2x no cartão"*.
  - A IA extrai descrição, valor, categoria, data e forma de pagamento.
  - **Conferência Obrigatória**: O usuário visualiza e confirma os dados antes de gravar no banco.
- **Detector de Gastos Fora do Padrão / Anomalias**: Identifica aumentos anômalos em relação à média dos últimos 3 meses.
- **Assistente IA e Chat Financeiro**: Consulta diretamente os dados cadastrados no banco para responder dúvidas com números reais.
- **Simulador "Posso Comprar?"**: Avalia matematicamente o impacto de compras à vista ou parceladas no orçamento e saldo projetado.

### 4. 💳 Cartões, Contas & Parcelamentos
- **Minhas Contas**: Conta corrente, poupança, dinheiro, carteiras digitais e investimentos.
- **Transferências**: Movimentações entre contas que não alteram a receita ou despesa global.
- **Cartões de Crédito**: Acompanhamento de limite total, utilizado e disponível, além de faturas e divisão automática de parcelas para os meses seguintes.

### 5. 📅 Contas a Pagar, Receber e Calendário
- **Contas a Pagar / Receber**: Status (Pendente, Pago, Recebido), alertas de vencimento e botão "Marcar como Pago" (que gera a transação correspondente no banco).
- **Calendário Financeiro**: Grade mensal com marcadores diários de receitas, despesas e vencimentos.

### 6. 🎯 Metas, Reserva de Emergência e Orçamento
- **Metas**: Progresso percentual e cálculo de aporte mensal recomendado.
- **Calculadora de Reserva de Emergência**: Sugestões para 3, 6 e 12 meses de custo de vida.
- **Orçamento Mensal**: Acompanhamento por categoria com barras de progresso e alertas de 80%, 100% e estouro.

### 7. 📄 Relatórios & Exportação
- Central **"Para Onde Foi Meu Dinheiro?"**.
- Comparação automática categoria por categoria com o mês anterior.
- Exportação para **CSV**, **Excel**, **PDF** e backup completo em **JSON**.

---

## 🚀 Como Executar Localmente

### Opção 1: Usando o Servidor Ruby Embutido
No terminal, dentro da pasta do projeto:
```bash
ruby server.rb
```
Acesse no seu navegador: `http://localhost:3000`

### Opção 2: Usando Qualquer Servidor HTTP Local
```bash
# Com Python 3
python3 -m http.server 3000

# Com Node.js (npx)
npx serve .
```

---

## 🗄️ Estrutura do Banco de Dados (Supabase / PostgreSQL)

O arquivo [schema.sql](file:///Users/tamirisoul/.gemini/antigravity/scratch/meu-financeiro-ia/schema.sql) contém o script DDL completo para criar todas as tabelas no Supabase com suporte a Row Level Security:
- `users` / `profiles`
- `accounts`
- `categories` & `subcategories`
- `credit_cards`
- `transactions`
- `recurring_transactions`
- `bills` & `income_receivables`
- `budgets` & `budget_categories`
- `financial_goals`
- `debts`
- `investments`
- `assets` & `liabilities`
- `subscriptions`
- `notifications` & `ai_insights`

---

## 🧪 Dados de Demonstração

Para testar o aplicativo imediatamente com dados completos em Real Brasileiro (BRL):
1. Crie uma conta ou faça login.
2. Acesse a aba **Configurações**.
3. Clique em **"Carregar Dados de Demonstração"**.
4. Para remover os dados de teste quando quiser, basta clicar em **"Limpar Apenas Dados Demo"**.
