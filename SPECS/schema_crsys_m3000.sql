-- ============================================================
-- SCHEMA SQL — CRSys M3000
-- Sistema CRM Web para Agência Digital
-- Stack: Supabase (PostgreSQL 15+)
-- ============================================================
-- Instruções:
-- 1. Acesse o SQL Editor do seu projeto Supabase
-- 2. Cole todo este script e execute (New Query → Run)
-- 3. Verifique em Table Editor se todas as tabelas apareceram
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTENSÕES
-- ------------------------------------------------------------
extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 2. FUNÇÃO AUXILIAR: updated_at automático
-- ------------------------------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- 3. TABELA: leads
-- ------------------------------------------------------------
create table if not exists leads (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    email text not null,
    telefone text,
    origem text not null default 'Outro',
    status text not null default 'Novo',
    notas text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

-- Trigger updated_at
create trigger trg_leads_updated_at
    before update on leads
    for each row
    execute function update_updated_at_column();

-- Valores permitidos para origem (check constraint opcional)
-- Remova ou ajuste conforme necessidade da agência
alter table leads
    add constraint chk_leads_origem
    check (origem in ('Instagram', 'Site', 'Indicação', 'Outro', 'Facebook', 'LinkedIn', 'Google'));

alter table leads
    add constraint chk_leads_status
    check (status in ('Novo', 'Em contato', 'Proposta enviada', 'Convertido', 'Perdido'));

-- Index para busca rápida
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- ------------------------------------------------------------
-- 4. TABELA: clientes
-- ------------------------------------------------------------
create table if not exists clientes (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references leads(id) on delete set null,
    nome text not null,
    email text not null,
    telefone text,
    data_conversao timestamptz default now(),
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

-- Index
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_lead_id ON clientes(lead_id);

-- ------------------------------------------------------------
-- 5. TABELA: orcamentos
-- ------------------------------------------------------------
create table if not exists orcamentos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references clientes(id) on delete cascade,
    titulo text not null,
    valor numeric(12,2),
    descricao text,
    status text not null default 'Pendente',
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

alter table orcamentos
    add constraint chk_orcamentos_status
    check (status in ('Pendente', 'Aprovado', 'Recusado', 'Negociando'));

CREATE INDEX IF NOT EXISTS idx_orcamentos_user_id ON orcamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);

-- ------------------------------------------------------------
-- 6. TABELA: projetos
-- ------------------------------------------------------------
create table if not exists projetos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references clientes(id) on delete cascade,
    titulo text not null,
    descricao text,
    status text not null default 'Planejamento',
    prazo date,
    responsavel text,
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

alter table projetos
    add constraint chk_projetos_status
    check (status in ('Planejamento', 'Em andamento', 'Revisão', 'Entregue', 'Pausado', 'Cancelado'));

CREATE INDEX IF NOT EXISTS idx_projetos_user_id ON projetos(user_id);
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_prazo ON projetos(prazo);

-- ------------------------------------------------------------
-- 7. TABELA: reunioes
-- ------------------------------------------------------------
create table if not exists reunioes (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    data date not null,
    hora time not null,
    participantes text[] default '{}',
    pauta text,
    status text not null default 'Agendada',
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

alter table reunioes
    add constraint chk_reunioes_status
    check (status in ('Agendada', 'Realizada', 'Cancelada', 'Remarcada'));

CREATE INDEX IF NOT EXISTS idx_reunioes_user_id ON reunioes(user_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data);
CREATE INDEX IF NOT EXISTS idx_reunioes_status ON reunioes(status);

-- ------------------------------------------------------------
-- 8. TABELA: indicacoes
-- ------------------------------------------------------------
create table if not exists indicacoes (
    id uuid primary key default gen_random_uuid(),
    indicador text not null,
    lead_id uuid references leads(id) on delete set null,
    comissao numeric(12,2),
    status text not null default 'Pendente',
    created_at timestamptz default now(),
    user_id uuid references auth.users(id) on delete cascade
);

alter table indicacoes
    add constraint chk_indicacoes_status
    check (status in ('Pendente', 'Paga', 'Cancelada'));

CREATE INDEX IF NOT EXISTS idx_indicacoes_user_id ON indicacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_lead_id ON indicacoes(lead_id);

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) — OBRIGATÓRIO
-- ============================================================

-- Habilitar RLS em todas as tabelas
alter table leads enable row level security;
alter table clientes enable row level security;
alter table orcamentos enable row level security;
alter table projetos enable row level security;
alter table reunioes enable row level security;
alter table indicacoes enable row level security;

-- Política para leads
CREATE POLICY "Usuários só veem seus próprios leads"
    ON leads FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para clientes
CREATE POLICY "Usuários só veem seus próprios clientes"
    ON clientes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para orçamentos
CREATE POLICY "Usuários só veem seus próprios orçamentos"
    ON orcamentos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para projetos
CREATE POLICY "Usuários só veem seus próprios projetos"
    ON projetos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para reuniões
CREATE POLICY "Usuários só veem suas próprias reuniões"
    ON reunioes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para indicações
CREATE POLICY "Usuários só veem suas próprias indicações"
    ON indicacoes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. FUNÇÃO: Preencher user_id automaticamente no INSERT
-- ============================================================
-- Isso garante que o user_id seja sempre o do usuário autenticado,
-- mesmo que o frontend não envie o campo.

create or replace function set_user_id_on_insert()
returns trigger as $$
begin
    new.user_id = auth.uid();
    return new;
end;
$$ language plpgsql security definer;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER trg_leads_set_user_id
    BEFORE INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER trg_clientes_set_user_id
    BEFORE INSERT ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER trg_orcamentos_set_user_id
    BEFORE INSERT ON orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER trg_projetos_set_user_id
    BEFORE INSERT ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER trg_reunioes_set_user_id
    BEFORE INSERT ON reunioes
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER trg_indicacoes_set_user_id
    BEFORE INSERT ON indicacoes
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_insert();

-- ============================================================
-- 11. DADOS DE EXEMPLO (OPCIONAL — para testes iniciais)
-- ============================================================
-- Execute apenas após criar um usuário de teste no Authentication
-- Substitua 'SEU-USER-ID-AQUI' pelo UUID real do usuário

/*
-- Exemplo de leads
insert into leads (nome, email, telefone, origem, status, notas, user_id)
values
    ('Ana Silva', 'ana@email.com', '(11) 98765-4321', 'Instagram', 'Novo', 'Interessada em site institucional', 'SEU-USER-ID-AQUI'),
    ('Bruno Costa', 'bruno@email.com', '(21) 91234-5678', 'Indicação', 'Em contato', 'Precisa de e-commerce', 'SEU-USER-ID-AQUI'),
    ('Carla Mendes', 'carla@email.com', '(31) 99876-5432', 'Site', 'Proposta enviada', 'Aguardando aprovação do orçamento', 'SEU-USER-ID-AQUI');

-- Exemplo de cliente (convertido de lead)
insert into clientes (lead_id, nome, email, telefone, user_id)
select id, nome, email, telefone, user_id
from leads
where email = 'carla@email.com';

-- Atualizar lead para Convertido
update leads set status = 'Convertido' where email = 'carla@email.com';
*/

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
