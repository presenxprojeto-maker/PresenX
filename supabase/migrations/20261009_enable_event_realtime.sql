-- Habilita atualização imediata do histórico no app após leituras dos dispositivos.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = 'events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    END IF;
END;
$$;
