import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply(405, { ok: false, message: 'Método não permitido.' });

  const deviceKey = request.headers.get('x-device-key')?.trim();
  if (!deviceKey) return reply(401, { ok: false, message: 'Leitor não autenticado.' });

  let identifier = '';
  try {
    const payload = await request.json();
    identifier = String(payload.identifier || payload.uid || '').trim().toUpperCase();
  } catch {
    return reply(400, { ok: false, message: 'Envie um JSON válido.' });
  }
  if (!/^[A-Z0-9_-]{1,80}$/.test(identifier)) {
    return reply(400, { ok: false, message: 'Código do cartão inválido.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return reply(500, { ok: false, message: 'A função não está configurada.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, active, control_point_id')
    .eq('device_key', deviceKey)
    .maybeSingle();

  if (deviceError) return reply(500, { ok: false, message: 'Não foi possível validar o leitor.' });
  if (!device) return reply(401, { ok: false, message: 'Chave do leitor inválida.' });
  if (!device.active) return reply(403, { ok: false, message: 'Leitor desativado.' });
  if (!device.control_point_id) return reply(409, { ok: false, message: 'Leitor sem ponto de controle associado.' });

  const [{ data: point, error: pointError }, { error: pingError }] = await Promise.all([
    supabase.from('control_points')
      .select('id, organization_id, area_id, name, active')
      .eq('id', device.control_point_id)
      .maybeSingle(),
    supabase.from('devices').update({ last_seen_at: new Date().toISOString() }).eq('id', device.id),
  ]);

  if (pointError || pingError) return reply(500, { ok: false, message: 'Não foi possível consultar o ponto de controle.' });
  if (!point || !point.active || !point.area_id) {
    return reply(409, { ok: false, message: 'Ponto de controle inativo ou sem área.' });
  }

  const { data: person, error: personError } = await supabase
    .from('people')
    .select('id, name, active')
    .eq('organization_id', point.organization_id)
    .eq('identifier', identifier)
    .maybeSingle();
  if (personError) return reply(500, { ok: false, message: 'Não foi possível consultar o cadastro.' });

  let allowed = Boolean(person?.active);
  let reason = !person
    ? 'Cartão não cadastrado'
    : !person.active
      ? 'Cadastro inativo'
      : '';

  if (person?.active) {
    const { data: permission, error: permissionError } = await supabase
      .from('permissions')
      .select('id')
      .eq('person_id', person.id)
      .eq('area_id', point.area_id)
      .maybeSingle();
    if (permissionError) return reply(500, { ok: false, message: 'Não foi possível validar a permissão.' });
    allowed = Boolean(permission);
    if (!allowed) reason = 'Sem permissão para esta área';
  }

  const pointName = String(point.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const eventType = /(^|\b)(saida|exit)(\b|$)/.test(pointName)
    ? 'exit'
    : /(^|\b)(entrada|entry)(\b|$)/.test(pointName)
      ? 'entry'
      : 'identification';
  const occurredAt = new Date().toISOString();
  const { error: eventError } = await supabase.from('events').insert({
    organization_id: point.organization_id,
    person_id: person?.id || null,
    identifier,
    device_id: device.id,
    control_point_id: point.id,
    event_type: eventType,
    access_result: allowed ? 'allowed' : 'denied',
    occurred_at: occurredAt,
    metadata: allowed ? { source: 'esp32_rfid' } : { source: 'esp32_rfid', reason },
  });

  if (eventError) return reply(500, { ok: false, message: 'A leitura não pôde ser registrada.' });

  return reply(200, {
    ok: true,
    allowed,
    name: person?.name || 'Não identificado',
    action: eventType === 'entry' ? 'entrada' : eventType === 'exit' ? 'saida' : 'identificacao',
    message: allowed ? 'Acesso autorizado.' : reason,
    occurred_at: occurredAt,
  });
});
