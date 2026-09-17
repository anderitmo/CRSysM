// Gerenciador de Estado Centralizado da SPA
export const AppState = {
  session: null,
  user: null,
  currentView: '',
  cache: {
    leads: [],
    clientes: [],
    orcamentos: [],
    projetos: [],
    reunioes: [],
    indicacoes: []
  },

  setSession(session) {
    this.session = session;
    this.user = session?.user ?? null;
  },

  clearSession() {
    this.session = null;
    this.user = null;
    this.cache = {
      leads: [],
      clientes: [],
      orcamentos: [],
      projetos: [],
      reunioes: [],
      indicacoes: []
    };
  },

  setCache(key, data) {
    this.cache[key] = data;
  },

  getCache(key) {
    return this.cache[key];
  }
};
