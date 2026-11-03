-- Salva uma pessoa e suas permissões em uma única transação.
-- Execute no SQL Editor do Supabase depois de aplicar schema.sql.
CREATE OR REPLACE FUNCTION public.save_person_with_permissions(
    p_person_id UUID,
    p_organization_id UUID,
    p_name TEXT,
    p_sector_id UUID,
    p_identifier TEXT,
    p_active BOOLEAN,
    p_authorized_area_ids UUID[]
)
RETURNS public.people
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    saved_person public.people;
    requested_area_count INTEGER;
    valid_area_count INTEGER;
BEGIN
    IF auth.uid() IS NULL OR p_organization_id IS DISTINCT FROM public.get_current_user_org() THEN
        RAISE EXCEPTION 'Organização não autorizada.' USING ERRCODE = '42501';
    END IF;

    IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'O nome da pessoa é obrigatório.' USING ERRCODE = '22023';
    END IF;

    IF p_sector_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.sectors
        WHERE id = p_sector_id AND organization_id = p_organization_id
    ) THEN
        RAISE EXCEPTION 'O setor selecionado não pertence à organização.' USING ERRCODE = '23503';
    END IF;

    SELECT count(DISTINCT requested.area_id), count(DISTINCT requested.area_id)
      INTO requested_area_count, valid_area_count
      FROM unnest(COALESCE(p_authorized_area_ids, ARRAY[]::UUID[])) AS requested(area_id)
      JOIN public.areas ON areas.id = requested.area_id AND areas.organization_id = p_organization_id;

    IF requested_area_count <> cardinality(COALESCE(p_authorized_area_ids, ARRAY[]::UUID[]))
       OR valid_area_count <> requested_area_count THEN
        RAISE EXCEPTION 'Uma ou mais áreas não pertencem à organização.' USING ERRCODE = '23503';
    END IF;

    IF p_person_id IS NULL THEN
        INSERT INTO public.people (organization_id, sector_id, name, identifier, active)
        VALUES (p_organization_id, p_sector_id, trim(p_name), NULLIF(upper(trim(COALESCE(p_identifier, ''))), ''), p_active)
        RETURNING * INTO saved_person;
    ELSE
        UPDATE public.people
           SET sector_id = p_sector_id,
               name = trim(p_name),
               identifier = NULLIF(upper(trim(COALESCE(p_identifier, ''))), ''),
               active = p_active
         WHERE id = p_person_id AND organization_id = p_organization_id
         RETURNING * INTO saved_person;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Pessoa não encontrada nesta organização.' USING ERRCODE = 'P0002';
        END IF;

        DELETE FROM public.permissions WHERE person_id = p_person_id;
    END IF;

    INSERT INTO public.permissions (person_id, area_id)
    SELECT saved_person.id, requested.area_id
      FROM unnest(COALESCE(p_authorized_area_ids, ARRAY[]::UUID[])) AS requested(area_id);

    RETURN saved_person;
END;
$$;

REVOKE ALL ON FUNCTION public.save_person_with_permissions(UUID, UUID, TEXT, UUID, TEXT, BOOLEAN, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_person_with_permissions(UUID, UUID, TEXT, UUID, TEXT, BOOLEAN, UUID[]) TO authenticated, service_role;
