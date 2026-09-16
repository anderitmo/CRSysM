# 📘 SPEC Técnica — CRSys M3000
## Sistema CRM Web para Agência Digital

**Versão:** 1.0  
**Stack:** HTML5 + CSS3 + JavaScript (Vanilla) + Supabase  
**Arquitetura:** SPA (Single Page Application) — Client-Side Rendering  
**Dependências:** Zero. Todas as bibliotecas via CDN.  
**Autenticação:** Supabase Auth (e-mail/senha)  
**Persistência:** Supabase PostgreSQL (API REST + Realtime opcional)

---

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────┐
│              NAVEGADOR                      │
│  ┌─────────────┐  ┌─────────────────────┐  │
│  │  index.html │  │  app.js (router)    │  │
│  │  (shell)    │  │  + state manager    │  │
│  └─────────────┘  └─────────────────────┘  │
│         │                    │              │
│         ▼                    ▼              │
│  ┌─────────────────────────────────────┐   │
│  │  /css/    /js/pages/   /js/lib/   │   │
│  │  style.css  leads.js   supabase.js │   │
│  │             clientes.js  utils.js  │   │
│  │             dashboard.js  ui.js    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────┬───────────────────────┘
                      │ HTTPS (REST + Auth)
                      ▼
┌─────────────────────────────────────────────┐
│              SUPABASE                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │  Auth   │ │PostgreSQL│ │  Storage    │  │
│  │(JWT/RLS)│ │(Tabelas) │ │  (avatars)  │  │
│  └─────────┘ └─────────┘ └─────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.1 Princípios Arquiteturais
- **Zero build step:** Nenhum bundler, transpiler ou package manager.
- **CDN-only:** Todas as bibliotecas carregadas via `<script>` ou `<link>` CDN.
- **Modularidade via ES Modules:** Use `type="module"` no `<script>` principal.
- **SPA hash-router:** Navegação via `window.location.hash`. Nenhum recarregamento de página.
- **State centralizado:** Objeto global `AppState` gerencia sessão, dados em cache e view atual.

---

## 2. Estrutura de Arquivos

```
crsys-m3000/
├── index.html              # Shell SPA — carrega tudo
├── css/
│   └── style.css           # Estilos custom + overrides
├── js/
│   ├── main.js             # Entry point: init, router, auth guard
│   ├── config.js           # SUPABASE_URL, SUPABASE_ANON_KEY, constantes
│   ├── state.js            # AppState (store centralizado)
│   ├── router.js           # Hash router + lazy load de views
│   ├── supabase-client.js  # Instância única do cliente Supabase
│   ├── auth.js             # Login, logout, registro, sessão
│   ├── utils.js            # Helpers genéricos (formatDate, debounce, etc.)
│   ├── ui.js               # Componentes reutilizáveis (toast, modal, spinner)
│   └── pages/
│       ├── login.js        # View: Login
│       ├── dashboard.js    # View: Dashboard (KPIs + reuniões)
│       ├── leads.js        # View: CRUD Leads
│       ├── clientes.js     # View: Lista de clientes
│       ├── orcamentos.js   # View: CRUD Orçamentos
│       ├── projetos.js     # View: CRUD Projetos (kanban/lista)
│       ├── agenda.js       # View: Agenda de reuniões
│       └── indicacoes.js   # View: Indicações
└── assets/
    └── (imagens, ícones, favicon)
```

---

## 3. Bibliotecas Permitidas (CDN)

| Biblioteca | URL CDN | Propósito | Versão |
|------------|---------|-----------|--------|
| **Supabase JS** | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Cliente oficial Supabase | 2.x |
| **Tailwind CSS** | `https://cdn.tailwindcss.com` | Framework CSS utilitário | 3.x |
| **Phosphor Icons** | `https://unpkg.com/@phosphor-icons/web` | Ícones SVG leves | 2.x |
| **Vanilla JS** | Nativo | Lógica, DOM, fetch, router | ES2022+ |

> ⚠️ **Proibido:** React, Vue, Angular, Svelte, jQuery, Bootstrap, npm, yarn, pnpm, webpack, vite, etc.

### 3.1 Configuração do Tailwind (no `<head>`)
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      }
    }
  }
</script>
```

---

## 4. Modelo de Dados (Supabase)

### 4.1 Tabelas

#### `leads`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único |
| `nome` | `text` | NOT NULL | Nome completo |
| `email` | `text` | NOT NULL, único | E-mail de contato |
| `telefone` | `text` | — | Telefone/WhatsApp |
| `origem` | `text` | NOT NULL | Fonte: "Instagram", "Site", "Indicação", "Outro" |
| `status` | `text` | NOT NULL, default `'Novo'` | "Novo", "Em contato", "Proposta enviada", "Convertido", "Perdido" |
| `notas` | `text` | — | Observações livres |
| `created_at` | `timestamptz` | default `now()` | Data de criação |
| `updated_at` | `timestamptz` | default `now()` | Última atualização |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono do registro (RLS) |

#### `clientes`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK | Identificador único |
| `lead_id` | `uuid` | FK → `leads(id)`, ON DELETE SET NULL | Lead de origem |
| `nome` | `text` | NOT NULL | Nome do cliente |
| `email` | `text` | NOT NULL | E-mail |
| `telefone` | `text` | — | Telefone |
| `data_conversao` | `timestamptz` | default `now()` | Quando virou cliente |
| `created_at` | `timestamptz` | default `now()` | — |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono do registro (RLS) |

#### `orcamentos`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK | — |
| `cliente_id` | `uuid` | FK → `clientes(id)`, ON DELETE CASCADE | Cliente vinculado |
| `titulo` | `text` | NOT NULL | Nome do orçamento |
| `valor` | `numeric(12,2)` | — | Valor estimado |
| `descricao` | `text` | — | Detalhes do serviço |
| `status` | `text` | default `'Pendente'` | "Pendente", "Aprovado", "Recusado", "Negociando" |
| `created_at` | `timestamptz` | default `now()` | — |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono (RLS) |

#### `projetos`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK | — |
| `cliente_id` | `uuid` | FK → `clientes(id)`, ON DELETE CASCADE | Cliente vinculado |
| `titulo` | `text` | NOT NULL | Nome do projeto |
| `descricao` | `text` | — | Escopo resumido |
| `status` | `text` | default `'Planejamento'` | "Planejamento", "Em andamento", "Revisão", "Entregue", "Pausado", "Cancelado" |
| `prazo` | `date` | — | Data de entrega |
| `responsavel` | `text` | — | Nome do responsável interno |
| `created_at` | `timestamptz` | default `now()` | — |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono (RLS) |

#### `reunioes`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK | — |
| `titulo` | `text` | NOT NULL | Assunto da reunião |
| `data` | `date` | NOT NULL | Dia da reunião |
| `hora` | `time` | NOT NULL | Horário |
| `participantes` | `text[]` | default `{}` | Array de nomes/e-mails |
| `pauta` | `text` | — | O que será discutido |
| `status` | `text` | default `'Agendada'` | "Agendada", "Realizada", "Cancelada", "Remarcada" |
| `created_at` | `timestamptz` | default `now()` | — |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono (RLS) |

#### `indicacoes`
| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | `uuid` | PK | — |
| `indicador` | `text` | NOT NULL | Quem indicou |
| `lead_id` | `uuid` | FK → `leads(id)`, ON DELETE SET NULL | Lead gerado |
| `comissao` | `numeric(12,2)` | — | Valor da comissão |
| `status` | `text` | default `'Pendente'` | "Pendente", "Paga", "Cancelada" |
| `created_at` | `timestamptz` | default `now()` | — |
| `user_id` | `uuid` | FK → `auth.users(id)` | Dono (RLS) |

### 4.2 Row Level Security (RLS) — Obrigatório

Todas as tabelas devem ter RLS ativado. Política padrão:

```sql
-- Exemplo para tabela leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários só veem seus próprios leads"
ON leads
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

> Replicar essa política para **todas** as tabelas (`clientes`, `orcamentos`, `projetos`, `reunioes`, `indicacoes`).

### 4.3 Função de Atualização Automática (`updated_at`)

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. API / Supabase Client — Padrões de Uso

### 5.1 Inicialização (`js/supabase-client.js`)
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 5.2 Operações CRUD Padrão

| Operação | Método Supabase | Exemplo |
|----------|-----------------|---------|
| **Listar** | `.select('*')` | `supabase.from('leads').select('*').order('created_at', { ascending: false })` |
| **Buscar** | `.select('*').eq('id', id).single()` | `supabase.from('leads').select('*').eq('id', uuid).single()` |
| **Inserir** | `.insert({...}).select()` | `supabase.from('leads').insert({ nome, email, user_id }).select()` |
| **Atualizar** | `.update({...}).eq('id', id)` | `supabase.from('leads').update({ status }).eq('id', uuid)` |
| **Deletar** | `.delete().eq('id', id)` | `supabase.from('leads').delete().eq('id', uuid)` |
| **Contar** | `.select('*', { count: 'exact', head: true })` | `supabase.from('leads').select('*', { count: 'exact', head: true })` |
| **Relacionar** | `.select('*, clientes(*)')` | `supabase.from('leads').select('*, clientes(*)')` |

### 5.3 Tratamento de Erros

Toda chamada ao Supabase DEVE seguir este padrão:

```javascript
const { data, error } = await supabase.from('leads').select('*');

if (error) {
  console.error('Erro ao buscar leads:', error.message);
  UI.toast(error.message, 'error');
  return null;
}

return data;
```

---

## 6. Sistema de Rotas (Hash Router)

### 6.1 Regras do Router (`js/router.js`)

```javascript
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
```

### 6.2 Auth Guard
- Rotas protegidas (todas exceto `#/login`) verificam `AppState.session`.
- Se não houver sessão ativa, redirecionar para `#/login`.
- Se houver sessão e usuário tentar acessar `#/login`, redirecionar para `#/dashboard`.

### 6.3 Renderização
- O router carrega dinamicamente o módulo da página via `import()` (lazy load).
- Cada módulo exporta uma função `render(container)` que recebe o elemento `#app`.
- Antes de renderizar a nova view, limpar o conteúdo anterior: `container.innerHTML = ''`.

---

## 7. State Management (`js/state.js`)

```javascript
export const AppState = {
  session: null,           // Objeto de sessão do Supabase Auth
  user: null,              // Dados do usuário logado
  currentView: '',         // Hash atual
  cache: {
    leads: [],
    clientes: [],
    orcamentos: [],
    projetos: [],
    reunioes: [],
    indicacoes: []
  },

  // Métodos
  setSession(session) { this.session = session; this.user = session?.user ?? null; },
  clearSession() { this.session = null; this.user = null; this.cache = {}; },
  setCache(key, data) { this.cache[key] = data; },
  getCache(key) { return this.cache[key]; }
};
```

---

## 8. Componentes de UI Reutilizáveis (`js/ui.js`)

### 8.1 Toast / Notificação
```javascript
UI.toast(message, type = 'info', duration = 3000)
// type: 'info' | 'success' | 'warning' | 'error'
// Posição: fixed top-right, z-50
```

### 8.2 Modal
```javascript
UI.modal({
  title: 'Título',
  content: 'HTML ou elemento DOM',
  onConfirm: () => {},
  onCancel: () => {},
  confirmText: 'Confirmar',
  cancelText: 'Cancelar'
})
```

### 8.3 Spinner / Loading
```javascript
UI.spinner.show(containerElement);
UI.spinner.hide(containerElement);
```

### 8.4 Tabela de Dados
```javascript
UI.dataTable({
  headers: ['Nome', 'E-mail', 'Status', 'Ações'],
  rows: dataArray,
  renderRow: (item) => `<tr>...</tr>`,
  emptyMessage: 'Nenhum registro encontrado.'
})
```

### 8.5 Formulário Padrão
```javascript
UI.form({
  id: 'lead-form',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'E-mail', type: 'email', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Novo', 'Em contato', ...] }
  ],
  onSubmit: (data) => {},
  submitText: 'Salvar'
})
```

---

## 9. Requisitos por Tela

### 9.1 Login (`#/login`)
- Formulário: e-mail + senha.
- Botão "Entrar" → `supabase.auth.signInWithPassword({ email, password })`.
- Link "Criar conta" → `supabase.auth.signUp({ email, password })`.
- Em sucesso: salvar sessão no `AppState`, redirecionar para `#/dashboard`.
- Em erro: exibir `UI.toast(error.message, 'error')`.
- Layout centrado, fundo gradiente sutil, logo da agência.

### 9.2 Dashboard (`#/dashboard`)
- **Cards de KPI** (grid 4 colunas em desktop, 1 em mobile):
  - Total de Leads ativos (status ≠ "Convertido" e ≠ "Perdido")
  - Total de Clientes
  - Projetos em andamento (status = "Em andamento" ou "Planejamento")
  - Reuniões da semana (data entre `hoje` e `hoje + 7 dias`)
- **Lista rápida:** Últimas 5 reuniões agendadas (título, data, hora).
- **Gráfico simples (opcional):** Distribuição de leads por status (barras CSS puras).
- Layout: sidebar fixa à esquerda (desktop) / bottom nav (mobile).

### 9.3 Leads (`#/leads`)
- **Lista:** Tabela com colunas Nome, E-mail, Telefone, Origem, Status, Ações (Editar, Excluir, Converter).
- **Filtros:** Input de busca por nome/e-mail + select por status.
- **Botão "Novo Lead":** Abre modal com formulário de cadastro.
- **Ação "Converter":**
  1. Confirmação via `UI.modal`.
  2. Cria registro em `clientes` com dados do lead.
  3. Atualiza `leads.status` para "Convertido".
  4. `UI.toast('Lead convertido em cliente!', 'success')`.
- **Ação "Excluir":** Confirmação modal → `delete` → recarregar lista.
- **Paginação:** Opcional. Se lista > 20 itens, usar `.range(from, to)`.

### 9.4 Clientes (`#/clientes`)
- **Lista:** Tabela com Nome, E-mail, Telefone, Data de Conversão, Ações (Ver detalhes, Excluir).
- **Detalhes do cliente (modal ou view expandida):**
  - Dados do cliente
  - Orçamentos vinculados (lista)
  - Projetos vinculados (lista)
  - Botão "Novo Orçamento" (redireciona para `#/orcamentos?cliente_id=xxx`)
  - Botão "Novo Projeto" (redireciona para `#/projetos?cliente_id=xxx`)
- **Origem:** Sempre mostrar de qual lead veio (se houver `lead_id`).

### 9.5 Orçamentos (`#/orcamentos`)
- **Lista:** Tabela com Título, Cliente, Valor (formatado em R$), Status, Ações.
- **Filtros:** Por status + busca por título.
- **Formulário:** Título, Cliente (select com `clientes`), Valor (input number com step 0.01), Descrição (textarea), Status (select).
- **Regra:** Ao criar, se `cliente_id` vier da query string (`?cliente_id=xxx`), pré-selecionar no select.
- **Valor:** Sempre formatar como `R$ 0.000,00` na exibição. No input, usar `type="number"`.

### 9.6 Projetos (`#/projetos`)
- **Visualização:** Pode ser **lista** ou **kanban simples** (3 colunas: "Planejamento", "Em andamento", "Entregue").
- **Kanban:** Cards arrastáveis (HTML5 Drag and Drop nativo) que atualizam o `status` ao soltar.
- **Lista:** Tabela com Título, Cliente, Responsável, Prazo, Status, Ações.
- **Formulário:** Título, Cliente (select), Descrição, Responsável (input text), Prazo (input type="date"), Status (select).
- **Prazo:** Se `prazo < hoje` e status ≠ "Entregue", destacar em vermelho.

### 9.7 Agenda (`#/agenda`)
- **Visualização:** Lista agrupada por data (próximas reuniões primeiro).
- **Filtro:** Por status + busca por título.
- **Formulário:** Título, Data (date), Hora (time), Participantes (input text com tags — separar por vírgula), Pauta (textarea), Status.
- **Regra de negócio:** Não permitir marcar reunião em data passada (validação no submit).
- **Ação "Marcar como realizada":** Botão rápido na lista → atualiza status.

### 9.8 Indicações (`#/indicacoes`)
- **Lista:** Tabela com Indicador, Lead vinculado (nome), Comissão (R$), Status, Ações.
- **Formulário:** Indicador (text), Lead (select opcional), Comissão (number), Status.
- **Regra:** Se o lead for excluído, manter a indicação (`lead_id` vira NULL).

---

## 10. Autenticação & Segurança

### 10.1 Fluxo de Auth
1. `main.js` inicia → `supabase.auth.getSession()` → popula `AppState`.
2. `supabase.auth.onAuthStateChange((event, session) => { ... })` → atualiza `AppState` em tempo real.
3. Todas as rotas protegidas verificam `AppState.session` antes de renderizar.
4. O `user_id` em todas as tabelas é preenchido automaticamente pelo backend (via `auth.uid()`) ou pelo frontend (`AppState.user.id`).

### 10.2 Logout
```javascript
await supabase.auth.signOut();
AppState.clearSession();
window.location.hash = '#/login';
```

### 10.3 Senhas
- Mínimo 6 caracteres.
- Sem requisitos de complexidade (simplificado para aula).

---

## 11. Convenções de Código

### 11.1 Nomenclatura
- **Arquivos:** kebab-case (`supabase-client.js`, `orcamentos.js`).
- **Variáveis/Funções:** camelCase (`getLeads`, `currentUser`).
- **Constantes:** UPPER_SNAKE_CASE (`SUPABASE_URL`).
- **IDs DOM:** kebab-case (`lead-form`, `btn-save`).

### 11.2 Organização de Funções por Página
Cada módulo de página (`js/pages/*.js`) deve exportar:
```javascript
export async function render(container) {
  // 1. Verificar auth
  // 2. Buscar dados
  // 3. Montar HTML
  // 4. Anexar event listeners
  // 5. Inserir no container
}
```

### 11.3 Event Listeners
- Sempre usar **event delegation** para listas dinâmicas.
- Exemplo: `container.addEventListener('click', (e) => { if (e.target.matches('.btn-delete')) { ... } })`.

### 11.4 Formatação de Dados
- **Datas:** `new Date().toLocaleDateString('pt-BR')` ou `Intl.DateTimeFormat('pt-BR')`.
- **Moeda:** `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- **Telefone:** Máscara simples `(00) 00000-0000` via regex no `utils.js`.

---

## 12. Checklist de Entrega

- [ ] `index.html` carrega todas as dependências via CDN.
- [ ] Supabase configurado com tabelas, RLS e políticas de segurança.
- [ ] Login funcional (signUp + signIn + signOut).
- [ ] CRUD completo de Leads com conversão para Cliente.
- [ ] CRUD de Clientes com visualização de histórico.
- [ ] CRUD de Orçamentos vinculados a Clientes.
- [ ] CRUD de Projetos com kanban ou lista por status.
- [ ] CRUD de Reuniões com validação de data futura.
- [ ] CRUD de Indicações.
- [ ] Dashboard com KPIs reais (contagens do banco).
- [ ] Navegação SPA funcional (hash router, sem reload).
- [ ] Interface responsiva (mobile + desktop).
- [ ] Toasts, modais e spinners reutilizáveis funcionando.
- [ ] Código 100% em um único repositório, sem `package.json`.

---

## 13. Anexos

### 13.1 `index.html` — Estrutura Mínima
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRSys M3000</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body class="bg-gray-50 text-gray-800 antialiased">
  <div id="app"></div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

### 13.2 `js/config.js` — Template
```javascript
// Substitua pelos valores do seu projeto Supabase
export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
export const SUPABASE_ANON_KEY = 'sua-chave-anon-publica-aqui';

export const APP_NAME = 'CRSys M3000';
export const APP_VERSION = '1.0.0';
```

---

> **Documento gerado para fins acadêmicos.**  
> Qualquer agente de IA deve seguir rigorosamente esta SPEC para garantir consistência, segurança e manutenibilidade do código.
