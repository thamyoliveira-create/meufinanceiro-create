// Motor de Reconhecimento e Importação de Extratos Bancários (PDF, OFX, CSV e Texto)
// Suporta Nubank, Itaú, Bradesco, Santander, Banco do Brasil, Inter, C6, Caixa, etc.

import { FORMATTERS } from '../config/constants.js';

export const StatementParser = {
  // Parser Principal Unificado
  async parseStatement(contentOrBuffer, fileName = '', targetAccountId = null, categories = [], existingTransactions = []) {
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || (contentOrBuffer instanceof ArrayBuffer);
    const isOfx = typeof contentOrBuffer === 'string' && (fileName.toLowerCase().endsWith('.ofx') || contentOrBuffer.includes('<OFX>') || contentOrBuffer.includes('<STMTTRN>'));

    if (isPdf) {
      return this.parsePDF(contentOrBuffer, targetAccountId, categories, existingTransactions);
    } else if (isOfx) {
      return this.parseOFX(contentOrBuffer, targetAccountId, categories, existingTransactions);
    } else {
      return this.parseCSVOrText(contentOrBuffer, targetAccountId, categories, existingTransactions);
    }
  },

  // Parser Especializado para Arquivos PDF (Extratos e Faturas Bancárias)
  async parsePDF(arrayBuffer, targetAccountId, categories = [], existingTransactions = []) {
    if (!window.pdfjsLib) {
      throw new Error('Biblioteca PDF.js não carregada.');
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let extractedLines = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Agrupa os itens de texto por coordenada Y (linhas visuais da página)
      const lineMap = new Map();
      textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]); // Coordenada vertical
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y).push({ x: item.transform[4], str: item.str });
      });

      // Ordena as linhas do topo para a base da página
      const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

      sortedY.forEach(y => {
        const items = lineMap.get(y).sort((a, b) => a.x - b.x);
        const lineText = items.map(it => it.str).join(' ').trim();
        if (lineText.length > 2) {
          extractedLines.push(lineText);
        }
      });
    }

    const fullText = extractedLines.join('\n');
    return this.parseCSVOrText(fullText, targetAccountId, categories, existingTransactions);
  },

  // Parser para arquivos OFX
  parseOFX(ofxContent, targetAccountId, categories = [], existingTransactions = []) {
    const transactions = [];
    const trnBlocks = ofxContent.split(/<STMTTRN>/i).slice(1);

    trnBlocks.forEach((block, index) => {
      const getTag = (tag) => {
        const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'));
        return match ? match[1].trim() : '';
      };

      const trnType = getTag('TRNTYPE');
      const rawDate = getTag('DTPOSTED');
      const rawAmount = getTag('TRNAMT');
      const memo = getTag('MEMO') || getTag('NAME') || `Transação #${index + 1}`;
      const fitId = getTag('FITID');

      if (!rawAmount) return;

      const numAmount = parseFloat(rawAmount.replace(',', '.'));
      const absAmount = Math.abs(numAmount);
      const isIncome = numAmount > 0 || trnType.toUpperCase() === 'CREDIT';
      const type = isIncome ? 'income' : 'expense';

      let date = FORMATTERS.toIsoDate();
      if (rawDate && rawDate.length >= 8) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        date = `${y}-${m}-${d}`;
      }

      const cleanDesc = this._cleanDescription(memo);
      const suggestedCategory = this._suggestCategory(cleanDesc, type, categories);

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
        selected: !isDuplicate,
      });
    });

    return transactions;
  },

  // Parser para Extratos em CSV, Texto e Conteúdo de PDF
  parseCSVOrText(content, targetAccountId, categories = [], existingTransactions = []) {
    const lines = content.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const transactions = [];
    const currentYear = new Date().getFullYear();

    lines.forEach((line, index) => {
      // Ignora cabeçalhos institucionais comuns
      if (/saldo anterior|saldo final|extrato de conta|rendimento liquido|periodo:|folha de cheque|total da fatura/i.test(line)) return;

      // 1. Localiza Data (DD/MM/AAAA, DD/MM, ou DD MMM como 15 AGO)
      let date = null;
      const fullDateMatch = line.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
      const shortDateMatch = line.match(/\b(\d{2})\/(\d{2})\b/);
      const monthNameMatch = line.match(/\b(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\b/i);

      if (fullDateMatch) {
        date = `${fullDateMatch[3]}-${fullDateMatch[2]}-${fullDateMatch[1]}`;
      } else if (shortDateMatch) {
        date = `${currentYear}-${shortDateMatch[2]}-${shortDateMatch[1]}`;
      } else if (monthNameMatch) {
        const monthNames = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };
        const m = monthNames[monthNameMatch[2].toLowerCase()] || '01';
        const d = String(monthNameMatch[1]).padStart(2, '0');
        date = `${currentYear}-${m}-${d}`;
      }

      if (!date) return; // Se a linha não tem data, não é uma transação individual

      // 2. Localiza Valor em Reais (ex: R$ 150,00 | -150,00 | 150,00 D | 150.00)
      const amountMatches = line.match(/(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+[.,]\d{2})\s*(D|C|\+|-)?/gi);
      if (!amountMatches) return;

      const lastMatch = amountMatches[amountMatches.length - 1]; // Geralmente o valor está no final da linha
      let cleanValStr = lastMatch.replace(/R\$|\s/gi, '').replace(/\./g, '').replace(',', '.');
      
      let numAmount = parseFloat(cleanValStr);
      if (isNaN(numAmount) || numAmount === 0) return;

      const isDebitExplicit = /D|-/i.test(lastMatch) || cleanValStr.startsWith('-');
      const isCreditExplicit = /C|\+/i.test(lastMatch);

      let isIncome = isCreditExplicit && !isDebitExplicit;
      if (!isCreditExplicit && !isDebitExplicit) {
        if (/recebi|salario|pix recebido|deposito|ted recebida|rendimento/i.test(line)) {
          isIncome = true;
        }
      }

      const absAmount = Math.abs(numAmount);
      const type = isIncome ? 'income' : 'expense';

      // 3. Limpa a Descrição removendo data e valor
      let desc = line
        .replace(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g, '')
        .replace(/\b\d{1,2}\s+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\b/gi, '')
        .replace(/(?:R\$\s*)?-?\d+[.,]\d{2}\s*(?:D|C|\+|-)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!desc || desc.length < 2) desc = `Lançamento Bancário #${index}`;

      const cleanDesc = this._cleanDescription(desc);
      const suggestedCategory = this._suggestCategory(cleanDesc, type, categories);

      const isDuplicate = existingTransactions.some(t => 
        t.date === date && 
        Math.abs(Number(t.amount) - absAmount) < 0.01
      );

      transactions.push({
        id: `stmt_pdf_${Date.now()}_${index}`,
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

  _cleanDescription(raw) {
    let clean = raw
      .replace(/COMPRA\s+(?:A\s+VISTA|DEBITO|CREDITO|PARCELADA)?/gi, '')
      .replace(/PAGAMENTO\s+(?:DE\s+TITULO|PIX|BOLETO|CONTA)?/gi, '')
      .replace(/TRANSFERENCIA\s+(?:ENVIADA|RECEBIDA|PIX)?/gi, '')
      .replace(/PIX\s+(?:ENVIADO|RECEBIDO)?/gi, '')
      .replace(/[*#_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 2) return raw.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  },

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

    const defaultCat = typeCats[0] || { id: null, name: type === 'income' ? 'Outras Receitas' : 'Outros Gastos' };
    return defaultCat;
  }
};
