// Hash Router da SPA
import { AppState } from './state.js';
import { UI } from './ui.js';

const routes = {
  '#/login': () => import('./pages/login.js'),
  '#/dashboard': () => import('./pages/dashboard.js'),
  '#/leads': () => import('./pages/leads.js'),
  '#/clientes': () => import('./pages/clientes.js'),
  '#/orcamentos': () => import('./pages/orcamentos.js'),
  '#/projetos': () => import('./pages/projetos.js'),
  '#/agenda': () => import('./pages/agenda.js'),
  '#/indicacoes': () => import('./pages/indicacoes.js'),
};

export async function handleRouteChange() {
  const container = document.getElementById('app');
  if (!container) return;

  let hash = window.location.hash || '#/dashboard';
  // Extrai caminho base ignorando query string
  const basePath = hash.split('?')[0];

  // Auth Guard
  const publicRoutes = ['#/login'];
  const isAuthenticated = !!AppState.session;

  if (!isAuthenticated && !publicRoutes.includes(basePath)) {
    window.location.hash = '#/login';
    return;
  }

  if (isAuthenticated && basePath === '#/login') {
    window.location.hash = '#/dashboard';
    return;
  }

  AppState.currentView = basePath;

  const routeLoader = routes[basePath];
  if (!routeLoader) {
    window.location.hash = '#/dashboard';
    return;
  }

  try {
    container.innerHTML = '';
    UI.spinner.show(container);

    const pageModule = await routeLoader();
    container.innerHTML = '';

    if (pageModule && typeof pageModule.render === 'function') {
      await pageModule.render(container);
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
          <p class="font-headline-sm text-on-surface">Página em desenvolvimento</p>
        </div>
      `;
    }
  } catch (err) {
    console.error(`Erro ao carregar rota ${basePath}:`, err);
    container.innerHTML = `
      <div class="p-space-xl flex flex-col items-center justify-center min-h-screen text-center">
        <span class="material-symbols-outlined text-error text-[48px] mb-2">error</span>
        <h2 class="font-headline-md text-on-surface">Ocorreu um erro ao carregar esta página</h2>
        <p class="font-body-sm text-on-surface-variant mb-4">${err.message}</p>
        <a href="#/dashboard" class="px-4 py-2 bg-primary text-white rounded-xl font-bold">Voltar para o Dashboard</a>
      </div>
    `;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
