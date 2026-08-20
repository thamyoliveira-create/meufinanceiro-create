// Visão do Assistente Financeiro IA e Painel de Insights - Meu Financeiro IA

import { FORMATTERS } from '../../config/constants.js';

export function renderAiAssistantView(data) {
  const { insights = [], anomalies = [] } = data;

  return `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Header do Assistente -->
      <div class="card-fintech p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i data-lucide="bot" class="w-6 h-6 text-slate-950 font-bold"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              Assistente Financeiro IA
              <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">Conectado</span>
            </h3>
            <p class="text-xs text-slate-400">Análise de dados reais, detecção de padrões e consultoria inteligente</p>
          </div>
        </div>
      </div>

      <!-- Alertas de Gastos Fora do Padrão se houver -->
      ${anomalies.length > 0 ? `
        <div class="card-fintech p-6 border-amber-500/40 bg-amber-500/5 space-y-3">
          <div class="flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-400"></i>
            <h4 class="text-sm font-bold text-amber-300">Gastos Fora do Padrão Identificados</h4>
          </div>
          <div class="space-y-2">
            ${anomalies.map(a => `
              <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 flex items-center justify-between">
                <div>
                  <strong class="text-white">${a.categoryName}:</strong> ${a.message}
                </div>
                <span class="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">+${a.percentIncrease.toFixed(0)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Grid de Insights Deste Mês (Requisito 22) -->
      <div class="space-y-4">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i> Insights Deste Mês (Baseados nos Seus Dados)
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${insights.map(ins => {
            let borderColor = 'border-slate-800';
            let iconColor = 'text-emerald-400';
            if (ins.level === 'warning') {
              borderColor = 'border-amber-500/30';
              iconColor = 'text-amber-400';
            } else if (ins.level === 'danger') {
              borderColor = 'border-red-500/30';
              iconColor = 'text-red-400';
            }

            return `
              <div class="card-fintech p-5 flex flex-col justify-between ${borderColor}">
                <div>
                  <div class="flex items-center gap-2.5 mb-3">
                    <div class="p-2 rounded-xl bg-slate-800/80 ${iconColor}">
                      <i data-lucide="${ins.icon || 'sparkles'}" class="w-4 h-4"></i>
                    </div>
                    <h5 class="text-xs font-bold text-white">${ins.title}</h5>
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed">${ins.text}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Chat Dedicado em Tela Cheia (Requisito 24) -->
      <div class="card-fintech p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="message-square" class="w-4 h-4 text-indigo-400"></i> Conversar com a IA Financeira
          </h4>
          <span class="text-[11px] text-slate-400">Pergunte qualquer coisa sobre suas finanças</span>
        </div>

        <!-- Mensagens do Chat -->
        <div id="fullChatMessages" class="h-80 overflow-y-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3 custom-scrollbar text-xs">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <i data-lucide="bot" class="w-4 h-4"></i>
            </div>
            <div class="p-3.5 bg-slate-800/90 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-200 leading-relaxed max-w-[85%]">
              Olá! Estou conectado ao seu banco de dados financeiro. Posso responder perguntas sobre quanto você gastou com alimentação, assinaturas, compras parceladas, evolução de patrimônio ou metas.
            </div>
          </div>
        </div>

        <!-- Input do Chat -->
        <form id="fullChatForm" class="flex items-center gap-3">
          <input type="text" id="fullChatInput" placeholder="Ex: Quanto gastei com comida este mês? Onde posso economizar?" class="input-fintech text-xs py-2.5">
          <button type="submit" class="btn-primary text-xs py-2.5 px-4 flex-shrink-0">
            <i data-lucide="send" class="w-4 h-4"></i> Perguntar
          </button>
        </form>
      </div>
    </div>
  `;
}
