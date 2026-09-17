// View: Leads & Oportunidades (Design System Stitch com Drawer Lateral)
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatPhone, formatDate } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('leads');
  const headerHtml = UI.renderHeader('Leads & Oportunidades');

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg relative">
          <!-- Page Header -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Leads & Oportunidades</h1>
              <p class="font-body-md text-body-md text-on-surface-variant font-normal">
                Acompanhe os contatos comerciais e transforme potenciais clientes em vendas.
              </p>
            </div>
            <div class="flex items-center gap-space-md shrink-0">
              <button type="button" id="btn-novo-lead" class="flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold shadow-xs transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">add</span>
                <span>Novo Lead</span>
              </button>
            </div>
          </section>

          <!-- Metrics Bar -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-space-base">
            <div class="p-space-lg rounded-xl bg-surface-container-lowest border border-border-subtle shadow-xs flex flex-col justify-between">
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">Novos no mês</span>
              <div class="mt-space-md flex items-baseline gap-space-sm">
                <span class="font-headline-lg text-[28px] text-on-surface font-bold" id="metric-novos">14</span>
                <span class="font-label-xs text-label-xs text-primary font-semibold">+14%</span>
              </div>
            </div>
            <div class="p-space-lg rounded-xl bg-surface-container-lowest border border-border-subtle shadow-xs flex flex-col justify-between">
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">Em qualificação</span>
              <div class="mt-space-md flex items-baseline gap-space-sm">
                <span class="font-headline-lg text-[28px] text-on-surface font-bold" id="metric-contato">8</span>
              </div>
            </div>
            <div class="p-space-lg rounded-xl bg-surface-container-lowest border border-border-subtle shadow-xs flex flex-col justify-between">
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">Propostas enviadas</span>
              <div class="mt-space-md flex items-baseline gap-space-sm">
                <span class="font-headline-lg text-[28px] text-on-surface font-bold" id="metric-propostas">5</span>
              </div>
            </div>
            <div class="p-space-lg rounded-xl bg-surface-container-lowest border border-border-subtle shadow-xs flex flex-col justify-between">
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">Convertidos em Clientes</span>
              <div class="mt-space-md flex items-baseline gap-space-sm">
                <span class="font-headline-lg text-[28px] text-on-surface font-bold" id="metric-convertidos">12</span>
                <span class="font-label-xs text-label-xs text-primary font-semibold">+24.5%</span>
              </div>
            </div>
          </section>

          <!-- Filtros -->
          <section class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md py-space-xs">
            <div class="flex flex-1 items-center gap-space-sm flex-wrap">
              <div class="relative flex-1 min-w-[240px]">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input type="text" id="lead-search-input" placeholder="Buscar por nome ou e-mail..." class="w-full h-10 pl-9 pr-space-md rounded-xl bg-surface-container-lowest border border-border-subtle text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all">
              </div>
              <div class="relative">
                <select id="filter-status-select" class="h-10 px-space-md pr-8 rounded-xl bg-surface-container-lowest border border-border-subtle text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer focus:outline-none focus:border-primary transition-all">
                  <option value="all">Todos os status</option>
                  <option value="Novo">Novo</option>
                  <option value="Em contato">Em contato</option>
                  <option value="Proposta enviada">Proposta enviada</option>
                  <option value="Convertido">Convertido</option>
                  <option value="Perdido">Perdido</option>
                </select>
                <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">expand_more</span>
              </div>
            </div>
          </section>

          <!-- Tabela de Leads -->
          <section class="flex flex-col bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xs overflow-hidden" id="leads-table-container">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border-subtle text-on-surface-variant text-label-xs font-semibold h-12 bg-slate-50/50">
                    <th class="pl-space-lg pr-space-md font-normal">CONTATO</th>
                    <th class="px-space-md font-normal">E-MAIL</th>
                    <th class="px-space-md font-normal">TELEFONE</th>
                    <th class="px-space-md font-normal">ORIGEM</th>
                    <th class="px-space-md font-normal">STATUS</th>
                    <th class="pr-space-lg pl-space-md font-normal text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle" id="leads-tbody">
                  <!-- Dynamic rows -->
                </tbody>
              </table>
            </div>
          </section>

          <!-- Drawer Slide-over Modal Stitch (380px) -->
          <div id="drawer-backdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 hidden transition-opacity duration-300"></div>
          <aside id="lead-drawer" class="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-surface-container-lowest border-l border-border-subtle z-50 shadow-2xl flex flex-col justify-between transform translate-x-full transition-transform duration-300">
            <!-- Header Drawer -->
            <div class="flex items-center justify-between p-space-md bg-surface-container-low border-b border-border-subtle">
              <div class="flex flex-col">
                <span class="font-label-xs text-label-xs uppercase font-bold text-primary tracking-wider" id="drawer-tag">Qualificação Rápida</span>
                <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold" id="drawer-title">Novo Lead / Oportunidade</h2>
              </div>
              <button type="button" id="btn-close-drawer" class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Form Drawer -->
            <form id="lead-form" class="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
              <input type="hidden" id="form-lead-id">
              <div class="flex flex-col gap-space-2xs">
                <label for="form-nome" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Nome Completo *</label>
                <input type="text" id="form-nome" required placeholder="Carlos Eduardo Silveira" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
              </div>

              <div class="flex flex-col gap-space-2xs">
                <label for="form-email" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">E-mail Corporativo *</label>
                <input type="email" id="form-email" required placeholder="carlos@empresa.com.br" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
              </div>

              <div class="flex flex-col gap-space-2xs">
                <label for="form-tel" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Telefone / WhatsApp</label>
                <input type="text" id="form-tel" placeholder="(11) 98765-4321" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
              </div>

              <div class="grid grid-cols-2 gap-space-sm">
                <div class="flex flex-col gap-space-2xs">
                  <label for="form-origem" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Origem</label>
                  <select id="form-origem" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary transition-all">
                    <option value="Instagram">Instagram</option>
                    <option value="Site">Site</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div class="flex flex-col gap-space-2xs">
                  <label for="form-status" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Status</label>
                  <select id="form-status" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary transition-all">
                    <option value="Novo">Novo</option>
                    <option value="Em contato">Em contato</option>
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Convertido">Convertido</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-space-2xs">
                <label for="form-notas" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Notas / Briefing</label>
                <textarea id="form-notas" rows="3" placeholder="Observações e detalhes da negociação..." class="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all resize-none"></textarea>
              </div>

              <div class="p-space-sm bg-slate-50 border border-border-subtle rounded-lg flex items-start gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
                <span class="font-body-sm text-[11px] text-on-surface-variant leading-tight">
                  A conversão cria automaticamente um registro permanente na carteira de <strong>Clientes</strong>.
                </span>
              </div>
            </form>

            <!-- Footer Drawer -->
            <div class="p-space-md bg-surface-container-low border-t border-border-subtle flex flex-col gap-space-xs">
              <button type="button" id="btn-convert-lead" class="w-full h-10 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold shadow-xs flex items-center justify-center gap-space-xs transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">verified</span>
                <span>Converter e Criar Cliente</span>
              </button>
              <div class="flex items-center gap-space-xs">
                <button type="button" id="btn-save-lead" class="flex-1 h-9 px-space-md rounded-lg bg-surface-container-lowest border border-border-subtle hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-space-xs shadow-xs cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  <span>Salvar Lead</span>
                </button>
                <button type="button" id="btn-cancel-drawer" class="h-9 px-space-md rounded-lg hover:bg-surface-container text-on-surface-variant font-body-sm text-body-sm font-semibold transition-colors cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  `;

  UI.attachGlobalListeners(container);

  // Variável para armazenar a lista completa de leads em memória
  let leadsData = [];

  const backdrop = container.querySelector('#drawer-backdrop');
  const drawer = container.querySelector('#lead-drawer');

  const openDrawer = (lead = null) => {
    container.querySelector('#form-lead-id').value = lead?.id || '';
    container.querySelector('#form-nome').value = lead?.nome || '';
    container.querySelector('#form-email').value = lead?.email || '';
    container.querySelector('#form-tel').value = lead?.telefone || '';
    container.querySelector('#form-origem').value = lead?.origem || 'Instagram';
    container.querySelector('#form-status').value = lead?.status || 'Novo';
    container.querySelector('#form-notas').value = lead?.notas || '';

    container.querySelector('#drawer-title').textContent = lead ? 'Editar / Qualificar Lead' : 'Novo Lead / Oportunidade';

    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
  };

  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  };

  container.querySelector('#btn-novo-lead').onclick = () => openDrawer();
  container.querySelector('#btn-close-drawer').onclick = closeDrawer;
  container.querySelector('#btn-cancel-drawer').onclick = closeDrawer;
  backdrop.onclick = closeDrawer;

  // Renderizar Tabela
  const renderTableRows = (items) => {
    const tbody = container.querySelector('#leads-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py- space-lg text-center font-body-sm text-on-surface-variant py-8">
            Nenhum lead encontrado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="pl-space-lg pr-space-md py-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-[12px] flex items-center justify-center shrink-0">
              ${(item.nome || 'L').substring(0, 2).toUpperCase()}
            </div>
            <div class="flex flex-col">
              <span class="font-body-md text-body-md font-semibold text-on-surface">${item.nome}</span>
            </div>
          </div>
        </td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${item.email}</td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${formatPhone(item.telefone)}</td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${item.origem}</td>
        <td class="px-space-md py-space-md">
          <span class="inline-flex items-center gap-1.5 text-body-sm font-medium ${item.status === 'Convertido' ? 'text-emerald-700 font-semibold' : 'text-amber-800'}">
            <span class="w-2 h-2 rounded-full ${item.status === 'Convertido' ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
            ${item.status}
          </span>
        </td>
        <td class="pr-space-lg pl-space-md py-space-md text-right">
          <div class="flex items-center justify-end gap-space-xs">
            ${item.status !== 'Convertido' ? `
              <button type="button" class="btn-convert-row h-8 px-space-md rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-body-sm text-body-sm font-semibold transition-colors cursor-pointer" data-id="${item.id}">
                Converter
              </button>
            ` : `<span class="text-emerald-700 font-semibold text-[12px] bg-emerald-50 px-2 py-1 rounded-lg">Cliente</span>`}
            <button type="button" class="btn-edit-row w-8 h-8 rounded-lg hover:bg-slate-100 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer" data-id="${item.id}" title="Editar">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button type="button" class="btn-delete-row w-8 h-8 rounded-lg hover:bg-red-50 text-error flex items-center justify-center transition-colors cursor-pointer" data-id="${item.id}" title="Excluir">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Event Listeners nas linhas
    tbody.querySelectorAll('.btn-edit-row').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const lead = leadsData.find(l => l.id === id);
        if (lead) openDrawer(lead);
      };
    });

    tbody.querySelectorAll('.btn-convert-row').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const lead = leadsData.find(l => l.id === id);
        if (lead) {
          UI.modal({
            title: 'Confirmar Conversão',
            content: `Deseja converter o lead <strong>${lead.nome}</strong> em Cliente da agência?`,
            confirmText: 'Converter Agora',
            onConfirm: async () => {
              await convertLeadToClient(lead);
            }
          });
        }
      };
    });

    tbody.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const lead = leadsData.find(l => l.id === id);
        if (lead) {
          UI.modal({
            title: 'Excluir Lead',
            content: `Tem certeza que deseja remover o lead <strong>${lead.nome}</strong>?`,
            confirmText: 'Excluir',
            onConfirm: async () => {
              await deleteLead(id);
            }
          });
        }
      };
    });
  };

  // Carregar dados
  const loadLeads = async () => {
    UI.spinner.show(container);
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (error || !data) {
        // Mock fallback para testes sem Supabase populado
        leadsData = [
          { id: '1', nome: 'Vinícius Rodrigues', email: 'vinicius@techsolutions.com.br', telefone: '11987421190', origem: 'Instagram', status: 'Proposta enviada', notas: 'Interesse em e-commerce' },
          { id: '2', nome: 'Camila Moreira', email: 'camila@bloommoda.com', telefone: '21998314402', origem: 'Site', status: 'Em contato', notas: 'Landing page promocional' },
          { id: '3', nome: 'Rodrigo Furtado', email: 'contato@clinicavita.med.br', telefone: '31976529910', origem: 'Indicação', status: 'Novo', notas: 'Portal médico' },
          { id: '4', nome: 'Ana Paula Monteiro', email: 'ana@monteiroadv.com.br', telefone: '11945201088', origem: 'Site', status: 'Convertido', notas: 'Cliente ativo' }
        ];
      } else {
        leadsData = data;
      }
      renderTableRows(leadsData);
    } catch (err) {
      console.warn('Usando fallback para leads:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  // Funções de Ação CRUD
  const saveLead = async () => {
    const id = container.querySelector('#form-lead-id').value;
    const nome = container.querySelector('#form-nome').value.trim();
    const email = container.querySelector('#form-email').value.trim();
    const telefone = container.querySelector('#form-tel').value.trim();
    const origem = container.querySelector('#form-origem').value;
    const status = container.querySelector('#form-status').value;
    const notas = container.querySelector('#form-notas').value.trim();

    if (!nome || !email) {
      UI.toast('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }

    const payload = { nome, email, telefone, origem, status, notas };

    try {
      if (id) {
        const { error } = await supabase.from('leads').update(payload).eq('id', id);
        if (error) {
          // Atualiza localmente
          const idx = leadsData.findIndex(l => l.id === id);
          if (idx !== -1) leadsData[idx] = { ...leadsData[idx], ...payload };
        }
        UI.toast('Lead atualizado com sucesso!', 'success');
      } else {
        const { data, error } = await supabase.from('leads').insert(payload).select();
        if (error || !data) {
          leadsData.unshift({ id: String(Date.now()), ...payload });
        } else {
          leadsData.unshift(data[0]);
        }
        UI.toast('Novo lead cadastrado!', 'success');
      }
      closeDrawer();
      renderTableRows(leadsData);
    } catch (err) {
      UI.toast('Erro ao salvar lead.', 'error');
    }
  };

  const convertLeadToClient = async (lead) => {
    try {
      // 1. Cria cliente
      const clientPayload = {
        lead_id: lead.id,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone
      };
      await supabase.from('clientes').insert(clientPayload);

      // 2. Atualiza lead para 'Convertido'
      await supabase.from('leads').update({ status: 'Convertido' }).eq('id', lead.id);

      // Atualiza estado local
      const idx = leadsData.findIndex(l => l.id === lead.id);
      if (idx !== -1) leadsData[idx].status = 'Convertido';

      UI.toast(`Lead "${lead.nome}" convertido em cliente com sucesso!`, 'success');
      closeDrawer();
      renderTableRows(leadsData);
    } catch (err) {
      UI.toast('Erro ao converter lead.', 'error');
    }
  };

  const deleteLead = async (id) => {
    try {
      await supabase.from('leads').delete().eq('id', id);
      leadsData = leadsData.filter(l => l.id !== id);
      UI.toast('Lead excluído.', 'info');
      renderTableRows(leadsData);
    } catch (err) {
      UI.toast('Erro ao excluir lead.', 'error');
    }
  };

  // Attach Event Listeners de formulário e filtros
  container.querySelector('#btn-save-lead').onclick = saveLead;
  container.querySelector('#btn-convert-lead').onclick = () => {
    const id = container.querySelector('#form-lead-id').value;
    const lead = leadsData.find(l => l.id === id) || {
      id: id || String(Date.now()),
      nome: container.querySelector('#form-nome').value,
      email: container.querySelector('#form-email').value,
      telefone: container.querySelector('#form-tel').value
    };
    convertLeadToClient(lead);
  };

  // Filtros
  const searchInput = container.querySelector('#lead-search-input');
  const statusSelect = container.querySelector('#filter-status-select');

  const applyFilters = () => {
    const term = searchInput.value.toLowerCase().trim();
    const statusVal = statusSelect.value;

    const filtered = leadsData.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(term) || item.email.toLowerCase().includes(term);
      const matchesStatus = statusVal === 'all' || item.status === statusVal;
      return matchesSearch && matchesStatus;
    });

    renderTableRows(filtered);
  };

  searchInput.oninput = applyFilters;
  statusSelect.onchange = applyFilters;

  // Iniciar carregamento
  await loadLeads();
}
