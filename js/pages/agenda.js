// View: Agenda & Reuniões
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatDate, formatTime } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('agenda');
  const headerHtml = UI.renderHeader('Agenda de Reuniões');

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg">
          <!-- Header -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Agenda & Compromissos</h1>
              <p class="font-body-md text-body-md text-on-surface-variant font-normal">
                Agende e acompanhe as reuniões comerciais e alinhamentos de escopo.
              </p>
            </div>
            <button type="button" id="btn-nova-reuniao" class="flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold shadow-xs transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Agendar Reunião</span>
            </button>
          </section>

          <!-- Tabela Reuniões -->
          <section class="flex flex-col bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border-subtle text-on-surface-variant text-label-xs font-semibold h-12 bg-slate-50/50">
                    <th class="pl-space-lg pr-space-md font-normal">ASSUNTO / REUNIÃO</th>
                    <th class="px-space-md font-normal">DATA & HORA</th>
                    <th class="px-space-md font-normal">PARTICIPANTES</th>
                    <th class="px-space-md font-normal">STATUS</th>
                    <th class="pr-space-lg pl-space-md font-normal text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle" id="reunioes-tbody">
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

  let reunioesData = [];

  const loadReunioes = async () => {
    UI.spinner.show(container);
    try {
      const { data, error } = await supabase.from('reunioes').select('*').order('data', { ascending: true });

      if (error || !data || data.length === 0) {
        reunioesData = [
          { id: 'r1', titulo: 'Alinhamento de Escopo & Arquitetura Web', data: new Date().toISOString().split('T')[0], hora: '14:30', participantes: ['Grupo Vanguarda', 'Lucas M.'], status: 'Agendada' },
          { id: 'r2', titulo: 'Apresentação de Orçamento Final', data: new Date(Date.now() + 86400000).toISOString().split('T')[0], hora: '10:00', participantes: ['AgroTech Fertilizantes', 'Mariana C.'], status: 'Agendada' },
          { id: 'r3', titulo: 'Kickoff de Redesign de Portais', data: new Date(Date.now() + 172800000).toISOString().split('T')[0], hora: '16:15', participantes: ['Rede Óticas Solaris'], status: 'Agendada' }
        ];
      } else {
        reunioesData = data;
      }

      renderTable(reunioesData);
    } catch (err) {
      console.warn('Fallback reunioes:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  const renderTable = (items) => {
    const tbody = container.querySelector('#reunioes-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-on-surface-variant">Nenhuma reunião agendada.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(r => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="pl-space-lg pr-space-md py-space-md font-body-md font-semibold text-on-surface">${r.titulo}</td>
        <td class="px-space-md py-space-md font-body-sm text-on-surface-variant">${formatDate(r.data)} às ${r.hora || '14:00'}</td>
        <td class="px-space-md py-space-md font-body-sm text-on-surface-variant">${Array.isArray(r.participantes) ? r.participantes.join(', ') : (r.participantes || '—')}</td>
        <td class="px-space-md py-space-md">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.status === 'Realizada' ? 'bg-emerald-100 text-emerald-800' : 'bg-lime-100 text-lime-900'}">
            ${r.status}
          </span>
        </td>
        <td class="pr-space-lg pl-space-md py-space-md text-right">
          <div class="flex items-center justify-end gap-space-xs">
            ${r.status !== 'Realizada' ? `
              <button type="button" class="btn-done-reuniao h-8 px-space-md rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-body-sm text-body-sm font-semibold transition-colors cursor-pointer" data-id="${r.id}">
                Concluir
              </button>
            ` : ''}
            <button type="button" class="btn-delete-reuniao w-8 h-8 rounded-lg hover:bg-red-50 text-error flex items-center justify-center transition-colors cursor-pointer" data-id="${r.id}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-done-reuniao').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await supabase.from('reunioes').update({ status: 'Realizada' }).eq('id', id);
        const item = reunioesData.find(r => r.id === id);
        if (item) item.status = 'Realizada';
        UI.toast('Reunião concluída!', 'success');
        renderTable(reunioesData);
      };
    });

    tbody.querySelectorAll('.btn-delete-reuniao').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        UI.modal({
          title: 'Excluir Reunião',
          content: 'Deseja remover esta reunião da agenda?',
          confirmText: 'Excluir',
          onConfirm: async () => {
            await supabase.from('reunioes').delete().eq('id', id);
            reunioesData = reunioesData.filter(r => r.id !== id);
            UI.toast('Reunião removida.', 'info');
            renderTable(reunioesData);
          }
        });
      };
    });
  };

  const openFormModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const formEl = document.createElement('form');
    formEl.className = 'flex flex-col gap-space-md';
    formEl.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Assunto / Título *</label>
        <input type="text" id="reu-titulo" required placeholder="ex: Alinhamento de Protótipo B2B" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
      </div>

      <div class="grid grid-cols-2 gap-space-sm">
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Data *</label>
          <input type="date" id="reu-data" required min="${today}" value="${today}" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Horário *</label>
          <input type="time" id="reu-hora" required value="14:00" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Participantes (separar por vírgula)</label>
        <input type="text" id="reu-part" placeholder="Carlos, Gabriel, Mariana" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Pauta</label>
        <textarea id="reu-pauta" rows="3" placeholder="Pontos a serem discutidos..." class="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm resize-none"></textarea>
      </div>
    `;

    UI.modal({
      title: 'Agendar Nova Reunião',
      content: formEl,
      confirmText: 'Agendar',
      onConfirm: async () => {
        const titulo = formEl.querySelector('#reu-titulo').value.trim();
        const dataVal = formEl.querySelector('#reu-data').value;
        const hora = formEl.querySelector('#reu-hora').value;
        const partStr = formEl.querySelector('#reu-part').value.trim();
        const pauta = formEl.querySelector('#reu-pauta').value.trim();

        if (dataVal < today) {
          UI.toast('Não é permitido agendar reuniões em datas passadas.', 'warning');
          return;
        }

        if (!titulo || !dataVal || !hora) {
          UI.toast('Preencha os campos obrigatórios.', 'warning');
          return;
        }

        const participantes = partStr ? partStr.split(',').map(s => s.trim()) : [];
        const payload = { titulo, data: dataVal, hora, participantes, pauta, status: 'Agendada' };

        const { data } = await supabase.from('reunioes').insert(payload).select();
        const newObj = data?.[0] || { id: String(Date.now()), ...payload };
        reunioesData.push(newObj);
        UI.toast('Reunião agendada com sucesso!', 'success');
        renderTable(reunioesData);
      }
    });
  };

  container.querySelector('#btn-nova-reuniao').onclick = openFormModal;

  await loadReunioes();
}
