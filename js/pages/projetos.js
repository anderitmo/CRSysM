// View: Quadro Kanban de Projetos (Baseado na interface Stitch)
import { UI } from '../ui.js';
import { supabase } from '../supabase-client.js';
import { safeSupabaseQuery } from '../supabase-helper.js';
import { formatDate, getQueryParams } from '../utils.js';

export async function render(container) {
  const sidebarHtml = UI.renderSidebar('projetos');
  const headerHtml = UI.renderHeader('Projetos');
  const queryParams = getQueryParams();

  container.innerHTML = `
    ${sidebarHtml}
    <div class="md:pl-layout-sidebar min-h-screen bg-background">
      ${headerHtml}
      <main class="w-full pt-20 px-space-md md:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-space-lg">
          <!-- Top Context Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md py-space-xs">
            <div>
              <h1 class="font-headline-lg text-[26px] text-on-surface font-bold tracking-tight">Quadro Kanban de Projetos</h1>
              <p class="font-body-md text-text-secondary text-[14px] mt-space-2xs">Acompanhe as entregas e etapas em andamento de forma simples e visual.</p>
            </div>
            <div class="flex items-center gap-space-sm">
              <button id="btn-novo-projeto" type="button" class="flex items-center gap-space-xs bg-olive-primary hover:bg-primary text-on-primary px-space-lg py-space-sm rounded-xl font-headline-sm text-body-md font-semibold transition-all shadow-xs cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">add</span>
                <span>Novo Projeto</span>
              </button>
            </div>
          </div>

          <!-- Runway de Busca -->
          <div class="bg-surface-container-lowest border border-border-subtle p-space-sm rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div class="flex flex-wrap items-center gap-space-md flex-1 w-full">
              <div class="relative flex-1 min-w-[240px]">
                <span class="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
                <input id="project-search-input" type="text" placeholder="Buscar projeto ou cliente..." class="w-full h-10 pl-9 pr-space-md bg-surface-container-low border border-border-subtle rounded-lg font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:outline-none focus:border-olive-primary focus:bg-surface-container-lowest transition-colors">
              </div>
            </div>
          </div>

          <!-- Matriz Kanban (3 Colunas) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-base items-start select-none" id="kanban-matrix">
            <!-- Coluna Planejamento -->
            <div class="flex flex-col bg-surface-container-low/70 border border-border-subtle rounded-xl p-space-md min-h-[600px]" data-column="Planejamento">
              <div class="flex items-center justify-between pb-space-md mb-space-sm border-b border-border-subtle/80">
                <div class="flex items-center gap-space-sm">
                  <span class="w-3 h-3 rounded-full bg-brass-accent"></span>
                  <h2 class="font-headline-sm text-[17px] text-on-surface font-semibold">Planejamento</h2>
                  <span class="bg-surface-container-lowest border border-border-subtle text-text-secondary font-body-sm px-space-xs py-space-2xs rounded-full font-bold shadow-xs" id="count-planejamento">0</span>
                </div>
              </div>
              <div class="flex flex-col gap-space-md flex-1 kanban-dropzone" id="col-planejamento">
                <!-- Dynamic cards -->
              </div>
            </div>

            <!-- Coluna Em Andamento -->
            <div class="flex flex-col bg-surface-container-low/70 border border-border-subtle rounded-xl p-space-md min-h-[600px]" data-column="Em andamento">
              <div class="flex items-center justify-between pb-space-md mb-space-sm border-b border-border-subtle/80">
                <div class="flex items-center gap-space-sm">
                  <span class="w-3 h-3 rounded-full bg-olive-primary"></span>
                  <h2 class="font-headline-sm text-[17px] text-on-surface font-semibold">Em Andamento</h2>
                  <span class="bg-lime-100 text-lime-900 border border-lime-200 font-body-sm px-space-xs py-space-2xs rounded-full font-bold shadow-xs" id="count-andamento">0</span>
                </div>
              </div>
              <div class="flex flex-col gap-space-md flex-1 kanban-dropzone" id="col-andamento">
                <!-- Dynamic cards -->
              </div>
            </div>

            <!-- Coluna Entregue -->
            <div class="flex flex-col bg-surface-container-low/70 border border-border-subtle rounded-xl p-space-md min-h-[600px]" data-column="Entregue">
              <div class="flex items-center justify-between pb-space-md mb-space-sm border-b border-border-subtle/80">
                <div class="flex items-center gap-space-sm">
                  <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <h2 class="font-headline-sm text-[17px] text-on-surface font-semibold">Entregue</h2>
                  <span class="bg-emerald-100 text-emerald-800 border border-emerald-200 font-body-sm px-space-xs py-space-2xs rounded-full font-bold shadow-xs" id="count-entregue">0</span>
                </div>
              </div>
              <div class="flex flex-col gap-space-md flex-1 kanban-dropzone" id="col-entregue">
                <!-- Dynamic cards -->
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  UI.attachGlobalListeners(container);

  let projetosData = [];
  let clientesOptions = [];

  const loadProjetos = async () => {
    UI.spinner.show(container);
    try {
      const resClientes = await safeSupabaseQuery(supabase.from('clientes').select('id, nome'));
      clientesOptions = resClientes.data || [
        { id: 'c1', nome: 'Solaris Tech Corp' },
        { id: '2', nome: 'Nexa Cosméticos' },
        { id: '3', nome: 'Aurora Imóveis' }
      ];

      const resProjetos = await safeSupabaseQuery(supabase.from('projetos').select('*, clientes(nome)').order('created_at', { ascending: false }));

      if (resProjetos.error || !resProjetos.data || resProjetos.data.length === 0) {
        projetosData = [
          { id: 'p1', titulo: 'Redesign Portal E-commerce', cliente_id: 'c1', clientes: { nome: 'Solaris Tech Corp' }, responsavel: 'Mariana Costa', prazo: '2025-11-05', status: 'Planejamento', descricao: 'Wireframes e jornada B2B' },
          { id: 'p2', titulo: 'Landing Page Campanha Q3', cliente_id: '2', clientes: { nome: 'Nexa Cosméticos' }, responsavel: 'Gabriel Santos', prazo: '2025-10-12', status: 'Em andamento', descricao: 'Conversão para vendas' },
          { id: 'p3', titulo: 'Design System & Figma Kit', cliente_id: '3', clientes: { nome: 'Aurora Imóveis' }, responsavel: 'Mariana Costa', prazo: '2025-10-01', status: 'Entregue', descricao: 'Componentes acessíveis' }
        ];
      } else {
        projetosData = resProjetos.data;
      }

      renderKanban(projetosData);

      if (queryParams.cliente_id) {
        openModalProjeto({ cliente_id: queryParams.cliente_id });
      }
    } catch (err) {
      console.warn('Fallback projetos:', err);
    } finally {
      UI.spinner.hide(container);
    }
  };

  const renderKanban = (items) => {
    const colPlan = container.querySelector('#col-planejamento');
    const colAnd = container.querySelector('#col-andamento');
    const colEnt = container.querySelector('#col-entregue');

    if (!colPlan || !colAnd || !colEnt) return;

    colPlan.innerHTML = '';
    colAnd.innerHTML = '';
    colEnt.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];

    items.forEach(p => {
      const isOverdue = p.prazo && p.prazo < today && p.status !== 'Entregue';
      const cardHtml = `
        <div class="kanban-card bg-surface-container-lowest border border-border-subtle hover:border-slate-300 p-space-base rounded-xl shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing flex flex-col gap-space-base" draggable="true" data-id="${p.id}">
          <div class="flex flex-col gap-space-xs">
            <span class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">${p.clientes?.nome || 'Cliente'}</span>
            <h3 class="font-headline-sm text-[16px] leading-snug font-semibold text-on-surface">${p.titulo}</h3>
            <p class="font-body-sm text-text-secondary line-clamp-2">${p.descricao || 'Sem descrição'}</p>
          </div>
          <div class="flex items-center justify-between pt-space-sm border-t border-border-subtle text-body-sm text-text-secondary">
            <div class="flex items-center gap-space-xs">
              <div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[11px]">
                ${(p.responsavel || 'AG').substring(0, 2).toUpperCase()}
              </div>
              <span class="font-medium text-[13px]">${p.responsavel || 'Agência'}</span>
            </div>
            <span class="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded text-[12px] ${isOverdue ? 'text-red-700 bg-red-50 border border-red-200 font-semibold' : 'bg-surface-container text-text-secondary'}">
              <span class="material-symbols-outlined text-[14px]">${isOverdue ? 'error' : 'calendar_today'}</span> ${formatDate(p.prazo)}
            </span>
          </div>
        </div>
      `;

      if (p.status === 'Planejamento') colPlan.insertAdjacentHTML('beforeend', cardHtml);
      else if (p.status === 'Em andamento' || p.status === 'Revisão') colAnd.insertAdjacentHTML('beforeend', cardHtml);
      else colEnt.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Atualiza contadores
    container.querySelector('#count-planejamento').textContent = colPlan.children.length;
    container.querySelector('#count-andamento').textContent = colAnd.children.length;
    container.querySelector('#count-entregue').textContent = colEnt.children.length;

    // Ativa Drag and Drop Nativo
    attachDragAndDrop();
  };

  let draggedCardId = null;

  const attachDragAndDrop = () => {
    container.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCardId = card.getAttribute('data-id');
        card.classList.add('opacity-40', 'scale-95');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-40', 'scale-95');
      });
    });

    container.querySelectorAll('.kanban-dropzone').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('bg-surface-container-high/60');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('bg-surface-container-high/60');
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('bg-surface-container-high/60');
        const targetStatus = zone.parentElement.getAttribute('data-column');

        if (draggedCardId && targetStatus) {
          const proj = projetosData.find(p => p.id === draggedCardId);
          if (proj && proj.status !== targetStatus) {
            proj.status = targetStatus;
            renderKanban(projetosData);
            await supabase.from('projetos').update({ status: targetStatus }).eq('id', draggedCardId);
            UI.toast(`Status do projeto atualizado para "${targetStatus}"`, 'success');
          }
        }
      });
    });
  };

  // Modal de Criação de Projeto
  const openModalProjeto = (item = null) => {
    const formEl = document.createElement('form');
    formEl.className = 'flex flex-col gap-space-md';
    formEl.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Título do Projeto *</label>
        <input type="text" id="proj-titulo" required value="${item?.titulo || ''}" placeholder="ex: Redesign do Portal Institucional" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
      </div>

      <div class="grid grid-cols-2 gap-space-sm">
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Cliente *</label>
          <select id="proj-cliente" required class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
            ${clientesOptions.map(c => `
              <option value="${c.id}" ${item?.cliente_id === c.id ? 'selected' : ''}>${c.nome}</option>
            `).join('')}
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Responsável</label>
          <input type="text" id="proj-resp" value="${item?.responsavel || ''}" placeholder="ex: Gabriel Santos" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-space-sm">
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Prazo de Entrega</label>
          <input type="date" id="proj-prazo" value="${item?.prazo || ''}" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Etapa Inicial</label>
          <select id="proj-status" class="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm">
            <option value="Planejamento" ${item?.status === 'Planejamento' ? 'selected' : ''}>Planejamento</option>
            <option value="Em andamento" ${item?.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
            <option value="Entregue" ${item?.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-label-xs font-semibold uppercase text-on-surface-variant">Resumo do Escopo</label>
        <textarea id="proj-desc" rows="3" placeholder="Marcos e entregáveis principais..." class="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-body-sm resize-none">${item?.descricao || ''}</textarea>
      </div>
    `;

    UI.modal({
      title: item?.id ? 'Editar Projeto' : 'Novo Projeto no Kanban',
      content: formEl,
      confirmText: 'Cadastrar Projeto',
      onConfirm: async () => {
        const titulo = formEl.querySelector('#proj-titulo').value.trim();
        const cliente_id = formEl.querySelector('#proj-cliente').value;
        const responsavel = formEl.querySelector('#proj-resp').value.trim();
        const prazo = formEl.querySelector('#proj-prazo').value;
        const status = formEl.querySelector('#proj-status').value;
        const descricao = formEl.querySelector('#proj-desc').value.trim();

        if (!titulo || !cliente_id) {
          UI.toast('Preencha os campos obrigatórios.', 'warning');
          return;
        }

        const payload = { titulo, cliente_id, responsavel, prazo, status, descricao };
        const clienteObj = clientesOptions.find(c => c.id === cliente_id);

        if (item?.id) {
          await supabase.from('projetos').update(payload).eq('id', item.id);
          const idx = projetosData.findIndex(p => p.id === item.id);
          if (idx !== -1) projetosData[idx] = { ...projetosData[idx], ...payload, clientes: clienteObj };
          UI.toast('Projeto atualizado!', 'success');
        } else {
          const { data } = await supabase.from('projetos').insert(payload).select();
          const newObj = data?.[0] || { id: String(Date.now()), ...payload, clientes: clienteObj };
          projetosData.unshift(newObj);
          UI.toast('Novo projeto cadastrado!', 'success');
        }
        renderKanban(projetosData);
      }
    });
  };

  container.querySelector('#btn-novo-projeto').onclick = () => openModalProjeto();

  // Busca em tempo real no Kanban
  const searchInput = container.querySelector('#project-search-input');
  searchInput.oninput = (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = projetosData.filter(p =>
      p.titulo.toLowerCase().includes(term) || (p.clientes?.nome || '').toLowerCase().includes(term)
    );
    renderKanban(filtered);
  };

  await loadProjetos();
}
