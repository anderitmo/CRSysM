# 🗂️ Backlog de Tarefas — CRSys M3000
## Sistema CRM Web para Agência Digital

**Versão:** 1.1  
**Stack:** HTML5 + CSS3 + JavaScript (Vanilla) + Supabase  
**Arquitetura:** SPA — Client-Side Rendering  
**Dependências:** Zero. Todas as bibliotecas via CDN.

---

## Diretrizes para o Agente de IA

> **REGRA FUNDAMENTAL:** Antes de iniciar qualquer tarefa, leia este documento por completo.

### 1. Registro de Alterações (Obrigatório)
Toda correção, ajuste, refatoração ou alteração de escopo realizada durante o desenvolvimento DEVE ser registrada no arquivo `BACKLOG.md` (este documento), na seção **"Log de Alterações"** ao final do documento, com o seguinte formato:

```markdown
- **[DATA] — [Tipo]:** Descrição breve da alteração. Motivo: [por que foi feito]. Arquivos afetados: [lista].
```

**Tipos permitidos:** `CORRECAO`, `AJUSTE`, `REFATORACAO`, `ALTERACAO_ESCOPO`, `MELHORIA`, `BUGFIX`.

### 2. Interação Humana (Obrigatório)
Sempre que houver:
- Ambiguidade nos requisitos
- Conflito entre esta SPEC e uma decisão de implementação
- Dúvida sobre qual abordagem técnica adotar
- Necessidade de alterar o escopo de uma tarefa
- Inconsistência detectada entre tarefas

**A ação correta é:** parar o desenvolvimento da tarefa corrente, descrever a dúvida de forma clara e **solicitar interação humana** antes de prosseguir. Nunca "chutar" uma decisão de arquitetura ou negócio.

### 3. UI / UX — Diretrizes Visuais
- **Interface limpa:** Espaçamento generoso, hierarquia visual clara, sem poluição visual.
- **Cores neutras:** Base em cinzas (slate/gray), com acentos sutis de azul (`#3b82f6`) para ações primárias. Evitar cores vibrantes ou saturadas.
- **Otimização de espaço:** Uso eficiente da tela. Tabelas compactas mas legíveis. Cards com informação essencial. Sidebar colapsável em mobile.
- **Sem emojis:** Nenhum emoji no código, no texto da interface ou nos dados. Usar **Phosphor Icons** (biblioteca já definida na SPEC) para representação visual.
- **Ícones:** Sempre via `<i class="ph ph-[nome]"></i>` (Phosphor). Nunca usar caracteres Unicode como ícones.
- **Tipografia:** Fonte do sistema (`font-sans`), tamanhos consistentes (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`).
- **Feedback visual:** Estados de hover, focus, loading e disabled sempre aplicados. Toasts para mensagens de sucesso/erro.
- **Responsividade:** Mobile-first. Layout deve funcionar em 320px até 1920px.

---

## Estrutura de Tarefas

Cada tarefa é projetada para ser **o mais independente possível**. Quando houver dependência técnica inevitável (ex: uma página precisa do cliente Supabase inicializado), a tarefa inclui instruções explícitas de como mockar ou stubar a dependência, ou assume que a infraestrutura base já existe e fornece um contrato claro.

---

## Tarefa 001 — Setup do Projeto e Infraestrutura Base

**ID:** T001  
**Prioridade:** P0 (Bloqueante)  
**Estimativa:** Curta

### Descrição
Criar a estrutura de diretórios, o `index.html` shell da SPA, os arquivos de configuração (`config.js`, `state.js`) e o cliente Supabase. Esta é a **única tarefa verdadeiramente bloqueante**; todas as demais assumem que esta estrutura existe.

### Critérios de Aceitação
- [ ] Estrutura de pastas `css/`, `js/`, `js/pages/`, `assets/` criada.
- [ ] `index.html` carrega Tailwind CSS (CDN), Phosphor Icons (CDN) e `js/main.js` como módulo ES6.
- [ ] `js/config.js` exporta `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_NAME`, `APP_VERSION`.
- [ ] `js/supabase-client.js` importa `createClient` do CDN e exporta instância `supabase`.
- [ ] `js/state.js` exporta `AppState` com: `session`, `user`, `currentView`, `cache` (objeto vazio), e métodos `setSession()`, `clearSession()`, `setCache()`, `getCache()`.
- [ ] `js/main.js` inicializa o app: importa `supabase-client`, `state`, `router`; chama `supabase.auth.getSession()` e popula `AppState`.
- [ ] `css/style.css` criado (pode estar vazio ou conter resets mínimos).

### Arquivos Envolvidos
`index.html`, `css/style.css`, `js/config.js`, `js/state.js`, `js/supabase-client.js`, `js/main.js`

### Notas de Independência
Esta tarefa não depende de nenhuma outra. Todas as demais dependem dela. Deve ser executada primeiro.

---

## Tarefa 002 — Sistema de Rotas (Hash Router)

**ID:** T002  
**Prioridade:** P0 (Bloqueante)  
**Estimativa:** Curta

### Descrição
Implementar o hash router que gerencia a navegação da SPA. Cada rota carrega dinamicamente o módulo da página correspondente via `import()`.

### Critérios de Aceitação
- [ ] `js/router.js` exporta função `initRouter()`.
- [ ] Mapeamento de rotas: `#/login`, `#/dashboard`, `#/leads`, `#/clientes`, `#/orcamentos`, `#/projetos`, `#/agenda`, `#/indicacoes`.
- [ ] Rota padrão: redireciona para `#/dashboard` se autenticado, ou `#/login` se não.
- [ ] Ao trocar de hash, o router limpa `#app` (`innerHTML = ''`) e chama `render(container)` do módulo carregado.
- [ ] Lazy load funcional: `routes[path]()` retorna `import('./pages/nome.js')`.
- [ ] Listener `hashchange` registrado em `window`.

### Arquivos Envolvidos
`js/router.js`

### Notas de Independência
Depende apenas de T001 (estrutura base). Não depende de nenhuma página existir — se uma rota apontar para um módulo inexistente, exibir mensagem "Pagina em desenvolvimento" no container.

---

## Tarefa 003 — Componentes de UI Reutilizaveis

**ID:** T003  
**Prioridade:** P0 (Bloqueante)  
**Estimativa:** Curta

### Descrição
Criar a biblioteca de componentes visuais reutilizáveis que serão consumidos por todas as páginas.

### Critérios de Aceitação
- [ ] `js/ui.js` exporta objeto `UI` com os métodos:
  - `toast(message, type, duration)` — type: `info | success | warning | error`. Posição fixed top-right. Sem emojis. Usar ícones Phosphor.
  - `modal({ title, content, onConfirm, onCancel, confirmText, cancelText })` — overlay escuro, card centralizado.
  - `spinner.show(container)` e `spinner.hide(container)` — overlay semitransparente com spinner CSS.
  - `dataTable({ headers, rows, renderRow, emptyMessage })` — retorna elemento `<table>` estilizado com Tailwind.
  - `form({ id, fields, onSubmit, submitText })` — gera formulário dinamicamente a partir de array de fields.
- [ ] Todos os componentes usam cores neutras (slate/gray) com acentos azul.
- [ ] Nenhum emoji em nenhum componente.
- [ ] Ícones via Phosphor (`<i class="ph ph-[nome]"></i>`).

### Arquivos Envolvidos
`js/ui.js`

### Notas de Independência
Depende apenas de T001. Pode ser desenvolvida em paralelo com T002. As páginas subsequentes assumem que `UI` existe.

---

## Tarefa 004 — Autenticacao (Login / Logout / SignUp)

**ID:** T004  
**Prioridade:** P0 (Bloqueante)  
**Estimativa:** Curta

### Descrição
Implementar o fluxo completo de autenticação usando Supabase Auth. Inclui a página de login e o módulo de auth.

### Critérios de Aceitação
- [ ] `js/auth.js` exporta: `login(email, password)`, `signUp(email, password)`, `logout()`, `getSession()`, `onAuthStateChange(callback)`.
- [ ] `js/pages/login.js` exporta `render(container)` com formulário de login (email + senha) e link "Criar conta".
- [ ] Login bem-sucedido: chama `AppState.setSession(session)` e redireciona para `#/dashboard`.
- [ ] SignUp bem-sucedido: exibe toast "Conta criada. Faca login." e permanece na tela de login.
- [ ] Logout: chama `AppState.clearSession()` e redireciona para `#/login`.
- [ ] `main.js` registra `supabase.auth.onAuthStateChange` para sincronizar `AppState` em tempo real.
- [ ] Auth guard: se usuário não autenticado tentar acessar rota protegida, redireciona para `#/login`.
- [ ] Layout da tela de login: centrado, fundo slate-50, card branco com sombra sutil, sem emojis.

### Arquivos Envolvidos
`js/auth.js`, `js/pages/login.js`, `js/main.js` (ajuste)

### Notas de Independência
Depende de T001, T002, T003. É a última tarefa bloqueante. A partir daqui, as tarefas de páginas podem ser executadas em paralelo.

---

## Tarefa 005 — Dashboard (KPIs e Visao Geral)

**ID:** T005  
**Prioridade:** P1  
**Estimativa:** Media

### Descrição
Criar a tela inicial do sistema com cards de KPI e lista rápida de reuniões.

### Critérios de Aceitação
- [ ] `js/pages/dashboard.js` exporta `render(container)`.
- [ ] **Cards de KPI** (grid 4 colunas desktop, 1 coluna mobile):
  - Total de Leads ativos (status diferente de "Convertido" e "Perdido") — ícone `ph-users`.
  - Total de Clientes — ícone `ph-user-check`.
  - Projetos em andamento (status = "Em andamento" ou "Planejamento") — ícone `ph-kanban`.
  - Reunioes da semana (data entre hoje e hoje + 7 dias) — ícone `ph-calendar`.
- [ ] Cada card exibe o número em `text-3xl font-bold` e o rótulo em `text-sm text-slate-500`.
- [ ] **Lista rapida:** Ultimas 5 reunioes agendadas (titulo, data formatada pt-BR, hora).
- [ ] Layout com sidebar de navegacao (fixa em desktop, bottom nav em mobile).
- [ ] Dados carregados via Supabase (`.select()` + `.count()`).
- [ ] Spinner durante o carregamento.
- [ ] Sem emojis. Cores neutras com acentos azul.

### Arquivos Envolvidos
`js/pages/dashboard.js`

### Notas de Independencia
Depende de T001, T002, T003, T004. Pode ser desenvolvida em paralelo com T006-T010, desde que a estrutura base e auth estejam prontas. Se outras paginas ainda nao existirem, os links da sidebar apontam para hashes que o router ja conhece.

---

## Tarefa 006 — CRUD de Leads

**ID:** T006  
**Prioridade:** P1  
**Estimativa:** Media

### Descrição
Implementar a gestao completa de leads: listagem, cadastro, edicao, exclusao e conversao para cliente.

### Critérios de Aceitacao
- [ ] `js/pages/leads.js` exporta `render(container)`.
- [ ] **Listagem:** Tabela com colunas Nome, E-mail, Telefone, Origem, Status, Acoes.
- [ ] **Filtros:** Input de busca (nome/e-mail) + select de status.
- [ ] **Botao "Novo Lead":** Abre modal com formulario (nome, email, telefone, origem [select], status [select], notas [textarea]).
- [ ] **Editar:** Modal preenchido com dados do lead.
- [ ] **Excluir:** Modal de confirmacao → `supabase.from('leads').delete().eq('id', id)` → recarregar lista.
- [ ] **Converter:** Botao na linha da tabela → modal de confirmacao → cria registro em `clientes` com dados do lead → atualiza `leads.status` para "Convertido" → toast de sucesso.
- [ ] **Validacao:** Nome e e-mail obrigatorios. E-mail unico (tratar erro do Supabase).
- [ ] **Formatacao:** Telefone com mascara `(00) 00000-0000`.
- [ ] Paginacao se lista > 20 itens (uso de `.range()`).

### Arquivos Envolvidos
`js/pages/leads.js`, `js/utils.js` (mascara de telefone)

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005, T007-T010. A conversao para cliente cria dados na tabela `clientes`, mas nao depende da pagina de clientes estar pronta.

---

## Tarefa 007 — CRUD de Clientes

**ID:** T007  
**Prioridade:** P1  
**Estimativa:** Media

### Descrição
Implementar a gestao de clientes (convertidos de leads) com visualizacao de historico.

### Critérios de Aceitacao
- [ ] `js/pages/clientes.js` exporta `render(container)`.
- [ ] **Listagem:** Tabela com Nome, E-mail, Telefone, Data de Conversao (formatada pt-BR), Acoes.
- [ ] **Detalhes do cliente:** Modal ou secao expandida com:
  - Dados do cliente
  - Lista de orcamentos vinculados (busca em `orcamentos` por `cliente_id`)
  - Lista de projetos vinculados (busca em `projetos` por `cliente_id`)
  - Botao "Novo Orcamento" → redireciona para `#/orcamentos?cliente_id=xxx`
  - Botao "Novo Projeto" → redireciona para `#/projetos?cliente_id=xxx`
- [ ] **Origem:** Mostrar nome do lead de origem (se `lead_id` existir, buscar em `leads`).
- [ ] **Excluir:** Modal de confirmacao. Se houver orcamentos/projetos vinculados, alertar que serao excluidos (ON DELETE CASCADE).
- [ ] Sem emojis. Cores neutras.

### Arquivos Envolvidos
`js/pages/clientes.js`

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005, T006, T008-T010. A busca por orcamentos/projetos vinculados retorna vazio se essas tabelas ainda nao tiverem dados — isso e aceitavel.

---

## Tarefa 008 — CRUD de Orcamentos

**ID:** T008  
**Prioridade:** P2  
**Estimativa:** Media

### Descrição
Implementar a gestao de orcamentos vinculados a clientes.

### Critérios de Aceitacao
- [ ] `js/pages/orcamentos.js` exporta `render(container)`.
- [ ] **Listagem:** Tabela com Titulo, Cliente (nome), Valor (formatado R$), Status, Acoes.
- [ ] **Filtros:** Por status + busca por titulo.
- [ ] **Formulario:** Titulo, Cliente (select populado com `clientes`), Valor (input number step 0.01), Descricao (textarea), Status (select: "Pendente", "Aprovado", "Recusado", "Negociando").
- [ ] **Query string:** Se URL contiver `?cliente_id=xxx`, pre-selecionar cliente no select.
- [ ] **Valor:** Exibicao sempre como `R$ 0.000,00` via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- [ ] **Editar/Excluir:** Modal de edicao e confirmacao de exclusao.

### Arquivos Envolvidos
`js/pages/orcamentos.js`

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005-T007, T009-T010. O select de clientes busca dados em tempo real; se a pagina de clientes nao estiver populada, o select ficara vazio (comportamento aceitavel).

---

## Tarefa 009 — CRUD de Projetos

**ID:** T009  
**Prioridade:** P2  
**Estimativa:** Media-Alta

### Descricao
Implementar a gestao de projetos com visualizacao em lista e/ou kanban simples.

### Criterios de Aceitacao
- [ ] `js/pages/projetos.js` exporta `render(container)`.
- [ ] **Visualizacao em Lista:** Tabela com Titulo, Cliente, Responsavel, Prazo, Status, Acoes.
- [ ] **Visualizacao Kanban (opcional mas desejavel):** 3 colunas ("Planejamento", "Em andamento", "Entregue"). Cards arrastaveis via HTML5 Drag and Drop. Ao soltar em outra coluna, atualizar `status` no Supabase.
- [ ] **Formulario:** Titulo, Cliente (select), Descricao, Responsavel (text), Prazo (input type="date"), Status (select).
- [ ] **Prazo vencido:** Se `prazo < hoje` e status diferente de "Entregue", destacar linha/card em vermelho (`text-red-600` ou borda).
- [ ] **Editar/Excluir:** Modal de edicao e confirmacao de exclusao.
- [ ] Toggle entre visualizacao Lista e Kanban (botoes no topo).

### Arquivos Envolvidos
`js/pages/projetos.js`

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005-T008, T010. O kanban e um bonus; se houver duvida tecnica sobre drag-and-drop, solicitar interacao humana.

---

## Tarefa 010 — CRUD de Reunioes (Agenda)

**ID:** T010  
**Prioridade:** P2  
**Estimativa:** Media

### Descricao
Implementar a agenda de reunioes com validacao de datas.

### Criterios de Aceitacao
- [ ] `js/pages/agenda.js` exporta `render(container)`.
- [ ] **Visualizacao:** Lista agrupada por data (mais proximas primeiro). Agrupador: "Hoje", "Amanha", "Proximos dias".
- [ ] **Filtros:** Por status + busca por titulo.
- [ ] **Formulario:** Titulo, Data (date), Hora (time), Participantes (input text, separar por virgula para criar array), Pauta (textarea), Status (select).
- [ ] **Validacao:** Nao permitir data anterior a hoje no momento do cadastro/ edicao.
- [ ] **Acao rapida:** Botao "Marcar como realizada" na lista → atualiza status sem abrir modal.
- [ ] **Formatacao:** Data em `DD/MM/YYYY`, hora em `HH:MM`.
- [ ] **Editar/Excluir:** Modal de edicao e confirmacao.

### Arquivos Envolvidos
`js/pages/agenda.js`

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005-T009. Nao depende de nenhuma outra pagina.

---

## Tarefa 011 — CRUD de Indicacoes

**ID:** T011  
**Prioridade:** P3  
**Estimativa:** Curta-Media

### Descricao
Implementar o registro de indicacoes com comissao e lead vinculado.

### Criterios de Aceitacao
- [ ] `js/pages/indicacoes.js` exporta `render(container)`.
- [ ] **Listagem:** Tabela com Indicador, Lead (nome ou "—"), Comissao (R$), Status, Acoes.
- [ ] **Formulario:** Indicador (text), Lead (select opcional, populado com `leads`), Comissao (number), Status (select: "Pendente", "Paga", "Cancelada").
- [ ] **Comissao:** Formatada como moeda BRL na exibicao.
- [ ] **Regra:** Se lead for excluido, `lead_id` vira NULL (ja garantido pelo ON DELETE SET NULL no banco).
- [ ] **Editar/Excluir:** Modal de edicao e confirmacao.

### Arquivos Envolvidos
`js/pages/indicacoes.js`

### Notas de Independencia
Depende de T001-T004. Pode ser executada em paralelo com T005-T010. E a tarefa de menor prioridade; pode ser deixada para o final.

---

## Tarefa 012 — Sidebar / Navegacao Global

**ID:** T012  
**Prioridade:** P1  
**Estimativa:** Curta

### Descricao
Implementar a barra de navegacao lateral (desktop) e inferior (mobile) com links para todas as paginas.

### Criterios de Aceitacao
- [ ] Componente reutilizavel (funcao `renderSidebar()` em `js/ui.js` ou arquivo separado).
- [ ] **Desktop:** Sidebar fixa a esquerda, largura 64px (icones) ou 240px (expandida). Itens: Dashboard, Leads, Clientes, Orcamentos, Projetos, Agenda, Indicacoes, Sair.
- [ ] **Mobile:** Bottom navigation bar fixa na base (4-5 itens principais + menu "Mais").
- [ ] **Itens ativos:** Destaque visual (fundo azul claro, texto azul) na rota atual.
- [ ] **Icones:** Phosphor Icons (`ph-house`, `ph-users`, `ph-user-check`, `ph-currency-dollar`, `ph-kanban`, `ph-calendar`, `ph-handshake`, `ph-sign-out`).
- [ ] **Logout:** Botao "Sair" no final da sidebar → chama `logout()` e redireciona para `#/login`.
- [ ] Sem emojis. Cores neutras com acentos azul.

### Arquivos Envolvidos
`js/ui.js` ou `js/components/sidebar.js`, `js/main.js` (integracao)

### Notas de Independencia
Depende de T001-T004. Pode ser desenvolvida em paralelo com as paginas. Cada pagina deve incluir a sidebar ao renderizar (ou o `main.js` deve renderizar sidebar + conteudo).

---

## Tarefa 013 — Configuracao do Banco de Dados (Supabase)

**ID:** T013  
**Prioridade:** P0 (Bloqueante)  
**Estimativa:** Curta

### Descricao
Criar todas as tabelas, relacionamentos, RLS, triggers e politicas no Supabase.

### Criterios de Aceitacao
- [ ] Tabelas criadas: `leads`, `clientes`, `orcamentos`, `projetos`, `reunioes`, `indicacoes`.
- [ ] Todas as colunas conforme a SPEC (tipos, defaults, NOT NULL).
- [ ] **Foreign Keys:** `clientes.lead_id`, `orcamentos.cliente_id`, `projetos.cliente_id`, `indicacoes.lead_id`.
- [ ] **ON DELETE:** `SET NULL` para `lead_id`, `CASCADE` para `cliente_id`.
- [ ] **RLS ativado** em todas as tabelas.
- [ ] **Politicas:** `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` em cada tabela.
- [ ] **Trigger `updated_at`** na tabela `leads` (e opcionalmente nas demais).
- [ ] **Coluna `user_id`:** Tipo `uuid`, FK para `auth.users(id)`.

### Arquivos Envolvidos
SQL executado no console do Supabase (nao ha arquivo local, mas documentar em `docs/schema.sql` se desejado).

### Notas de Independencia
Pode ser feita em paralelo com T001-T004 (codigo frontend), mas os testes de integracao so funcionarao quando ambos estiverem prontos.

---

## Tarefa 014 — Testes de Integracao e Polimento

**ID:** T014  
**Prioridade:** P2  
**Estimativa:** Media

### Descricao
Testar o sistema completo, corrigir bugs, ajustar responsividade e polir a experiencia do usuario.

### Criterios de Aceitacao
- [ ] Fluxo completo testado: Login → Dashboard → Cadastrar Lead → Converter Lead → Criar Orcamento → Criar Projeto → Agendar Reuniao.
- [ ] Teste de responsividade em 320px, 768px, 1024px, 1920px.
- [ ] Verificar ausencia de emojis em toda a interface.
- [ ] Verificar consistencia de cores (apenas neutras + azul).
- [ ] Verificar que todos os toasts usam icones Phosphor.
- [ ] Verificar que o spinner aparece em todas as operacoes async.
- [ ] Verificar RLS: dados de um usuario nao aparecem para outro.
- [ ] Documentar no `BACKLOG.md` todas as correcoes realizadas.

### Arquivos Envolvidos
Todos.

### Notas de Independencia
Esta tarefa so pode ser executada apos T001-T013 concluidas. E a tarefa final.

---

## Mapa de Dependencias

```
T001 (Setup Base)
  |
  +-- T002 (Router)
  |     |
  |     +-- T003 (UI Components)
  |           |
  |           +-- T004 (Auth)
  |                 |
  |                 +-- T005 (Dashboard) -------- T012 (Sidebar)
  |                 +-- T006 (Leads)
  |                 +-- T007 (Clientes)
  |                 +-- T008 (Orcamentos)
  |                 +-- T009 (Projetos)
  |                 +-- T010 (Agenda)
  |                 +-- T011 (Indicacoes)
  |
  +-- T013 (Banco Supabase)  [paralelo ao frontend]

T014 (Testes e Polimento)  [depende de TODAS]
```

> **Nota:** T005 a T011 sao **independentes entre si** e podem ser desenvolvidas em paralelo apos T004.

---

## Log de Alteracoes

<!-- O agente de IA deve registrar aqui toda alteracao, correcao ou ajuste realizado -->

