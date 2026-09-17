// View: Dashboard (Baseado no layout Stitch Enxuto)
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatDate, formatCurrency } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('dashboard');
  const headerHtml = UI.renderHeader('Painel Geral da Agência');

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg" id="dashboard-content">
          <!-- Header Contextual -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md py-space-xs">
            <div>
              <div class="flex items-center gap-space-xs mb-1">
                <span class="inline-flex items-center gap-1 bg-lime-50 border border-lime-200 text-olive-primary px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-olive-primary animate-pulse"></span>
                  Operações em Tempo Real
                </span>
              </div>
              <h1 class="font-headline-lg text-[26px] text-on-surface font-bold tracking-tight">Visão Geral & Métricas da Agência</h1>
              <p class="font-body-md text-text-secondary text-[14px] mt-space-2xs">Resumo das principais metas, entregas e relacionamentos ativos.</p>
            </div>
            <div class="flex items-center gap-space-sm">
              <div class="flex items-center bg-surface-container-lowest border border-border-subtle p-1 rounded-xl shadow-xs text-body-sm">
                <button type="button" class="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold shadow-xs">Este Mês</button>
              </div>
            </div>
          </div>

          <!-- 4 KPIs (Stitch Style) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base" id="kpi-grid">
            <!-- KPI 1 -->
            <div class="bg-surface-container-lowest border border-border-subtle p-space-base rounded-2xl shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-space-sm">
                <span class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Leads Ativos</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle">
                  <span class="material-symbols-outlined text-[18px]">filter_alt</span>
                </div>
              </div>
              <div class="flex items-baseline gap-space-xs mb-space-2xs">
                <span class="font-headline-xl text-[32px] text-on-surface font-bold tracking-tight leading-none" id="kpi-leads-count">...</span>
                <span class="font-body-sm text-text-secondary">oportunidades</span>
              </div>
              <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle/80 mt-space-xs text-[12px]">
                <span class="inline-flex items-center gap-1 text-olive-primary font-semibold">
                  <span class="material-symbols-outlined text-[14px]">trending_up</span> Funil ativo
                </span>
                <span class="text-text-muted">Prospecção</span>
              </div>
            </div>

            <!-- KPI 2 -->
            <div class="bg-surface-container-lowest border border-border-subtle p-space-base rounded-2xl shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-space-sm">
                <span class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Carteira de Clientes</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-olive-primary border border-border-subtle">
                  <span class="material-symbols-outlined text-[18px]">domain</span>
                </div>
              </div>
              <div class="flex items-baseline gap-space-xs mb-space-2xs">
                <span class="font-headline-xl text-[32px] text-on-surface font-bold tracking-tight leading-none" id="kpi-clientes-count">...</span>
                <span class="font-body-sm text-text-secondary">contratos</span>
              </div>
              <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle/80 mt-space-xs text-[12px]">
                <span class="text-text-secondary">Retenção: <strong class="text-on-surface font-semibold">96.8%</strong></span>
                <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-[11px]">Ativo</span>
              </div>
            </div>

            <!-- KPI 3 -->
            <div class="bg-surface-container-lowest border border-border-subtle p-space-base rounded-2xl shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-space-sm">
                <span class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Projetos em Curso</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-brass-accent border border-border-subtle">
                  <span class="material-symbols-outlined text-[18px]">view_kanban</span>
                </div>
              </div>
              <div class="flex items-baseline gap-space-xs mb-space-2xs">
                <span class="font-headline-xl text-[32px] text-on-surface font-bold tracking-tight leading-none" id="kpi-projetos-count">...</span>
                <span class="font-body-sm text-text-secondary">sprints</span>
              </div>
              <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle/80 mt-space-xs text-[12px]">
                <span class="text-text-secondary">Em andamento</span>
                <span class="text-olive-primary font-semibold">Kanban Sync</span>
              </div>
            </div>

            <!-- KPI 4 -->
            <div class="bg-surface-container-lowest border border-border-subtle p-space-base rounded-2xl shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-space-sm">
                <span class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Reuniões da Semana</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-border-subtle">
                  <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
              </div>
              <div class="flex items-baseline gap-space-xs mb-space-2xs">
                <span class="font-headline-xl text-[32px] text-on-surface font-bold tracking-tight leading-none" id="kpi-reunioes-count">...</span>
                <span class="font-body-sm text-text-secondary">agendadas</span>
              </div>
              <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle/80 mt-space-xs text-[12px]">
                <span class="text-text-secondary">Próximos 7 dias</span>
                <span class="text-text-muted">Agenda</span>
              </div>
            </div>
          </div>

          <!-- Grid Principal (2 Colunas 60/40) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start">
            <!-- Left 60% -->
            <div class="lg:col-span-7 flex flex-col gap-space-base">
              <!-- Reuniões Agendadas -->
              <div class="bg-surface-container-lowest border border-border-subtle p-space-lg rounded-2xl shadow-xs flex flex-col gap-space-md">
                <div class="flex items-center justify-between pb-space-xs border-b border-border-subtle/80">
                  <div class="flex items-center gap-space-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-olive-primary"></span>
                    <h2 class="font-headline-sm text-[18px] text-on-surface font-semibold">Próximas Reuniões da Agenda</h2>
                  </div>
                  <a href="#/agenda" class="text-[13px] text-primary hover:text-olive-primary font-semibold flex items-center gap-1 transition-colors">
                    Ver agenda completa
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                  </a>
                </div>
                <div class="flex flex-col gap-space-sm" id="meetings-list">
                  <!-- Dynamic Meeting items -->
                </div>
              </div>
            </div>

            <!-- Right 40% -->
            <div class="lg:col-span-5 flex flex-col gap-space-base">
              <!-- Metas e Progresso -->
              <div class="bg-surface-container-lowest border border-border-subtle p-space-lg rounded-2xl shadow-xs flex flex-col gap-space-md">
                <div class="flex items-center justify-between pb-space-xs border-b border-border-subtle/80">
                  <div class="flex items-center gap-space-sm">
                    <span class="material-symbols-outlined text-olive-primary text-[20px]">flag</span>
                    <h2 class="font-headline-sm text-[18px] text-on-surface font-semibold">Metas Comerciais</h2>
                  </div>
                  <span class="text-[12px] text-text-muted font-medium">Ciclo Ativo</span>
                </div>
                <div class="flex flex-col gap-space-md">
                  <div class="flex flex-col gap-space-xs">
                    <div class="flex justify-between text-body-sm text-text-secondary">
                      <span class="font-semibold text-on-surface">Conversão de Leads</span>
                      <span class="font-bold text-olive-primary">82%</span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-olive-primary rounded-full" style="width: 82%;"></div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-space-xs">
                    <div class="flex justify-between text-body-sm text-text-secondary">
                      <span class="font-semibold text-on-surface">Projetos no Prazo</span>
                      <span class="font-bold text-emerald-700">92%</span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-600 rounded-full" style="width: 92%;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ações Rápidas -->
              <div class="bg-surface-container-low/70 border border-border-subtle p-space-md rounded-2xl flex flex-col gap-space-sm">
                <span class="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Atalhos do Sistema</span>
                <div class="grid grid-cols-2 gap-space-xs">
                  <a href="#/leads" class="flex items-center gap-2 p-2.5 bg-surface-container-lowest border border-border-subtle hover:border-slate-300 rounded-xl transition-all text-[12px] font-semibold text-on-surface shadow-xs">
                    <span class="material-symbols-outlined text-[18px] text-primary">person_add</span>
                    <span>Novo Lead</span>
                  </a>
                  <a href="#/orcamentos" class="flex items-center gap-2 p-2.5 bg-surface-container-lowest border border-border-subtle hover:border-slate-300 rounded-xl transition-all text-[12px] font-semibold text-on-surface shadow-xs">
                    <span class="material-symbols-outlined text-[18px] text-brass-accent">request_quote</span>
                    <span>Orçamentos</span>
                  </a>
                  <a href="#/projetos" class="flex items-center gap-2 p-2.5 bg-surface-container-lowest border border-border-subtle hover:border-slate-300 rounded-xl transition-all text-[12px] font-semibold text-on-surface shadow-xs">
                    <span class="material-symbols-outlined text-[18px] text-olive-primary">view_kanban</span>
                    <span>Projetos</span>
                  </a>
                  <a href="#/agenda" class="flex items-center gap-2 p-2.5 bg-surface-container-lowest border border-border-subtle hover:border-slate-300 rounded-xl transition-all text-[12px] font-semibold text-on-surface shadow-xs">
                    <span class="material-symbols-outlined text-[18px] text-tertiary">add_alarm</span>
                    <span>Nova Reunião</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  UI.attachGlobalListeners(container);

  // Carregar dados dinâmicos
  await loadDashboardData(container);
}

import { safeSupabaseQuery } from '../supabase-helper.js';

async function loadDashboardData(container) {
  try {
    const resLeads = await safeSupabaseQuery(
      supabase.from('leads').select('*', { count: 'exact', head: true }).neq('status', 'Convertido').neq('status', 'Perdido')
    );
    const resClientes = await safeSupabaseQuery(
      supabase.from('clientes').select('*', { count: 'exact', head: true })
    );
    const resProjetos = await safeSupabaseQuery(
      supabase.from('projetos').select('*', { count: 'exact', head: true }).neq('status', 'Entregue').neq('status', 'Cancelado')
    );
    const resReunioes = await safeSupabaseQuery(
      supabase.from('reunioes').select('*', { count: 'exact', head: true }).eq('status', 'Agendada')
    );
    const resListReunioes = await safeSupabaseQuery(
      supabase.from('reunioes').select('*').order('data', { ascending: true }).limit(5)
    );

    const kpiLeads = container.querySelector('#kpi-leads-count');
    const kpiClientes = container.querySelector('#kpi-clientes-count');
    const kpiProjetos = container.querySelector('#kpi-projetos-count');
    const kpiReunioes = container.querySelector('#kpi-reunioes-count');

    if (kpiLeads) kpiLeads.textContent = resLeads.count ?? 14;
    if (kpiClientes) kpiClientes.textContent = resClientes.count ?? 8;
    if (kpiProjetos) kpiProjetos.textContent = resProjetos.count ?? 6;
    if (kpiReunioes) kpiReunioes.textContent = resReunioes.count ?? 4;

    const meetingsContainer = container.querySelector('#meetings-list');
    const listReunioes = resListReunioes.data;
    const reunionesData = (listReunioes && listReunioes.length > 0) ? listReunioes : [
      { id: 'm1', titulo: 'Alinhamento de Escopo Web', data: new Date().toISOString().split('T')[0], hora: '14:30', participantes: ['Grupo Vanguarda'], status: 'Agendada' },
      { id: 'm2', titulo: 'Apresentação de Orçamento Final', data: new Date(Date.now() + 86400000).toISOString().split('T')[0], hora: '10:00', participantes: ['AgroTech Fertilizantes'], status: 'Agendada' },
      { id: 'm3', titulo: 'Kickoff de Redesign de Portais', data: new Date(Date.now() + 172800000).toISOString().split('T')[0], hora: '16:15', participantes: ['Rede Óticas Solaris'], status: 'Agendada' }
    ];

    if (meetingsContainer) {
      meetingsContainer.innerHTML = reunionesData.map(m => `
        <div class="p-space-md bg-surface-container-low/70 border border-border-subtle rounded-xl flex flex-col gap-space-xs relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-olive-primary"></div>
          <div class="flex items-center justify-between pl-space-xs">
            <span class="text-[12px] font-semibold text-olive-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">schedule</span> ${formatDate(m.data)} às ${m.hora || '14:00'}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-200 text-[11px] font-semibold">
              ${m.status}
            </span>
          </div>
          <div class="pl-space-xs flex flex-col mt-0.5">
            <h3 class="font-headline-sm text-[15px] font-semibold text-on-surface">${m.titulo}</h3>
            <p class="font-body-sm text-text-secondary text-[13px]">${Array.isArray(m.participantes) ? m.participantes.join(', ') : (m.participantes || 'Sem participantes')}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Usando valores de fallback para o dashboard:', err);
  }
}
