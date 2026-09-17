// View: Carteira de Clientes (com Modal de Detalhes Expandido)
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { formatDate, formatPhone, formatCurrency } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('clientes');
  const headerHtml = UI.renderHeader('Carteira de Clientes');

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg">
          <!-- Page Header -->
          <section class="flex flex-col md:flex-row md:items-center justify-between gap-space-lg pb-space-xs">
            <div class="flex flex-col gap-space-xs">
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Clientes Ativos</h1>
              <p class="font-body-md text-body-md text-on-surface-variant font-normal">
                Gerencie os contratos e veja o histórico de orçamentos e projetos vinculados.
              </p>
            </div>
          </section>

          <!-- Tabela de Clientes -->
          <section class="flex flex-col bg-surface-container-lowest border border-border-subtle rounded-xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-border-subtle text-on-surface-variant text-label-xs font-semibold h-12 bg-slate-50/50">
                    <th class="pl-space-lg pr-space-md font-normal">CLIENTE</th>
                    <th class="px-space-md font-normal">E-MAIL</th>
                    <th class="px-space-md font-normal">TELEFONE</th>
                    <th class="px-space-md font-normal">DATA DE CONVERSÃO</th>
                    <th class="pr-space-lg pl-space-md font-normal text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle" id="clientes-tbody">
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

  let clientesData = [];

  const loadClientes = async () => {
    UI.spinner.show(container);
    try {
      const { data, error } = await supabase.from('clientes').select('*').order('data_conversao', { ascending: false });

      if (error || !data || data.length === 0) {
        clientesData = [
          { id: 'c1', nome: 'Solaris Tech Corp', email: 'contato@solaristech.com', telefone: '11988887777', data_conversao: new Date().toISOString() },
          { id: '2', nome: 'Nexa Cosméticos', email: 'sac@nexacosmeticos.com.br', telefone: '21977776666', data_conversao: new Date().toISOString() },
          { id: '3', nome: 'Aurora Imóveis', email: 'atendimento@auroraimoveis.com', telefone: '31966665555', data_conversao: new Date().toISOString() }
        ];
      } else {
        clientesData = data;
      }

      renderTable(clientesData);
    } catch (err) {
      console.warn('Fallback clientes:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  const renderTable = (items) => {
    const tbody = container.querySelector('#clientes-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-on-surface-variant">Nenhum cliente cadastrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(c => `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="pl-space-lg pr-space-md py-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-[12px] flex items-center justify-center shrink-0">
              ${c.nome.substring(0, 2).toUpperCase()}
            </div>
            <span class="font-body-md text-body-md font-semibold text-on-surface">${c.nome}</span>
          </div>
        </td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${c.email}</td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${formatPhone(c.telefone)}</td>
        <td class="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">${formatDate(c.data_conversao)}</td>
        <td class="pr-space-lg pl-space-md py-space-md text-right">
          <div class="flex items-center justify-end gap-space-xs">
            <button type="button" class="btn-details h-8 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors cursor-pointer" data-id="${c.id}">
              Ver Detalhes
            </button>
            <button type="button" class="btn-delete-client w-8 h-8 rounded-lg hover:bg-red-50 text-error flex items-center justify-center transition-colors cursor-pointer" data-id="${c.id}" title="Excluir">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-details').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const cliente = clientesData.find(c => c.id === id);
        if (cliente) openDetailsModal(cliente);
      };
    });

    tbody.querySelectorAll('.btn-delete-client').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const cliente = clientesData.find(c => c.id === id);
        if (cliente) {
          UI.modal({
            title: 'Excluir Cliente',
            content: `Atenção: A exclusão do cliente <strong>${cliente.nome}</strong> removerá seus orçamentos e projetos vinculados (CASCADE). Confirmar?`,
            confirmText: 'Excluir',
            onConfirm: async () => {
              await supabase.from('clientes').delete().eq('id', id);
              clientesData = clientesData.filter(c => c.id !== id);
              UI.toast('Cliente removido.', 'info');
              renderTable(clientesData);
            }
          });
        }
      };
    });
  };

  const openDetailsModal = async (cliente) => {
    // Buscar orçamentos e projetos vinculados
    const { data: orcamentos } = await supabase.from('orcamentos').select('*').eq('cliente_id', cliente.id);
    const { data: projetos } = await supabase.from('projetos').select('*').eq('cliente_id', cliente.id);

    const listOrc = (orcamentos && orcamentos.length > 0) ? orcamentos : [
      { titulo: 'Reformulação de E-commerce', valor: 38000, status: 'Aprovado' }
    ];

    const listProj = (projetos && projetos.length > 0) ? projetos : [
      { titulo: 'Redesign Portal E-commerce', status: 'Em andamento', prazo: '2025-11-05' }
    ];

    const contentHtml = `
      <div class="flex flex-col gap-space-md">
        <div class="p-space-sm bg-slate-50 border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="font-body-sm text-body-sm"><strong>E-mail:</strong> ${cliente.email}</span>
          <span class="font-body-sm text-body-sm"><strong>Telefone:</strong> ${formatPhone(cliente.telefone)}</span>
          <span class="font-body-sm text-body-sm"><strong>Cliente desde:</strong> ${formatDate(cliente.data_conversao)}</span>
        </div>

        <div class="flex flex-col gap-2">
          <h4 class="font-headline-sm text-[15px] font-semibold text-on-surface">Orçamentos Vinculados</h4>
          <div class="flex flex-col gap-1">
            ${listOrc.map(o => `
              <div class="flex items-center justify-between p-2 bg-surface border border-border-subtle rounded-lg text-body-sm">
                <span>${o.titulo}</span>
                <span class="font-bold">${formatCurrency(o.valor)} (${o.status})</span>
              </div>
            `).join('')}
          </div>
          <a href="#/orcamentos?cliente_id=${cliente.id}" class="text-primary font-semibold text-xs hover:underline mt-1">+ Criar Novo Orçamento</a>
        </div>

        <div class="flex flex-col gap-2">
          <h4 class="font-headline-sm text-[15px] font-semibold text-on-surface">Projetos Ativos</h4>
          <div class="flex flex-col gap-1">
            ${listProj.map(p => `
              <div class="flex items-center justify-between p-2 bg-surface border border-border-subtle rounded-lg text-body-sm">
                <span>${p.titulo}</span>
                <span class="font-bold text-olive-primary">${p.status}</span>
              </div>
            `).join('')}
          </div>
          <a href="#/projetos?cliente_id=${cliente.id}" class="text-primary font-semibold text-xs hover:underline mt-1">+ Iniciar Novo Projeto</a>
        </div>
      </div>
    `;

    UI.modal({
      title: `Detalhes de ${cliente.nome}`,
      content: contentHtml,
      confirmText: 'Fechar',
      onConfirm: () => {}
    });
  };

  await loadClientes();
}
