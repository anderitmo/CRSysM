// View: Orçamentos (Propostas Comerciais com R$)
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatCurrency, getQueryParams } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('orcamentos');
  const headerHtml = UI.renderHeader('Orçamentos & Propostas');
  const queryParams = getQueryParams();

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg">
          <!-- Header -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Propostas Orçamentárias</h1>
              <p class="font-body-md text-body-md text-on-surface-variant font-normal">
                Elabore e acompanhe propostas de serviços vinculadas aos seus clientes.
              </p>
            </div>
            <button type="button" id="btn-novo-orcamento" class="flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold shadow-xs transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Novo Orçamento</span>
            </button>
          </section>

          <!-- Tabela -->
          <section class="flex flex-col bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border-subtle text-on-surface-variant text-label-xs font-semibold h-12 bg-slate-50/50">
                    <th class="pl-space-lg pr-space-md font-normal">TÍTULO DA PROPOSTA</th>
                    <th class="px-space-md font-normal">CLIENTE</th>
                    <th class="px-space-md font-normal">VALOR (R$)</th>
                    <th class="px-space-md font-normal">STATUS</th>
                    <th class="pr-space-lg pl-space-md font-normal text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle" id="orcamentos-tbody">
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

  let orcamentosData = [];
  let clientesOptions = [];

  const loadData = async () => {
    UI.spinner.show(container);
    try {
      // Carregar clientes para o select
      const { data: clientesData } = await supabase.from('clientes').select('id, nome');
      clientesOptions = clientesData || [
        { id: 'c1', nome: 'Solaris Tech Corp' },
        { id: '2', nome: 'Nexa Cosméticos' },
        { id: '3', nome: 'Aurora Imóveis' }
      ];

      // Carregar orçamentos com JOIN clientes
      const { data, error } = await supabase.from('orcamentos').select('*, clientes(nome)').order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        orcamentosData = [
          { id: 'o1', titulo: 'Reformulação E-commerce Headless', cliente_id: 'c1', clientes: { nome: 'Solaris Tech Corp' }, valor: 38000, status: 'Pendente' },
          { id: 'o2', titulo: 'Landing Page de Performance', cliente_id: '2', clientes: { nome: 'Nexa Cosméticos' }, valor: 16500, status: 'Aprovado' },
          { id: 'o3', titulo: 'Portal Corporativo SEO', cliente_id: '3', clientes: { nome: 'Aurora Imóveis' }, valor: 24000, status: 'Negociando' }
        ];
      } else {
        orcamentosData = data;
      }

      renderTable(orcamentosData);

      // Se veio cliente_id via query string (?cliente_id=xxx), abre o form
      if (queryParams.cliente_id) {
        openFormModal({ cliente_id: queryParams.cliente_id });
      }
    } catch (err) {
      console.warn('Fallback orcamentos:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  const renderTable = (items) => {
    const tbody = container.querySelector('#orcamentos-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-on-surface-variant">Nenhum orçamento encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(o => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="pl-space-lg pr-space-md py-space-md font-body-md font-semibold text-on-surface">${o.titulo}</td>
        <td class="px-space-md py-space-md font-body-sm text-on-surface-variant">${o.clientes?.nome || '—'}</td>
        <td class="px-space-md py-space-md font-body-sm font-semibold text-on-surface">${formatCurrency(o.valor)}</td>
        <td class="px-space-md py-space-md">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${o.status}
          </span>
        </td>
        <td class="pr-space-lg pl-space-md py-space-md text-right">
          <div class="flex items-center justify-end gap-space-xs">
            <button type="button" class="btn-edit-orc w-8 h-8 rounded-lg hover:bg-slate-100 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer" data-id="${o.id}">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button type="button" class="btn-delete-orc w-8 h-8 rounded-lg hover:bg-red-50 text-error flex items-center justify-center transition-colors cursor-pointer" data-id="${o.id}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit-orc').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const item = orcamentosData.find(o => o.id === id);
        if (item) openFormModal(item);
      };
    });

    tbody.querySelectorAll('.btn-delete-orc').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        UI.modal({
          title: 'Excluir Orçamento',
          content: 'Deseja remover esta proposta comercial?',
          confirmText: 'Excluir',
          onConfirm: async () => {
            await supabase.from('orcamentos').delete().eq('id', id);
            orcamentosData = orcamentosData.filter(o => o.id !== id);
            UI.toast('Orçamento removido.', 'info');
            renderTable(orcamentosData);
          }
        });
      };
    });
  };

  const openFormModal = (item = null) => {
    const formEl = document.createElement('form');
    formEl.className = 'flex flex-col gap-space-md';
    formEl.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Título do Orçamento *</label>
        <input type="text" id="orc-titulo" required value="${item?.titulo || ''}" placeholder="ex: Redesign e Integração Pix" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Cliente *</label>
        <select id="orc-cliente" required class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
          ${clientesOptions.map(c => `
            <option value="${c.id}" ${item?.cliente_id === c.id ? 'selected' : ''}>${c.nome}</option>
          `).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-space-sm">
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Valor Estimado (R$) *</label>
          <input type="number" step="0.01" id="orc-valor" required value="${item?.valor || ''}" placeholder="15000.00" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Status</label>
          <select id="orc-status" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
            <option value="Pendente" ${item?.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            <option value="Aprovado" ${item?.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
            <option value="Recusado" ${item?.status === 'Recusado' ? 'selected' : ''}>Recusado</option>
            <option value="Negociando" ${item?.status === 'Negociando' ? 'selected' : ''}>Negociando</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Descrição / Escopo</label>
        <textarea id="orc-desc" rows="3" placeholder="Detalhamento das entregas..." class="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm resize-none">${item?.descricao || ''}</textarea>
      </div>
    `;

    UI.modal({
      title: item?.id ? 'Editar Orçamento' : 'Novo Orçamento',
      content: formEl,
      confirmText: 'Salvar Orçamento',
      onConfirm: async () => {
        const titulo = formEl.querySelector('#orc-titulo').value.trim();
        const cliente_id = formEl.querySelector('#orc-cliente').value;
        const valor = parseFloat(formEl.querySelector('#orc-valor').value) || 0;
        const status = formEl.querySelector('#orc-status').value;
        const descricao = formEl.querySelector('#orc-desc').value.trim();

        if (!titulo || !cliente_id) {
          UI.toast('Preencha os campos obrigatórios.', 'warning');
          return;
        }

        const payload = { titulo, cliente_id, valor, status, descricao };
        const clienteObj = clientesOptions.find(c => c.id === cliente_id);

        if (item?.id) {
          await supabase.from('orcamentos').update(payload).eq('id', item.id);
          const idx = orcamentosData.findIndex(o => o.id === item.id);
          if (idx !== -1) orcamentosData[idx] = { ...orcamentosData[idx], ...payload, clientes: clienteObj };
          UI.toast('Orçamento atualizado!', 'success');
        } else {
          const { data } = await supabase.from('orcamentos').insert(payload).select();
          const newObj = data?.[0] || { id: String(Date.now()), ...payload, clientes: clienteObj };
          orcamentosData.unshift(newObj);
          UI.toast('Orçamento criado com sucesso!', 'success');
        }
        renderTable(orcamentosData);
      }
    });
  };

  container.querySelector('#btn-novo-orcamento').onclick = () => openFormModal();

  await loadData();
}
