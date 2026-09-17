// Componentes de Interface Reutilizáveis (Google Stitch Theme Setup)
import { logout } from './auth.js';
import { AppState } from './state.js';

export const UI = {
  // Renderiza a Sidebar lateral do Google Stitch
  renderSidebar(currentPath = 'dashboard') {
    const userEmail = AppState.user?.email || 'diretor@agencia.com.br';
    const userName = AppState.user?.user_metadata?.name || userEmail.split('@')[0];

    const navItems = [
      { path: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
      { path: 'leads', label: 'Leads', icon: 'filter_alt', badge: '14' },
      { path: 'clientes', label: 'Clientes', icon: 'domain' },
      { path: 'orcamentos', label: 'Orçamentos', icon: 'request_quote' },
      { path: 'projetos', label: 'Projetos', icon: 'view_kanban' },
      { path: 'agenda', label: 'Agenda', icon: 'calendar_month' },
      { path: 'indicacoes', label: 'Indicações', icon: 'handshake' }
    ];

    const navLinks = navItems.map(item => {
      const isActive = currentPath === item.path;
      const activeClasses = isActive
        ? 'bg-primary text-on-primary font-semibold rounded-lg shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors rounded-lg';

      const badgeHtml = item.badge
        ? `<span class="${isActive ? 'bg-primary-container text-on-primary' : 'bg-amber-100 text-amber-900'} font-label-xs text-label-xs px-space-xs py-space-2xs rounded-full font-bold">${item.badge}</span>`
        : '';

      return `
        <a href="#/${item.path}" data-path="${item.path}" class="flex items-center justify-between px-space-md py-space-sm transition-colors ${activeClasses}">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
            <span class="font-body-md text-body-md">${item.label}</span>
          </div>
          ${badgeHtml}
        </a>
      `;
    }).join('');

    return `
      <aside class="fixed left-0 top-0 h-screen w-layout-sidebar bg-surface-container-lowest border-r border-border-subtle flex flex-col justify-between z-50 shadow-sm hidden md:flex">
        <div class="flex flex-col">
          <div class="px-space-lg pt-space-lg pb-space-md flex flex-col gap-space-xs border-b border-border-subtle/60">
            <div class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-primary text-[28px]">token</span>
              <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">CRSys M3000</span>
            </div>
            <span class="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant pl-space-2xs">CRM PARA AGÊNCIAS WEB</span>
          </div>
          <nav class="flex flex-col gap-space-2xs px-space-md mt-space-md">
            ${navLinks}
          </nav>
        </div>
        <div class="p-space-md bg-surface-container-low border border-border-subtle flex flex-col gap-space-sm m-space-md rounded-xl">
          <div class="flex items-center justify-between px-space-xs">
            <div class="flex items-center gap-space-xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-label-xs text-label-xs text-on-surface-variant font-semibold">Supabase Online</span>
            </div>
            <span class="material-symbols-outlined text-emerald-600 text-[16px]">cloud_done</span>
          </div>
          <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-semibold text-xs shadow-sm">
                ${userName.substring(0, 2).toUpperCase()}
              </div>
              <div class="flex flex-col truncate">
                <span class="font-body-sm text-body-sm font-semibold text-on-surface truncate">${userName}</span>
                <span class="font-label-xs text-label-xs text-on-surface-variant truncate">${userEmail}</span>
              </div>
            </div>
            <button id="btn-logout" type="button" class="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors shrink-0" title="Encerrar sessão">
              <span class="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    `;
  },

  // Renderiza o Header Global Stitch
  renderHeader(title = 'CRSys M3000') {
    return `
      <header class="fixed top-0 left-0 md:left-layout-sidebar right-0 h-16 bg-surface-container-lowest border-b border-border-subtle z-40 flex items-center justify-between px-space-md md:px-space-xl shadow-xs">
        <div class="flex items-center gap-space-base">
          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">${title}</span>
        </div>
        <div class="flex items-center gap-space-md">
          <div class="relative hidden sm:flex items-center">
            <span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
            <input type="text" placeholder="Buscar no CRM..." class="w-64 md:w-80 h-9 pl-9 pr-space-md bg-surface-container-low border border-border-subtle rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
          </div>
          <a href="#/leads" class="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md h-9 rounded-xl font-body-sm text-body-sm font-semibold transition-all shadow-xs">
            <span class="material-symbols-outlined text-[18px]">add</span>
            <span class="hidden sm:inline">Novo Registro</span>
          </a>
        </div>
      </header>
    `;
  },

  // Anexa event listeners globais após renderização
  attachGlobalListeners(container) {
    const btnLogout = container.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  },

  // Exibe Notificação Toast
  toast(message, type = 'info', duration = 4000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const typeConfig = {
      success: { icon: 'check_circle', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', iconColor: 'text-emerald-600' },
      error: { icon: 'error', bg: 'bg-red-50 border-red-200 text-red-800', iconColor: 'text-red-600' },
      warning: { icon: 'warning', bg: 'bg-amber-50 border-amber-200 text-amber-800', iconColor: 'text-amber-600' },
      info: { icon: 'info', bg: 'bg-slate-50 border-slate-200 text-slate-800', iconColor: 'text-primary' }
    };

    const cfg = typeConfig[type] || typeConfig.info;

    const toastEl = document.createElement('div');
    toastEl.className = `pointer-events-auto flex items-center gap-space-sm p-space-md rounded-xl border shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 ${cfg.bg}`;
    toastEl.innerHTML = `
      <span class="material-symbols-outlined ${cfg.iconColor} text-[20px] shrink-0">${cfg.icon}</span>
      <span class="font-body-sm text-body-sm font-medium flex-1">${message}</span>
      <button type="button" class="text-on-surface-variant hover:text-on-surface shrink-0" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    toastContainer.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toastEl.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  },

  // Spinner Loading
  spinner: {
    show(container) {
      let spinnerEl = container.querySelector('.ui-spinner-overlay');
      if (!spinnerEl) {
        spinnerEl = document.createElement('div');
        spinnerEl.className = 'ui-spinner-overlay absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-xs flex items-center justify-center z-30 rounded-xl';
        spinnerEl.innerHTML = `
          <div class="flex flex-col items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
            <span class="font-label-xs text-label-xs text-on-surface-variant font-semibold">Carregando dados...</span>
          </div>
        `;
        if (getComputedStyle(container).position === 'static') {
          container.style.position = 'relative';
        }
        container.appendChild(spinnerEl);
      }
    },
    hide(container) {
      const spinnerEl = container.querySelector('.ui-spinner-overlay');
      if (spinnerEl) spinnerEl.remove();
    }
  },

  // Modal Dialog Generico
  modal({ title, content, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-space-base animate-fade-in';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-surface-container-lowest border border-border-subtle w-full max-w-lg rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md';

    modalContent.innerHTML = `
      <div class="flex items-center justify-between pb-space-xs border-b border-border-subtle">
        <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${title}</h2>
        <button type="button" class="btn-close p-space-2xs rounded-lg hover:bg-surface-container text-text-muted hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      <div class="modal-body font-body-md text-body-md text-on-surface-variant">
        ${typeof content === 'string' ? content : ''}
      </div>
      <div class="flex items-center justify-end gap-space-sm pt-space-xs border-t border-border-subtle">
        <button type="button" class="btn-cancel px-space-md py-space-xs rounded-xl font-label-md text-label-md text-text-secondary hover:bg-surface-container transition-colors">
          ${cancelText}
        </button>
        <button type="button" class="btn-confirm bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-xs rounded-xl font-label-md text-label-md font-bold transition-all shadow-xs">
          ${confirmText}
        </button>
      </div>
    `;

    if (typeof content !== 'string') {
      modalContent.querySelector('.modal-body').appendChild(content);
    }

    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);

    const closeModal = () => modalBackdrop.remove();

    modalContent.querySelector('.btn-close').onclick = () => {
      if (onCancel) onCancel();
      closeModal();
    };

    modalContent.querySelector('.btn-cancel').onclick = () => {
      if (onCancel) onCancel();
      closeModal();
    };

    modalContent.querySelector('.btn-confirm').onclick = async () => {
      if (onConfirm) await onConfirm();
      closeModal();
    };
  }
};
