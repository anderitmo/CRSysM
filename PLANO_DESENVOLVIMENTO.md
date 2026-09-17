# 🚀 Plano de Desenvolvimento — CRSys M3000

**Projeto:** Sistema CRM Web para Agência Digital
**Versão:** 1.0
**Stack:** HTML5 + CSS3 + Tailwind CSS + Vanilla JS (ES Modules) + Supabase
**Design System:** Interfaces Google Stitch (`THEME/`)

---

## 1. Visão Geral e Alinhamento Estratégico

O **CRSys M3000** é uma Single Page Application (SPA) responsiva para gestão comercial e operacional de agências digitais. O sistema integra prospecção de leads, gestão de carteira de clientes, elaboração de orçamentos, execução de projetos em formato Kanban, agendamento de reuniões e programa de indicações.

Este Plano de Desenvolvimento combina os requisitos da **SPEC Técnica** (`SPECS/SPEC_CRSys_M3000.md`), o **Backlog de Tarefas** (`SPECS/TAREFAS.md`), o **Schema de Banco de Dados** (`SPECS/schema_crsys_m3000.sql`) e os protótipos de alta fidelidade do **Google Stitch** (`THEME/`).

---

## 2. Análise do Design System e Interfaces (Google Stitch)

A pasta `THEME/` possui 4 variações/telas de referência geradas pelo Google Stitch:
1. **`dashboard_corporativo/`**: Dashboard completo com métricas avançadas, gráficos SVG de funil e widgets financeiros.
2. **`dashboard_corporativo_enxuto/`**: Dashboard refinado com paleta verde oliva/slate, cards Kanban limpos (`rounded-2xl`, sombras suaves), resumo de reuniones da semana e acompanhamento de metas.
3. **`gest_o_de_leads_fundo_branco/`**: Tabela de alta densidade de leads, métricas de conversão e **Slide-over Drawer / Contextual Modal (380-420px)** para cadastro, edição e conversão rápida de lead em cliente.
4. **`quadro_de_projetos_kanban_fundo_branco/`**: Matriz Kanban (3 colunas: *Planejamento*, *Em Andamento*, *Entregue*) com HTML5 Drag & Drop, busca viva e modal de criação de projetos.

### 2.1 Padrões Visuais e Identidade (Theme Setup)
- **Tipografia:**
  - Títulos/Headlines: `Outfit` (`font-headline-sm`, `font-headline-md`, `font-headline-lg`, `font-headline-xl`).
  - Corpo/Labels/Tabelas: `Open Sans` (`font-body-sm`, `font-body-md`, `font-body-lg`, `font-data-tabular`).
- **Ícones:**
  - `Material Symbols Outlined` (Google Icons via CDN) e `Phosphor Icons` (`ph ph-*`) para suporte completo às interfaces do Stitch.
- **Cores Úteis (Tailwind Extended Palette):**
  - Primary / Verde Oliva: `#768c1a` / `#516300`
  - Secondary / Soft Ochre: `#8c7304`
  - Canvas / Background: `#f8fafc` (`slate-50`)
  - Cards e Painéis: `#ffffff` (`bg-surface-container-lowest`) com bordas suaves `border-slate-200` / `border-border-subtle` (`#e2e8f0`).

---

## 3. Arquitetura de Software e Estrutura de Diretórios

A aplicação seguirá a arquitetura **SPA Client-Side Rendering (Zero Build Step)** utilizando ES Modules nativos e CDN:

```
/
├── index.html                  # Shell SPA — carrega CSS, Fontes, CDN Supabase, Tailwind
├── css/
│   └── style.css               # Estilos customizados, resets e animações
├── js/
│   ├── config.js               # Constantes globais (SUPABASE_URL, ANON_KEY)
│   ├── state.js                # AppState centralizado (sessão, usuário, cache)
│   ├── supabase-client.js      # Instância cliente Supabase
│   ├── router.js               # Hash router (#/login, #/dashboard, etc.)
│   ├── auth.js                 # Métodos de autenticação Supabase Auth
│   ├── utils.js                # Helpers (formatação de moeda R$, máscaras, datas)
│   ├── ui.js                   # Componentes globais (Sidebar Stitch, Header, Toast, Modal, Spinner)
│   └── pages/
│       ├── login.js            # View: Tela de Login/Registro
│       ├── dashboard.js        # View: Painel Geral (Layout Stitch Enxuto)
│       ├── leads.js            # View: Gestão de Leads com Drawer Stitch
│       ├── clientes.js         # View: Carteira de Clientes + Histórico
│       ├── orcamentos.js       # View: Orçamentos vinculados
│       ├── projetos.js         # View: Quadro Kanban Drag & Drop
│       ├── agenda.js           # View: Agenda de Reuniões
│       └── indicacoes.js       # View: Programa de Indicações
└── SPECS/                      # Documentação técnica e especificações
```

---

## 4. Mapeamento de Telas vs. Supabase PostgreSQL

| Rota Hash | View JS | Componentes Stitch Utilizados | Tabela Supabase Principais | Operações Realizadas |
|-----------|---------|-------------------------------|----------------------------|----------------------|
| `#/login` | `login.js` | Card limpo centralizado, inputs com ícones | `auth.users` | `signInWithPassword`, `signUp` |
| `#/dashboard` | `dashboard.js` | 4 Cards KPI, Próximas Reuniões, Funil de Vendas, Metas | `leads`, `clientes`, `projetos`, `reunioes` | Counts, listagem das 5 reuniões da semana |
| `#/leads` | `leads.js` | Tabela CRM Matrix, Filtros, Metrics Bar, **Drawer Slide-over** | `leads`, `clientes` | CRUD completo + Ação "Converter em Cliente" |
| `#/clientes` | `clientes.js` | Tabela Clientes, Badge Lead Origem, Detalhes Modal | `clientes`, `leads`, `orcamentos`, `projetos` | CRUD + Modal de histórico expandido |
| `#/orcamentos` | `orcamentos.js` | Tabela de propostas, Form de orçamento, Pre-select Cliente | `orcamentos`, `clientes` | CRUD + Validação de Moeda (R$) |
| `#/projetos` | `projetos.js` | **Matriz Kanban 3 colunas**, Drag & Drop, Modal Novo Projeto | `projetos`, `clientes` | CRUD + Update instantâneo de status via drag |
| `#/agenda` | `agenda.js` | Cards de reuniões agrupados por data, Ação rápida "Concluir" | `reunioes` | CRUD + Validação de data futura |
| `#/indicacoes` | `indicacoes.js` | Tabela de Indicações, Comissão em R$, Select de Lead | `indicacoes`, `leads` | CRUD + Cálculo/Status de comissão |

---

## 5. Cronograma de Execução por Fases

### Fase 1: Setup da Infraestrutura e Design System (Tarefas T001, T002, T003, T004, T012)
1. **Shell SPA e Dependências:** Configurar `index.html` com Tailwind CDN, Google Fonts (`Outfit`, `Open Sans`), Material Symbols Outlined e Supabase Client JS.
2. **State & Router:** Implementar `js/state.js` e `js/router.js` com guard de autenticação e carregamento dinâmico de módulos.
3. **UI Engine (`js/ui.js`):** Construir a Sidebar Stitch reutilizável (desktop/mobile), Header global com busca, Toasts de notificação, Modais e Drawers laterais.
4. **Autenticação:** Finalizar `js/auth.js` e `js/pages/login.js`.

### Fase 2: Implementação dos Módulos Core (Tarefas T005, T006, T007)
1. **Dashboard (`js/pages/dashboard.js`):** Integrar métricas reais do banco Supabase no layout Stitch Enxuto (Cards KPI, Lista das próximas reuniões, barras de progresso de metas).
2. **Leads (`js/pages/leads.js`):** Construir a tabela de alta densidade e o **Slide-over Drawer** do Stitch para inclusão, edição e conversão atômica de Lead para Cliente.
3. **Clientes (`js/pages/clientes.js`):** Implementar listagem e modal detalhada com vínculo de orçamentos e projetos.

### Fase 3: Módulos Operacionais e Avançados (Tarefas T008, T009, T010, T011)
1. **Orçamentos (`js/pages/orcamentos.js`):** Tabela e formulário com pré-seleção via query string `?cliente_id=xxx`.
2. **Projetos Kanban (`js/pages/projetos.js`):** Implementar o quadro Kanban Stitch com colunas (*Planejamento*, *Em Andamento*, *Entregue*), suporte a Drag & Drop nativo HTML5 e destaque de prazos vencidos em vermelho.
3. **Agenda (`js/pages/agenda.js`):** Gestão de reuniões com validação de data/hora no envio.
4. **Indicações (`js/pages/indicacoes.js`):** Registro de parceiros/indicadores e cálculo de comissões.

### Fase 4: Validação, Pre-commit e Entrega Final (Tarefa T014)
1. Execução de testes de integração E2E dos fluxos principais.
2. Verificação do alinhamento visual com os protótipos Stitch.
3. Execução das instruções de pre-commit.
4. Submissão do código e documentação finalizada.

---

> **Nota de Conformidade:** Este plano foi elaborado seguindo rigorosamente a SPEC Técnica e as diretrizes visuais do Google Stitch fornecidas na pasta `THEME/`.
