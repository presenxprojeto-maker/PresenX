-- ==============================================================================
-- PresenX 2.0 — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Conforme especificações em DATA_MODEL.md e ARCHITECTURE.md
-- ==============================================================================

-- 1. Habilita extensão para UUIDs se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('identification', 'entry', 'exit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_result AS ENUM ('allowed', 'denied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. ORGANIZATIONS
-- Representa a instituição, empresa ou escola (ex.: CETEP/LNAB, Empresa Alpha)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'school', -- 'school', 'company', 'factory', etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. PROFILES
-- Usuários do sistema de gestão, vinculado ao auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. SECTORS (Setor principal)
-- Vínculo administrativo/profissional (ex.: Manutenção, Docência, Produção, Estoque)
-- Regra D003: Setor NÃO é localização.
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. AREAS
-- Espaço físico do ambiente (ex.: Laboratório 1, Oficina, Sala dos Professores, Produção)
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. PEOPLE
-- Pessoas cadastradas no PresenX (professores, funcionários, alunos, gestores)
-- Conceitualmente independente do identificador físico (RFID, cartão, etc.)
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    identifier TEXT UNIQUE, -- Código da credencial (ex.: UID RFID)
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. PERMISSIONS
-- Relaciona pessoa e área autorizada
-- Regra D004: Ter autorização para uma área não significa estar nela.
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
    identifier TEXT, -- UID/cartão apresentado, inclusive quando não há pessoa cadastrada
    area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(person_id, area_id)
);

-- 9. CONTROL POINTS (Pontos de controle)
-- Ponto físico onde identificações acontecem (entrada, saída, acesso a laboratório)
-- Regra D005: Não é obrigatório dispositivo em cada sala.
CREATE TABLE IF NOT EXISTS public.control_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. DEVICES (Dispositivos)
-- Equipamentos associados a pontos de controle (ex.: ESP32 + RC522)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_point_id UUID REFERENCES public.control_points(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    device_key TEXT NOT NULL UNIQUE, -- Chave de autenticação do hardware
    type TEXT NOT NULL DEFAULT 'esp32_rc522',
    active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. EVENTS (Eventos)
-- Fonte principal e imutável de histórico
-- Registra ocorrências: entrada, saída, identificação, acessos permitidos e negados
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    control_point_id UUID REFERENCES public.control_points(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    access_result access_result NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices de performance para consultas de eventos frequentes
CREATE INDEX IF NOT EXISTS idx_events_org_occurred ON public.events(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_person_occurred ON public.events(person_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_identifier ON public.events(organization_id, identifier);
CREATE INDEX IF NOT EXISTS idx_people_identifier ON public.people(identifier);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- Isolamento estrito por organização conforme ARCHITECTURE.md
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Helper function: obtém a organization_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas para Profiles
CREATE POLICY "Profiles são visíveis dentro da mesma organização"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_current_user_org());

-- Políticas para Organizations
CREATE POLICY "Usuário visualiza sua própria organização"
    ON public.organizations FOR SELECT
    USING (id = public.get_current_user_org());

-- Políticas para Sectors
CREATE POLICY "Sectors por organização"
    ON public.sectors FOR ALL
    USING (organization_id = public.get_current_user_org());

-- Políticas para Areas
CREATE POLICY "Areas por organização"
    ON public.areas FOR ALL
    USING (organization_id = public.get_current_user_org());

-- Políticas para People
CREATE POLICY "People por organização"
    ON public.people FOR ALL
    USING (organization_id = public.get_current_user_org());

-- Políticas para Permissions
CREATE POLICY "Permissions por organização"
    ON public.permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.people p 
            WHERE p.id = permissions.person_id 
              AND p.organization_id = public.get_current_user_org()
        )
    );

-- Políticas para Control Points
CREATE POLICY "Control Points por organização"
    ON public.control_points FOR ALL
    USING (organization_id = public.get_current_user_org());

-- Políticas para Devices
CREATE POLICY "Devices por organização"
    ON public.devices FOR ALL
    USING (
        control_point_id IS NULL OR EXISTS (
            SELECT 1 FROM public.control_points cp
            WHERE cp.id = devices.control_point_id
              AND cp.organization_id = public.get_current_user_org()
        )
    );

-- Políticas para Events
CREATE POLICY "Events por organização"
    ON public.events FOR ALL
    USING (organization_id = public.get_current_user_org());

-- ==============================================================================
-- 13. VIEW: ÚLTIMA LOCALIZAÇÃO REGISTRADA
-- Conforme DECISIONS.md: "Última localização não é campo direto em Person, é derivada"
-- ==============================================================================
CREATE OR REPLACE VIEW public.vw_people_last_location AS
SELECT DISTINCT ON (p.id)
    p.id AS person_id,
    p.name AS person_name,
    p.identifier,
    p.organization_id,
    s.name AS sector_name,
    e.occurred_at AS last_event_at,
    e.event_type AS last_event_type,
    e.access_result AS last_access_result,
    cp.name AS control_point_name,
    a.name AS area_name
FROM public.people p
LEFT JOIN public.sectors s ON p.sector_id = s.id
LEFT JOIN public.events e ON p.id = e.person_id AND e.access_result = 'allowed'
LEFT JOIN public.control_points cp ON e.control_point_id = cp.id
LEFT JOIN public.areas a ON cp.area_id = a.id
ORDER BY p.id, e.occurred_at DESC NULLS LAST;
