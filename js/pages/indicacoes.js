// View: Indicações & Comissões
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatCurrency } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('indicacoes');
  const headerHtml = UI.renderHeader('Programa de Indicações');

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg">
          <!-- Header -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Programa de Indicações</h1>
              <p class="font-body-md text-body-md text-on-surface-variant font-normal">
                Registre parceiros indicadores e controle as comissões devidas.
              </p>
            </div>
            <button type="button" id="btn-nova-indicacao" class="flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold shadow-xs transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Nova Indicação</span>
            </button>
          </section>

          <!-- Tabela Indicações -->
          <section class="flex flex-col bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border-subtle text-on-surface-variant text-label-xs font-semibold h-12 bg-slate-50/50">
                    <th class="pl-space-lg pr-space-md font-normal">INDICADOR (PARCEIRO)</th>
                    <th class="px-space-md font-normal">LEAD INDICADO</th>
                    <th class="px-space-md font-normal">COMISSÃO (R$)</th>
                    <th class="px-space-md font-normal">STATUS</th>
                    <th class="pr-space-lg pl-space-md font-normal text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle" id="indicacoes-tbody">
                  <!-- Dynamic Rows -->
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  `;

  UI.attachGlobalListeners(container);

  let indicacoesData = [];
  let leadsOptions = [];

  const loadData = async () => {
    UI.spinner.show(container);
    try {
      const { data: leadsData } = await supabase.from('leads').select('id, nome');
      leadsOptions = leadsData || [
        { id: '1', nome: 'Vinícius Rodrigues' },
        { id: '2', nome: 'Camila Moreira' },
        { id: '3', nome: 'Rodrigo Furtado' }
      ];

      const { data, error } = await supabase.from('indicacoes').select('*, leads(nome)').order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        indicacoesData = [
          { id: 'i1', indicador: 'Lucas Martins (Diretor)', lead_id: '1', leads: { nome: 'Vinícius Rodrigues' }, comissao: 1200, status: 'Pendente' },
          { id: 'i2', indicador: 'Agência Partner SP', lead_id: '3', leads: { nome: 'Rodrigo Furtado' }, comissao: 850, status: 'Paga' }
        ];
      } else {
        indicacoesData = data;
      }

      renderTable(indicacoesData);
    } catch (err) {
      console.warn('Fallback indicacoes:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  const renderTable = (items) => {
    const tbody = container.querySelector('#indicacoes-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-on-surface-variant">Nenhuma indicação cadastrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(ind => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="pl-space-lg pr-space-md py-space-md font-body-md font-semibold text-on-surface">${ind.indicador}</td>
        <td class="px-space-md py-space-md font-body-sm text-on-surface-variant">${ind.leads?.nome || '—'}</td>
        <td class="px-space-md py-space-md font-body-sm font-semibold text-on-surface">${formatCurrency(ind.comissao)}</td>
        <td class="px-space-md py-space-md">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ind.status === 'Paga' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${ind.status}
          </span>
        </td>
        <td class="pr-space-lg pl-space-md py-space-md text-right">
          <div class="flex items-center justify-end gap-space-xs">
            <button type="button" class="btn-delete-ind w-8 h-8 rounded-lg hover:bg-red-50 text-error flex items-center justify-center transition-colors cursor-pointer" data-id="${ind.id}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete-ind').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        UI.modal({
          title: 'Excluir Indicação',
          content: 'Deseja remover este registro de indicação?',
          confirmText: 'Excluir',
          onConfirm: async () => {
            await supabase.from('indicacoes').delete().eq('id', id);
            indicacoesData = indicacoesData.filter(i => i.id !== id);
            UI.toast('Indicação removida.', 'info');
            renderTable(indicacoesData);
          }
        });
      };
    });
  };

  const openFormModal = () => {
    const formEl = document.createElement('form');
    formEl.className = 'flex flex-col gap-space-md';
    formEl.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Indicador (Nome / Parceiro) *</label>
        <input type="text" id="ind-indicador" required placeholder="ex: Gabriel Santos" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Lead Gerado</label>
        <select id="ind-lead" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
          <option value="">Nenhum / Selecionar depois</option>
          ${leadsOptions.map(l => `<option value="${l.id}">${l.nome}</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-space-sm">
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Comissão (R$)</label>
          <input type="number" step="0.01" id="ind-comissao" placeholder="500.00" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Status</label>
          <select id="ind-status" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
            <option value="Pendente">Pendente</option>
            <option value="Paga">Paga</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>
    `;

    UI.modal({
      title: 'Nova Indicação',
      content: formEl,
      confirmText: 'Salvar Indicação',
      onConfirm: async () => {
        const indicador = formEl.querySelector('#ind-indicador').value.trim();
        const lead_id = formEl.querySelector('#ind-lead').value || null;
        const comissao = parseFloat(formEl.querySelector('#ind-comissao').value) || 0;
        const status = formEl.querySelector('#ind-status').value;

        if (!indicador) {
          UI.toast('Informe o nome do indicador.', 'warning');
          return;
        }

        const leadObj = leadsOptions.find(l => l.id === lead_id);
        const payload = { indicador, lead_id, comissao, status };

        const { data } = await supabase.from('indicacoes').insert(payload).select();
        const newObj = data?.[0] || { id: String(Date.now()), ...payload, leads: leadObj };
        indicacoesData.unshift(newObj);
        UI.toast('Indicação registrada com sucesso!', 'success');
        renderTable(indicacoesData);
      }
    });
  };

  container.querySelector('#btn-nova-indicacao').onclick = openFormModal;

  await loadData();
}
