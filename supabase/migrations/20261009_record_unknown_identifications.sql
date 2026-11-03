-- Permite registrar tentativas com cartões ainda não associados a uma pessoa.
ALTER TABLE public.events
    ALTER COLUMN person_id DROP NOT NULL;

ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS identifier TEXT;

CREATE INDEX IF NOT EXISTS idx_events_identifier
    ON public.events(organization_id, identifier);
