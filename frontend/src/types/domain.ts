// ==============================================================================
// PresenX — Tipagem do Domínio (Conforme DATA_MODEL.md e DOMAIN.md)
// ==============================================================================

export type UserRole = 'admin' | 'manager' | 'operator';

export type EventType = 'identification' | 'entry' | 'exit';

export type AccessResult = 'allowed' | 'denied';

export interface Organization {
  id: string;
  name: string;
  type: string; // 'school' | 'company' | 'factory'
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

/**
 * Setor: vínculo administrativo/profissional.
 * Regra D003: Setor NÃO é localização.
 */
export interface Sector {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
}

/**
 * Área: espaço físico configurado no ambiente.
 */
export interface Area {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
}

/**
 * Pessoa identificada pelo PresenX.
 * Independente conceitualmente do método de identificação.
 */
export interface Person {
  id: string;
  organization_id: string;
  sector_id?: string;
  name: string;
  identifier?: string; // Credencial/RFID
  active: boolean;
  created_at: string;
  sector?: Sector;
}

/**
 * Permissão: relaciona pessoa e área autorizada.
 * Regra D004: Ter autorização para uma área não significa estar nela.
 */
export interface Permission {
  id: string;
  person_id: string;
  area_id: string;
  created_at: string;
  area?: Area;
}

/**
 * Ponto de controle: ponto físico onde eventos são registrados.
 * Regra D005: Não é obrigatório dispositivo em cada sala.
 */
export interface ControlPoint {
  id: string;
  organization_id: string;
  area_id?: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  area?: Area;
}

/**
 * Dispositivo: equipamento gerador de leituras (ex: ESP32 + RC522).
 */
export interface Device {
  id: string;
  control_point_id?: string;
  name: string;
  device_key: string;
  type: string;
  active: boolean;
  last_seen_at?: string;
  created_at: string;
  control_point?: ControlPoint;
}

/**
 * Evento: fonte principal e imutável do histórico.
 */
export interface Event {
  id: string;
  organization_id: string;
  person_id: string | null;
  identifier?: string;
  device_id?: string;
  control_point_id?: string;
  event_type: EventType;
  access_result: AccessResult;
  occurred_at: string;
  metadata?: Record<string, unknown>;
  person?: Person;
  control_point?: ControlPoint;
}

/**
 * Última localização registrada derivada de eventos válidos.
 * Regra D002: Não representa presença física contínua ou garantida.
 */
export interface LastRecordedLocation {
  person_id: string;
  person_name: string;
  identifier?: string;
  sector_name?: string;
  area_name?: string;
  control_point_name?: string;
  last_event_at?: string;
  last_event_type?: EventType;
  last_access_result?: AccessResult;
}
