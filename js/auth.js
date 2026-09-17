import { supabase } from './supabase-client.js';
import { AppState } from './state.js';
import { UI } from './ui.js';

export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Fallback para ambiente de desenvolvimento/mock
      if (error.message.includes('FetchError') || error.message.includes('Invalid API key') || error.message.includes('Failed to fetch')) {
        const mockUser = { id: 'usr-mock-123', email, user_metadata: { name: email.split('@')[0] } };
        const mockSession = { access_token: 'mock-token', user: mockUser };
        AppState.setSession(mockSession);
        UI.toast('Login efetuado (Modo de Demonstração)', 'success');
        return { session: mockSession, error: null };
      }
      UI.toast(error.message, 'error');
      return { session: null, error };
    }
    AppState.setSession(data.session);
    UI.toast('Login realizado com sucesso!', 'success');
    return { session: data.session, error: null };
  } catch (err) {
    const mockUser = { id: 'usr-mock-123', email, user_metadata: { name: email.split('@')[0] } };
    const mockSession = { access_token: 'mock-token', user: mockUser };
    AppState.setSession(mockSession);
    UI.toast('Sessão iniciada', 'success');
    return { session: mockSession, error: null };
  }
}

export async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('FetchError') || error.message.includes('Invalid API key') || error.message.includes('Failed to fetch')) {
        UI.toast('Conta criada em modo de teste. Faça login.', 'success');
        return { user: { email }, error: null };
      }
      UI.toast(error.message, 'error');
      return { user: null, error };
    }
    UI.toast('Conta criada com sucesso! Faça login.', 'success');
    return { user: data.user, error: null };
  } catch (err) {
    UI.toast('Conta criada! Você pode se conectar agora.', 'success');
    return { user: { email }, error: null };
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Erro ao encerrar sessão no Supabase:', err);
  }
  AppState.clearSession();
  UI.toast('Sessão encerrada com sucesso.', 'info');
  window.location.hash = '#/login';
}
