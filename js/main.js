import { supabase } from './supabase-client.js';
import { AppState } from './state.js';
import { initRouter } from './router.js';

async function initApp() {
  try {
    const { data } = await supabase.auth.getSession();
    AppState.setSession(data?.session || null);
  } catch (err) {
    console.warn('Sessão não identificada no Supabase Client:', err);
    AppState.setSession(null);
  }

  // Listener para mudanças no estado de autenticação em tempo real
  supabase.auth.onAuthStateChange((event, session) => {
    AppState.setSession(session);
  });

  // Inicializa o hash router
  initRouter();
}

document.addEventListener('DOMContentLoaded', initApp);
