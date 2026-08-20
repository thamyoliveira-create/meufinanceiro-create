// Visão de Calendário Financeiro Mensal - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderCalendarView(data) {
  const { transactions = [], bills = [] } = data;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthName = FORMATTERS.getMonthName(month + 1);

  // Primeiro dia da semana do mês e total de dias
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dom
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ isPadding: true });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = transactions.filter(t => t.date === dayStr && t.isPaid !== false);
    const dayBills = bills.filter(b => b.dueDate === dayStr);

    const income = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const pendingBills = dayBills.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.amount || 0), 0);

    daysArray.push({
      day,
      dateStr,
      income,
      expense,
      pendingBills,
      hasActivity: (income + expense + pendingBills) > 0,
      isToday: day === now.getDate(),
    });
  }

  return `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Header do Calendário -->
      <div class="card-fintech p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-5 h-5 text-emerald-400"></i> ${monthName} de ${year}
          </h3>
          <p class="text-xs text-slate-400">Acompanhe vencimentos de contas e movimentações dia a dia</p>
        </div>

        <!-- Legenda -->
        <div class="flex items-center gap-4 text-[11px] text-slate-300">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Receita</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Despesa</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Conta a Pagar</span>
        </div>
      </div>

      <!-- Grade do Calendário -->
      <div class="card-fintech p-4 overflow-hidden">
        <!-- Dias da Semana -->
        <div class="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        <!-- Dias do Mês -->
        <div class="grid grid-cols-7 gap-2 pt-3">
          ${daysArray.map(cell => {
            if (cell.isPadding) {
              return '<div class="h-20 sm:h-24 rounded-xl bg-slate-950/20 border border-transparent"></div>';
            }

            return `
              <div class="calendar-day-cell h-20 sm:h-24 p-2 rounded-xl border ${cell.isToday ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30' : 'border-slate-800/80 bg-slate-900/60'} hover:border-slate-600 transition-colors cursor-pointer flex flex-col justify-between" data-date="${cell.dateStr}">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${cell.isToday ? 'text-emerald-400' : 'text-slate-300'} font-mono">${cell.day}</span>
                  ${cell.isToday ? '<span class="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-bold">Hoje</span>' : ''}
                </div>

                <div class="space-y-0.5 text-[10px] font-mono font-semibold">
                  ${cell.income > 0 ? `<div class="text-emerald-400 truncate">+${FORMATTERS.formatCurrency(cell.income)}</div>` : ''}
                  ${cell.expense > 0 ? `<div class="text-red-400 truncate">-${FORMATTERS.formatCurrency(cell.expense)}</div>` : ''}
                  ${cell.pendingBills > 0 ? `<div class="text-amber-400 truncate">⏳ ${FORMATTERS.formatCurrency(cell.pendingBills)}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
