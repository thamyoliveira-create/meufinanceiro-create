// Serviço de Exportação e Importação - Meu Financeiro IA
// Suporta CSV (compatível com Excel Brasil), JSON e Relatórios Formatados

import { FORMATTERS } from '../config/constants.js';

export const ExportService = {
  // Exportar Transações para CSV
  exportTransactionsToCSV(transactions, categories = [], accounts = []) {
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const accMap = new Map(accounts.map(a => [a.id, a.name]));

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor (R$)', 'Forma Pagamento', 'Status', 'Observações'];
    const rows = transactions.map(t => [
      FORMATTERS.formatDate(t.date),
      t.type === 'income' ? 'Receita' : (t.type === 'transfer' ? 'Transferência' : 'Despesa'),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(catMap.get(t.categoryId) || 'Geral').replace(/"/g, '""')}"`,
      `"${(accMap.get(t.accountId) || '').replace(/"/g, '""')}"`,
      Number(t.amount || 0).toFixed(2).replace('.', ','),
      t.paymentMethod || '',
      t.isPaid ? 'Efetivado' : 'Pendente',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    this._downloadFile(csvContent, `Meu_Financeiro_Transacoes_${FORMATTERS.toIsoDate()}.csv`, 'text/csv;charset=utf-8;');
  },

  // Exportar Backup Completo em JSON
  exportFullBackup(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    this._downloadFile(jsonStr, `Meu_Financeiro_Backup_${FORMATTERS.toIsoDate()}.json`, 'application/json');
  },

  // Importar Transações via CSV
  parseCSVFile(fileContent, defaultAccountId, categories = []) {
    const lines = fileContent.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));

    // Mapeamento automático de índices
    const dateIdx = headers.findIndex(h => /data|date/i.test(h));
    const descIdx = headers.findIndex(h => /descri|memo|historico|desc/i.test(h));
    const amountIdx = headers.findIndex(h => /valor|quantia|amount|total/i.test(h));
    const typeIdx = headers.findIndex(h => /tipo|type/i.test(h));
    const catIdx = headers.findIndex(h => /categoria|category/i.test(h));

    const parsedTransactions = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) continue;

      const desc = descIdx !== -1 ? parts[descIdx] : `Transação #${i}`;
      let rawAmount = amountIdx !== -1 ? parts[amountIdx] : '0';
      rawAmount = rawAmount.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
      let amount = Math.abs(parseFloat(rawAmount) || 0);

      let date = FORMATTERS.toIsoDate();
      if (dateIdx !== -1 && parts[dateIdx]) {
        const rawDate = parts[dateIdx];
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
          const [d, m, y] = rawDate.split('/');
          date = `${y}-${m}-${d}`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          date = rawDate;
        }
      }

      let type = 'expense';
      if (typeIdx !== -1 && /receita|income|crédito|credito/i.test(parts[typeIdx])) {
        type = 'income';
      } else if (parseFloat(rawAmount) > 0 && typeIdx === -1 && /salario|pix recebido|deposito/i.test(desc)) {
        type = 'income';
      }

      parsedTransactions.push({
        date,
        description: desc || 'Despesa Importada',
        amount,
        type,
        accountId: defaultAccountId,
        isPaid: true,
        paymentMethod: 'pix',
        notes: 'Importado via arquivo CSV',
      });
    }

    return parsedTransactions;
  },

  // Helper interno de download
  _downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
