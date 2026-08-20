// Motor de Inteligência Artificial Financeira - Meu Financeiro IA
// Processamento de Linguagem Natural, Detector de Anomalias, Insights e Chatbot contextual

import { FORMATTERS } from '../config/constants.js';

export const AIService = {
  // Parser de Linguagem Natural para Cadastro Rápido ("+ Registrar Gasto")
  parseNaturalLanguageExpense(text, categories = []) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const clean = text.trim();
    const today = new Date();
    let date = FORMATTERS.toIsoDate(today);

    // 1. Detecção de Data
    if (/\bontem\b/i.test(clean)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      date = FORMATTERS.toIsoDate(d);
    } else if (/\banteontem\b/i.test(clean)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 2);
      date = FORMATTERS.toIsoDate(d);
    }

    // 2. Detecção de Valor em Reais (R$ 158,90 | 48 reais | 48,00 | 120.50 | 50)
    let amount = 0;
    const valueMatch = clean.match(/(?:r\$\s*|reais\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais|conto)?/i);
    if (valueMatch) {
      // Procura formato explícito R$ XX,XX ou XX reais
      const valStr = valueMatch[1].replace(',', '.');
      amount = parseFloat(valStr) || 0;
    }

    // 3. Detecção de Parcelas (ex: "em 3x", "parcelado em 6 vezes")
    let installments = 1;
    const instMatch = clean.match(/(\d+)\s*(?:x|vezes|parcelas)/i);
    if (instMatch) {
      installments = parseInt(instMatch[1], 10);
    }

    // 4. Detecção de Forma de Pagamento
    let paymentMethod = 'pix';
    if (/cart[aã]o|cr[eé]dito/i.test(clean)) paymentMethod = 'credit';
    else if (/d[eé]bito/i.test(clean)) paymentMethod = 'debit';
    else if (/dinheiro|esp[eé]cie/i.test(clean)) paymentMethod = 'money';
    else if (/boleto/i.test(clean)) paymentMethod = 'boleto';

    // 5. Detecção de Tipo (Receita vs Despesa)
    let type = 'expense';
    if (/recebi|ganhei|sal[aá]rio|renda|freela|pix recebido|dep[oó]sito/i.test(clean)) {
      type = 'income';
    }

    // 6. Sugestão Inteligente de Categoria por Palavras-Chave
    let categoryId = null;
    let suggestedCatName = 'Outros Gastos';

    const keywordCategoryMap = [
      { regex: /mercado|supermercado|feira|hortifruti|a[çc]ougue|p[aã]o de a[çc][uú]car|carrefour/i, cat: 'alimentação', sub: 'Mercado' },
      { regex: /uber|99|t[aá]xi|gasolina|combust[ií]vel|posto|estacionamento|ped[aá]gio|metr[oô]|onibus/i, cat: 'transporte', sub: 'Uber / Combustível' },
      { regex: /restaurante|almo[çc]o|jantar|lanchonete|ifood|delivery|pizza|hamb[uú]rguer|caf[eé]|padaria/i, cat: 'alimentação', sub: 'Restaurante / Delivery' },
      { regex: /farm[aá]cia|rem[eé]dio|drogaria|m[eé]dico|dentista|exame|consulta|terapia/i, cat: 'saúde', sub: 'Farmácia' },
      { regex: /netflix|spotify|amazon prime|disney|academia|smartfit|assinatura/i, cat: 'assinaturas', sub: 'Streaming / Academia' },
      { regex: /aluguel|condom[ií]nio|enel|luz|energia|[aá]gua|sabesp|internet|claro|vivo/i, cat: 'moradia', sub: 'Contas da Casa' },
      { regex: /cinema|show|festa|bar|cerveja|passeio|viagem|hotel/i, cat: 'lazer', sub: 'Lazer' },
      { regex: /roupa|t[eê]nis|sapato|shopping|livro|notebook|celular|compras/i, cat: 'compras', sub: 'Compras Pessoais' },
      { regex: /sal[aá]rio|pagamento da firma/i, cat: 'salário', sub: 'Salário Fixo' },
      { regex: /freela|freelance|bico|servi[çc]o extra/i, cat: 'renda extra', sub: 'Freelancer' },
    ];

    for (const rule of keywordCategoryMap) {
      if (rule.regex.test(clean)) {
        const found = categories.find(c => c.name.toLowerCase().includes(rule.cat));
        if (found) {
          categoryId = found.id;
          suggestedCatName = found.name;
          break;
        }
      }
    }

    if (!categoryId && categories.length > 0) {
      const defaultCat = categories.find(c => c.type === type);
      if (defaultCat) {
        categoryId = defaultCat.id;
        suggestedCatName = defaultCat.name;
      }
    }

    // 7. Limpeza da Descrição (Remove termos operacionais para deixar nome limpo)
    let description = clean
      .replace(/gastei\s*|paguei\s*|comprei\s*|recebi\s*|ganhei\s*/gi, '')
      .replace(/hoje|ontem|anteontem/gi, '')
      .replace(/(?:r\$\s*|reais\s*)?\d+(?:[.,]\d{1,2})?\s*(?:reais|conto)?/gi, '')
      .replace(/no\s*(?:cart[aã]o|cr[eé]dito|d[eé]bito|pix|dinheiro|boleto)/gi, '')
      .replace(/em\s*\d+\s*(?:x|vezes|parcelas)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description || description.length < 2) {
      description = suggestedCatName;
    } else {
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    return {
      rawText: text,
      type,
      amount,
      date,
      description,
      categoryId,
      categoryName: suggestedCatName,
      installments,
      paymentMethod,
      confidence: amount > 0 ? 0.95 : 0.6,
    };
  },

  // Detector de Gastos Fora do Padrão / Anomalias (Desvio vs Média de 3 Meses)
  detectAnomalies(transactions, categories) {
    const now = new Date();
    const currentMonthKey = FORMATTERS.getCurrentMonthKey(now);

    const past3MonthKeys = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      past3MonthKeys.push(FORMATTERS.getCurrentMonthKey(d));
    }

    const anomalies = [];

    categories.filter(c => c.type === 'expense').forEach(cat => {
      // Gastos no mês atual
      const currentCatTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(currentMonthKey) && t.isPaid !== false);
      const currentTotal = currentCatTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      // Média nos 3 meses anteriores
      let pastTotals = 0;
      let pastMonthsWithData = 0;

      past3MonthKeys.forEach(mKey => {
        const pastTxs = transactions.filter(t => t.categoryId === cat.id && t.date && t.date.startsWith(mKey) && t.isPaid !== false);
        const mTotal = pastTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        if (mTotal > 0) {
          pastTotals += mTotal;
          pastMonthsWithData += 1;
        }
      });

      if (pastMonthsWithData >= 1 && currentTotal > 100) {
        const avg = pastTotals / pastMonthsWithData;
        const diff = currentTotal - avg;
        const percentIncrease = ((currentTotal - avg) / avg) * 100;

        // Se gastou mais de 40% acima da média e mais de R$ 100 de diferença
        if (percentIncrease >= 40 && diff > 100) {
          anomalies.push({
            categoryId: cat.id,
            categoryName: cat.name,
            currentTotal,
            historicalAverage: avg,
            diff,
            percentIncrease,
            message: `Gastos com ${cat.name} estão ${percentIncrease.toFixed(0)}% acima da sua média recente (${FORMATTERS.formatCurrency(currentTotal)} vs ${FORMATTERS.formatCurrency(avg)}).`,
          });
        }
      }
    });

    return anomalies;
  },

  // Gerador de Insights Mensais Baseados em Dados Reais
  generateMonthlyInsights(metrics, categoryBreakdown, subscriptions = [], transactions = [], budgets = []) {
    const insights = [];

    // 1. Insight de Assinaturas
    if (subscriptions.length > 0) {
      const activeSubs = subscriptions.filter(s => s.isActive !== false);
      const subMonthly = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      const subAnnual = subMonthly * 12;
      insights.push({
        type: 'subscriptions',
        icon: 'repeat',
        title: 'Impacto de Assinaturas',
        text: `Você possui ${activeSubs.length} assinaturas ativas que somam ${FORMATTERS.formatCurrency(subMonthly)} por mês (equivalente a ${FORMATTERS.formatCurrency(subAnnual)} por ano).`,
        level: subMonthly > 300 ? 'warning' : 'info',
      });
    }

    // 2. Insight de Compras Parceladas
    const currentMonthInstallments = transactions.filter(t => t.isInstallment && t.date && t.date.startsWith(metrics.monthKey));
    if (currentMonthInstallments.length > 0) {
      const instTotal = currentMonthInstallments.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      insights.push({
        type: 'installments',
        icon: 'credit-card',
        title: 'Compras Parceladas',
        text: `${FORMATTERS.formatCurrency(instTotal)} das suas despesas deste mês correspondem a faturas de compras parceladas.`,
        level: 'info',
      });
    }

    // 3. Insight de Maior Categoria de Gastos
    if (categoryBreakdown && categoryBreakdown.list && categoryBreakdown.list.length > 0) {
      const topCat = categoryBreakdown.list[0];
      insights.push({
        type: 'top_category',
        icon: 'pie-chart',
        title: 'Maior Centro de Custo',
        text: `Sua maior categoria de despesas no mês é ${topCat.name}, totalizando ${FORMATTERS.formatCurrency(topCat.amount)} (${topCat.percentage.toFixed(1)}% de todas as despesas).`,
        level: topCat.percentage > 40 ? 'warning' : 'info',
      });
    }

    // 4. Insight de Variação de Gastos Geral
    if (metrics.prevExpense > 0) {
      const varPct = metrics.expenseVarPercent;
      const absDiff = Math.abs(metrics.expenseDiff);
      if (varPct < 0) {
        insights.push({
          type: 'savings_progress',
          icon: 'trending-down',
          title: 'Redução de Gastos',
          text: `Suas despesas totais estão ${Math.abs(varPct).toFixed(1)}% menores em relação ao mês anterior (economia de ${FORMATTERS.formatCurrency(absDiff)}).`,
          level: 'success',
        });
      } else if (varPct > 15) {
        insights.push({
          type: 'expense_alert',
          icon: 'alert-triangle',
          title: 'Aumento nas Despesas',
          text: `Seus gastos totais aumentaram ${varPct.toFixed(1)}% (${FORMATTERS.formatCurrency(absDiff)}) em comparação ao mês passado.`,
          level: 'warning',
        });
      }
    }

    // 5. Projeção de Saldo
    if (metrics.projectedEndBalance !== undefined) {
      insights.push({
        type: 'forecast',
        icon: 'calculator',
        title: 'Projeção de Fechamento',
        text: `Considerando contas a pagar e a receber restantes, seu saldo projetado para o fim do mês é de aproximadamente ${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}.`,
        level: metrics.projectedEndBalance < 0 ? 'danger' : 'info',
      });
    }

    return insights;
  },

  // Assistente de Chat Financeiro Inteligente com Consulta ao Banco
  async handleChatQuery(question, contextData) {
    const q = question.toLowerCase().trim();
    const { metrics, categories, transactions, goals, debts, subscriptions, apiKey } = contextData;

    // Se houver chave da API do Gemini configurada nas preferências do usuário, podemos realizar chamada com contexto seguro
    if (apiKey) {
      try {
        const geminiResponse = await this._callGeminiAPI(question, contextData, apiKey);
        if (geminiResponse) return geminiResponse;
      } catch (err) {
        console.warn('Fallback para motor local determinístico:', err);
      }
    }

    // Processador Local de Respostas Determinísticas Baseadas em Dados Reais
    if (q.includes('comida') || q.includes('alimenta') || q.includes('mercado') || q.includes('restaurante')) {
      const catAlim = categories.find(c => c.name.toLowerCase().includes('alimenta'));
      if (!catAlim) return 'Não encontrei uma categoria de alimentação cadastrada.';

      const alimTxs = transactions.filter(t => t.categoryId === catAlim.id && t.date.startsWith(metrics.monthKey) && t.isPaid !== false);
      const total = alimTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      if (total === 0) return 'Você ainda não registrou nenhum gasto com Alimentação neste mês.';
      return `Neste mês, você registrou um total de **${FORMATTERS.formatCurrency(total)}** em Alimentação (${alimTxs.length} transações).`;
    }

    if (q.includes('uber') || q.includes('transporte') || q.includes('gasolina')) {
      const catTransp = categories.find(c => c.name.toLowerCase().includes('transporte'));
      const transpTxs = transactions.filter(t => (t.categoryId === catTransp?.id || /uber|99|gasolina/i.test(t.description)) && t.isPaid !== false);
      const total = transpTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return `Você gastou um total acumulado de **${FORMATTERS.formatCurrency(total)}** em transporte e deslocamentos cadastrados.`;
    }

    if (q.includes('assinatura') || q.includes('streaming') || q.includes('netflix')) {
      if (!subscriptions || subscriptions.length === 0) {
        return 'Você não possui nenhuma assinatura cadastrada no momento.';
      }
      const monthly = subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      const listNames = subscriptions.map(s => `• ${s.name}: ${FORMATTERS.formatCurrency(s.amount)}/mês`).join('\n');
      return `Você possui **${subscriptions.length} assinaturas** ativas, totalizando **${FORMATTERS.formatCurrency(monthly)}/mês** (${FORMATTERS.formatCurrency(monthly * 12)} por ano):\n\n${listNames}`;
    }

    if (q.includes('reserva') || q.includes('emergência')) {
      const emergencyGoal = goals.find(g => g.category === 'emergency' || /reserva/i.test(g.name));
      if (emergencyGoal) {
        const pct = ((emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100).toFixed(1);
        const remaining = Math.max(0, emergencyGoal.targetAmount - emergencyGoal.currentAmount);
        return `Sua **Reserva de Emergência** está em **${pct}%** (${FORMATTERS.formatCurrency(emergencyGoal.currentAmount)} de ${FORMATTERS.formatCurrency(emergencyGoal.targetAmount)}). Faltam **${FORMATTERS.formatCurrency(remaining)}** para atingir sua meta.`;
      }
      return 'Você ainda não cadastrou uma meta específica para Reserva de Emergência. Recomendo criar uma na aba Metas!';
    }

    if (q.includes('onde estou gastando mais') || q.includes('maior gasto') || q.includes('mais caro')) {
      const breakdown = FinanceEngine.calculateCategoryBreakdown(transactions.filter(t => t.date.startsWith(metrics.monthKey)), categories);
      if (breakdown.list.length === 0) return 'Ainda não há dados suficientes de despesas neste mês para determinar sua maior categoria.';
      const top = breakdown.list[0];
      return `Seu maior gasto neste mês é em **${top.name}**, somando **${FORMATTERS.formatCurrency(top.amount)}** (${top.percentage.toFixed(1)}% de todas as despesas).`;
    }

    if (q.includes('saldo') || q.includes('quanto tenho')) {
      return `Seu saldo atual consolidado em todas as contas é de **${FORMATTERS.formatCurrency(metrics.currentBalance)}**. A projeção para o final do mês é de aproximadamente **${FORMATTERS.formatCurrency(metrics.projectedEndBalance)}**.`;
    }

    if (q.includes('reduzir') || q.includes('economizar') || q.includes('cortar')) {
      return `Com base nos seus dados reais deste mês:\n\n1. **Assinaturas**: Totalizam ${FORMATTERS.formatCurrency(subscriptions.reduce((s, x) => s + Number(x.amount || 0), 0))}/mês. Revise serviços que você não usa com frequência.\n2. **Alimentação Fora / Delivery**: Geralmente representa oportunidades rápidas de economia ao cozinhar mais refeições em casa.\n3. **Compras Parceladas**: Evite assumir novos parcelamentos no cartão até quitar as faturas pendentes.`;
    }

    // Resposta padrão analítica e transparente
    return `Analisando seus dados cadastrados deste mês:\n• Receitas: **${FORMATTERS.formatCurrency(metrics.currentIncome)}**\n• Despesas: **${FORMATTERS.formatCurrency(metrics.currentExpense)}**\n• Economia: **${FORMATTERS.formatCurrency(metrics.currentSavings)}** (${metrics.savingsRate.toFixed(1)}% da renda).\n\nPosso ajudar com cálculos sobre alimentação, assinaturas, reservas, compras parceladas ou metas!`;
  },

  // Integração com API do Gemini (quando configurada)
  async _callGeminiAPI(question, contextData, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const contextSummary = JSON.stringify({
      saldoAtual: contextData.metrics.currentBalance,
      receitasMes: contextData.metrics.currentIncome,
      despesasMes: contextData.metrics.currentExpense,
      projecaoFimMes: contextData.metrics.projectedEndBalance,
      totalDividas: contextData.metrics.totalDebts,
      totalInvestido: contextData.metrics.totalInvested,
      quantidadeTransacoes: contextData.transactions.length,
      assinaturas: contextData.subscriptions.map(s => ({ nome: s.name, valor: s.amount })),
    });

    const prompt = `Você é o Meu Financeiro IA, um consultor financeiro pessoal inteligente, empático, objetivo e rigorosamente baseado em fatos matemáticos.
Aqui estão os dados reais do usuário (em Reais R$):
${contextSummary}

Regras:
1. NUNCA invente números, contas ou transações que não constam nos dados.
2. Seja construtivo e encorajador, nunca acusatório.
3. Se faltarem dados para responder, diga educadamente que não há registros suficientes.
4. Responda em português brasileiro formatado em Markdown com clareza.

Pergunta do usuário: "${question}"`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) throw new Error('Falha na resposta da API Gemini');
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  }
};
