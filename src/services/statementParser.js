// Motor de Reconhecimento e Importação de Extratos Bancários (OFX, CSV e Texto)
// Suporta Nubank, Itaú, Bradesco, Santander, Banco do Brasil, Inter, C6, etc.

import { FORMATTERS } from '../config/constants.js';
import { AIService } from './aiService.js';

export const StatementParser = {
  // Parser Principal Unificado
  parseStatement(fileContent, fileName = '', targetAccountId = null, categories = [], existingTransactions = []) {
    const isOfx = fileName.toLowerCase().endsWith('.ofx') || fileContent.includes('<OFX>') || fileContent.includes('<STMTTRN>');
    
    if (isOfx) {
      return this.parseOFX(fileContent, targetAccountId, categories, existingTransactions);
    } else {
      return this.parseCSVOrText(fileContent, targetAccountId, categories, existingTransactions);
    }
  },

  // Parser para arquivos OFX (Padrão Bancário Universal Brasileiro)
  parseOFX(ofxContent, targetAccountId, categories = [], existingTransactions = []) {
    const transactions = [];
    const trnBlocks = ofxContent.split(/<STMTTRN>/i).slice(1);

    trnBlocks.forEach((block, index) => {
      const getTag = (tag) => {
        const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'));
        return match ? match[1].trim() : '';
      };

      const trnType = getTag('TRNTYPE'); // DEBIT, CREDIT, OTHER
      const rawDate = getTag('DTPOSTED'); // Formato: 20260815120000[-03:EST] ou 20260815
      const rawAmount = getTag('TRNAMT'); // Ex: -158.90 ou 2500.00
      const memo = getTag('MEMO') || getTag('NAME') || `Transação #${index + 1}`;
      const fitId = getTag('FITID');

      if (!rawAmount) return;

      const numAmount = parseFloat(rawAmount.replace(',', '.'));
      const absAmount = Math.abs(numAmount);
      const isIncome = numAmount > 0 || trnType.toUpperCase() === 'CREDIT';
      const type = isIncome ? 'income' : 'expense';

      // Converte data OFX YYYYMMDD para YYYY-MM-DD
      let date = FORMATTERS.toIsoDate();
      if (rawDate && rawDate.length >= 8) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        date = `${y}-${m}-${d}`;
      }

      // Limpa e enriquece a descrição com IA
      const cleanDesc = this._cleanDescription(memo);
      const suggestedCategory = this._suggestCategory(cleanDesc, type, categories);

      // Verificação inteligente de duplicatas
      const isDuplicate = existingTransactions.some(t => 
        t.date === date && 
        Math.abs(Number(t.amount) - absAmount) < 0.01 && 
        (t.accountId === targetAccountId || !targetAccountId)
      );

      transactions.push({
        id: `stmt_${Date.now()}_${index}`,
        fitId,
        date,
        description: cleanDesc,
        rawDescription: memo,
        amount: absAmount,
        type,
        categoryId: suggestedCategory.id,
        categoryName: suggestedCategory.name,
        accountId: targetAccountId,
        paymentMethod: isIncome ? 'pix' : 'debit',
        isPaid: true,
        isDuplicate,
        selected: !isDuplicate, // pré-seleciona apenas os que não são duplicatas
      });
    });

    return transactions;
  },

  // Parser para Extratos em CSV e Texto Copiado
  parseCSVOrText(content, targetAccountId, categories = [], existingTransactions = []) {
    const lines = content.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const transactions = [];
    const delimiter = lines[0].includes(';') ? ';' : (lines[0].includes(',') ? ',' : '\t');

    lines.forEach((line, index) => {
      // Ignora possíveis cabeçalhos
      if (index === 0 && /data|date|descri|historico|valor|amount/i.test(line)) return;

      const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) return;

      // Localiza coluna de data
      let date = FORMATTERS.toIsoDate();
      let rawDate = cols.find(c => /^\d{2}\/\d{2}\/\d{4}$/.test(c) || /^\d{4}-\d{2}-\d{2}$/.test(c));
      if (rawDate) {
        if (rawDate.includes('/')) {
          const [d, m, y] = rawDate.split('/');
          date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else {
          date = rawDate;
        }
      }

      // Localiza coluna de valor
      let numAmount = 0;
      let rawAmountStr = '';
      cols.forEach(col => {
        const clean = col.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(clean);
        if (!isNaN(parsed) && parsed !== 0 && !col.includes('/')) {
          numAmount = parsed;
          rawAmountStr = col;
        }
      });

      if (numAmount === 0) return;

      const absAmount = Math.abs(numAmount);
      let isIncome = numAmount > 0;
      
      // Identifica descrição (coluna de texto mais longa que não seja valor nem data)
      let desc = cols.filter(c => c !== rawDate && c !== rawAmountStr && isNaN(parseFloat(c.replace(',', '.')))).join(' ');
      if (!desc || desc.length < 2) desc = `Lançamento #${index}`;

      if (/recebi|salario|pix recebido|deposito|estorno|ted recebida/i.test(desc)) {
        isIncome = true;
      }

      const type = isIncome ? 'income' : 'expense';
      const cleanDesc = this._cleanDescription(desc);
      const suggestedCategory = this._suggestCategory(cleanDesc, type, categories);

      // Verificação de duplicatas
      const isDuplicate = existingTransactions.some(t => 
        t.date === date && 
        Math.abs(Number(t.amount) - absAmount) < 0.01
      );

      transactions.push({
        id: `stmt_csv_${Date.now()}_${index}`,
        date,
        description: cleanDesc,
        rawDescription: desc,
        amount: absAmount,
        type,
        categoryId: suggestedCategory.id,
        categoryName: suggestedCategory.name,
        accountId: targetAccountId,
        paymentMethod: isIncome ? 'pix' : 'debit',
        isPaid: true,
        isDuplicate,
        selected: !isDuplicate,
      });
    });

    return transactions;
  },

  // Limpeza de descrições bancárias sujas
  _cleanDescription(raw) {
    let clean = raw
      .replace(/COMPRA\s+(?:A\s+VISTA|DEBITO|CREDITO|PARCELADA)?/gi, '')
      .replace(/PAGAMENTO\s+(?:DE\s+TITULO|PIX|BOLETO|CONTA)?/gi, '')
      .replace(/TRANSFERENCIA\s+(?:ENVIADA|RECEBIDA|PIX)?/gi, '')
      .replace(/PIX\s+(?:ENVIADO|RECEBIDO)?/gi, '')
      .replace(/\d{2}\/\d{2}(?:\s+\d{2}:\d{2})?/g, '') // Remove datas/horas
      .replace(/[*#_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 2) return raw.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  },

  // Sugestão de categoria com base em palavras-chave bancárias
  _suggestCategory(text, type, categories = []) {
    const clean = text.toLowerCase();
    const typeCats = categories.filter(c => c.type === type);

    const rules = [
      { regex: /ifood|uber eats|restaurante|burger|pizza|padaria|mcdonald|subway|habib|outback|lanches/i, match: 'alimenta' },
      { regex: /mercado|supermercado|carrefour|pao de acucar|assai|atacad|extra|hortifruti/i, match: 'alimenta' },
      { regex: /uber|99|taxi|posto|shell|ipiranga|combustivel|estacionamento|pedagio|sem parar/i, match: 'transporte' },
      { regex: /enel|sabesp|comgas|luz|energia|agua|aluguel|condominio|iptu|internet|claro|vivo|tim/i, match: 'moradia' },
      { regex: /farmacia|droga raia|drogasil|pague menos|drogaria|consulta|medico|dentista|laboratorio/i, match: 'saude' },
      { regex: /netflix|spotify|amazon prime|disney|apple|google|youtube|smartfit|academia/i, match: 'assinatura' },
      { regex: /cinema|cinemark|ingresso|show|teatro|sympla|eventim|bar|cervejaria/i, match: 'lazer' },
      { regex: /amazon|mercado livre|shopee|magalu|aliexpress|zara|renner|riachuelo|nike|centauro/i, match: 'compra' },
      { regex: /salario|pro labore|remuneracao|folha|rendimento/i, match: 'salario' },
      { regex: /freela|servico|consultoria|honorarios/i, match: 'renda extra' },
    ];

    for (const rule of rules) {
      if (rule.regex.test(clean)) {
        const found = typeCats.find(c => c.name.toLowerCase().includes(rule.match));
        if (found) return found;
      }
    }

    // Categoria padrão caso não encontre
    const defaultCat = typeCats[0] || { id: null, name: type === 'income' ? 'Outras Receitas' : 'Outros Gastos' };
    return defaultCat;
  }
};
