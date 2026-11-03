import type {
  Organization,
  Profile,
  Sector,
  Area,
  Person,
  Permission,
  ControlPoint,
  Device,
  Event,
  LastRecordedLocation,
  EventType,
} from '../types/domain';
import { supabase } from '../lib/supabase';

// Dados de demonstração usados quando não há organização configurada
const INITIAL_ORG: Organization = {
  id: 'org-demo',
  name: 'Organização de demonstração',
  type: 'organization',
  created_at: new Date().toISOString(),
};

const INITIAL_PROFILE: Profile = {
  id: 'prof-admin',
  organization_id: INITIAL_ORG.id,
  name: 'Coordenação Geral',
  role: 'admin',
  created_at: new Date().toISOString(),
};

const INITIAL_SECTORS: Sector[] = [
  { id: 'sec-info', organization_id: INITIAL_ORG.id, name: 'Operações', description: 'Atividades operacionais e de produção', created_at: new Date().toISOString() },
  { id: 'sec-eletro', organization_id: INITIAL_ORG.id, name: 'Atendimento', description: 'Atendimento a pessoas e visitantes', created_at: new Date().toISOString() },
  { id: 'sec-admin', organization_id: INITIAL_ORG.id, name: 'Administração & Gestão', description: 'Gestão e apoio administrativo', created_at: new Date().toISOString() },
  { id: 'sec-manut', organization_id: INITIAL_ORG.id, name: 'Manutenção', description: 'Manutenção de instalações e equipamentos', created_at: new Date().toISOString() },
];

const INITIAL_AREAS: Area[] = [
  { id: 'area-portaria', organization_id: INITIAL_ORG.id, name: 'Entrada principal', description: 'Registro de entrada e saída', created_at: new Date().toISOString() },
  { id: 'area-lab-redes', organization_id: INITIAL_ORG.id, name: 'Área técnica', description: 'Espaço para atividades técnicas', created_at: new Date().toISOString() },
  { id: 'area-lab-soft', organization_id: INITIAL_ORG.id, name: 'Área operacional', description: 'Atividades de operação e produção', created_at: new Date().toISOString() },
  { id: 'area-oficina', organization_id: INITIAL_ORG.id, name: 'Oficina de manutenção', description: 'Manutenção de equipamentos', created_at: new Date().toISOString() },
  { id: 'area-prof', organization_id: INITIAL_ORG.id, name: 'Área administrativa', description: 'Escritórios e gestão', created_at: new Date().toISOString() },
];

const INITIAL_CONTROL_POINTS: ControlPoint[] = [
  { id: 'cp-entrada', organization_id: INITIAL_ORG.id, area_id: 'area-portaria', name: 'Leitor de entrada', description: 'Registro de entrada de pessoas', active: true, created_at: new Date().toISOString() },
  { id: 'cp-lab-redes', organization_id: INITIAL_ORG.id, area_id: 'area-lab-redes', name: 'Acesso à área técnica', description: 'Porta com leitor RFID', active: true, created_at: new Date().toISOString() },
  { id: 'cp-oficina', organization_id: INITIAL_ORG.id, area_id: 'area-oficina', name: 'Acesso à oficina', description: 'Acesso restrito a pessoas autorizadas', active: true, created_at: new Date().toISOString() },
  { id: 'cp-saida', organization_id: INITIAL_ORG.id, area_id: 'area-portaria', name: 'Leitor de saída', description: 'Registro de saída de pessoas', active: true, created_at: new Date().toISOString() },
];

const INITIAL_DEVICES: Device[] = [
  { id: 'dev-01', control_point_id: 'cp-entrada', name: 'ESP32 Leitor de entrada', device_key: 'px_key_portaria_in', type: 'esp32_rc522', active: true, last_seen_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'dev-02', control_point_id: 'cp-lab-redes', name: 'ESP32 Área técnica', device_key: 'px_key_lab_redes', type: 'esp32_rc522', active: true, last_seen_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), created_at: new Date().toISOString() },
  { id: 'dev-03', control_point_id: 'cp-oficina', name: 'ESP32 Oficina', device_key: 'px_key_oficina', type: 'esp32_rc522', active: true, last_seen_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), created_at: new Date().toISOString() },
  { id: 'dev-04', control_point_id: 'cp-saida', name: 'ESP32 Leitor de saída', device_key: 'px_key_portaria_out', type: 'esp32_rc522', active: true, last_seen_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

const INITIAL_PEOPLE: Person[] = [
  { id: 'p-carlos', organization_id: INITIAL_ORG.id, sector_id: 'sec-info', name: 'Carlos Silva', identifier: 'E4A28B10', active: true, created_at: new Date().toISOString() },
  { id: 'p-mariana', organization_id: INITIAL_ORG.id, sector_id: 'sec-admin', name: 'Mariana Costa', identifier: '73BF91C2', active: true, created_at: new Date().toISOString() },
  { id: 'p-roberto', organization_id: INITIAL_ORG.id, sector_id: 'sec-eletro', name: 'Roberto Mendes', identifier: '5A11D399', active: true, created_at: new Date().toISOString() },
  { id: 'p-lucas', organization_id: INITIAL_ORG.id, sector_id: 'sec-manut', name: 'Lucas Ferreira', identifier: '88CC4412', active: true, created_at: new Date().toISOString() },
  { id: 'p-aluno', organization_id: INITIAL_ORG.id, sector_id: 'sec-info', name: 'Marcos Oliveira', identifier: 'A9914400', active: true, created_at: new Date().toISOString() },
];

const INITIAL_PERMISSIONS: Permission[] = [
  // Pessoas demonstrativas com permissões variadas por área
  { id: 'perm-1', person_id: 'p-carlos', area_id: 'area-portaria', created_at: new Date().toISOString() },
  { id: 'perm-2', person_id: 'p-carlos', area_id: 'area-lab-redes', created_at: new Date().toISOString() },
  { id: 'perm-3', person_id: 'p-carlos', area_id: 'area-lab-soft', created_at: new Date().toISOString() },
  { id: 'perm-4', person_id: 'p-carlos', area_id: 'area-prof', created_at: new Date().toISOString() },

  // Mariana
  { id: 'perm-5', person_id: 'p-mariana', area_id: 'area-portaria', created_at: new Date().toISOString() },
  { id: 'perm-6', person_id: 'p-mariana', area_id: 'area-lab-soft', created_at: new Date().toISOString() },
  { id: 'perm-7', person_id: 'p-mariana', area_id: 'area-prof', created_at: new Date().toISOString() },

  // Roberto
  { id: 'perm-8', person_id: 'p-roberto', area_id: 'area-portaria', created_at: new Date().toISOString() },
  { id: 'perm-9', person_id: 'p-roberto', area_id: 'area-oficina', created_at: new Date().toISOString() },

  // Lucas tem acesso a áreas técnicas e de manutenção
  { id: 'perm-10', person_id: 'p-lucas', area_id: 'area-portaria', created_at: new Date().toISOString() },
  { id: 'perm-11', person_id: 'p-lucas', area_id: 'area-lab-redes', created_at: new Date().toISOString() },
  { id: 'perm-12', person_id: 'p-lucas', area_id: 'area-oficina', created_at: new Date().toISOString() },

  // Marcos tem acesso à entrada e à área técnica
  { id: 'perm-13', person_id: 'p-aluno', area_id: 'area-portaria', created_at: new Date().toISOString() },
  { id: 'perm-14', person_id: 'p-aluno', area_id: 'area-lab-redes', created_at: new Date().toISOString() },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev-1',
    organization_id: INITIAL_ORG.id,
    person_id: 'p-carlos',
    control_point_id: 'cp-entrada',
    device_id: 'dev-01',
    event_type: 'entry',
    access_result: 'allowed',
    occurred_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    metadata: { note: 'Entrada registrada' },
  },
  {
    id: 'ev-2',
    organization_id: INITIAL_ORG.id,
    person_id: 'p-carlos',
    control_point_id: 'cp-lab-redes',
    device_id: 'dev-02',
    event_type: 'identification',
    access_result: 'allowed',
    occurred_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    metadata: { note: 'Acesso liberado à área técnica' },
  },
  {
    id: 'ev-3',
    organization_id: INITIAL_ORG.id,
    person_id: 'p-roberto',
    control_point_id: 'cp-entrada',
    device_id: 'dev-01',
    event_type: 'entry',
    access_result: 'allowed',
    occurred_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    metadata: { note: 'Entrada registrada' },
  },
  {
    id: 'ev-4',
    organization_id: INITIAL_ORG.id,
    person_id: 'p-roberto',
    control_point_id: 'cp-lab-redes',
    device_id: 'dev-02',
    event_type: 'identification',
    access_result: 'denied',
    occurred_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: { reason: 'Tentativa em área não autorizada' },
  },
  {
    id: 'ev-5',
    organization_id: INITIAL_ORG.id,
    person_id: 'p-roberto',
    control_point_id: 'cp-oficina',
    device_id: 'dev-03',
    event_type: 'identification',
    access_result: 'allowed',
    occurred_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: { note: 'Acesso liberado à oficina de manutenção' },
  },
];

const STORAGE_KEY = 'presenx_local_state_v1';

type DemoRecord = { id: string; name: string; description?: string };

function migrateDemoRecords<T extends DemoRecord>(
  rows: T[],
  defaults: T[],
  previousValues: Record<string, { name: string; description?: string }>,
): T[] {
  return rows.map(row => {
    const previous = previousValues[row.id];
    const replacement = defaults.find(item => item.id === row.id);
    if (!previous || !replacement || row.name !== previous.name) return row;

    const descriptionChanged = previous.description !== undefined && row.description === previous.description;
    return {
      ...row,
      name: replacement.name,
      ...(descriptionChanged ? { description: replacement.description } : {}),
    } as T;
  });
}

class DataService {
  private organization: Organization = INITIAL_ORG;
  private profile: Profile = INITIAL_PROFILE;
  private sectors: Sector[] = INITIAL_SECTORS;
  private areas: Area[] = INITIAL_AREAS;
  private people: Person[] = INITIAL_PEOPLE;
  private permissions: Permission[] = INITIAL_PERMISSIONS;
  private controlPoints: ControlPoint[] = INITIAL_CONTROL_POINTS;
  private devices: Device[] = INITIAL_DEVICES;
  private events: Event[] = INITIAL_EVENTS;
  private supabaseOrganizationId: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      const state = {
        organization: this.organization,
        profile: this.profile,
        sectors: this.sectors,
        areas: this.areas,
        people: this.people,
        permissions: this.permissions,
        controlPoints: this.controlPoints,
        devices: this.devices,
        events: this.events,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or browser restriction
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const savedOrganization = parsed.organization as Organization | undefined;
        const isLegacyDemo = savedOrganization?.name === 'CETEP / LNAB - Camaçari';
        if (savedOrganization) {
          this.organization = isLegacyDemo
            ? { ...savedOrganization, name: INITIAL_ORG.name, type: INITIAL_ORG.type }
            : savedOrganization;
        }
        if (parsed.sectors) this.sectors = isLegacyDemo
          ? migrateDemoRecords(parsed.sectors, INITIAL_SECTORS, {
              'sec-info': { name: 'Docência - Informática', description: 'Professores do eixo tecnológico de TI' },
              'sec-eletro': { name: 'Docência - Eletrotécnica', description: 'Professores do eixo industrial' },
              'sec-admin': { name: 'Administração & Gestão', description: 'Diretoria e secretaria escolar' },
              'sec-manut': { name: 'Manutenção & Apoio', description: 'Técnicos de laboratório e serviços gerais' },
            })
          : parsed.sectors;
        if (parsed.areas) this.areas = isLegacyDemo
          ? migrateDemoRecords(parsed.areas, INITIAL_AREAS, {
              'area-portaria': { name: 'Portaria Principal', description: 'Controle de entrada e saída do campus' },
              'area-lab-redes': { name: 'Laboratório de Redes', description: 'Pavilhão ACM - Sala 102' },
              'area-lab-soft': { name: 'Laboratório de Software', description: 'Pavilhão ACM - Sala 104' },
              'area-oficina': { name: 'Oficina de Mecânica & Solda', description: 'Pavilhão Luís Viana - Galpão 01' },
              'area-prof': { name: 'Sala dos Professores', description: 'Bloco Administrativo' },
            })
          : parsed.areas;
        if (parsed.people) this.people = isLegacyDemo
          ? migrateDemoRecords(parsed.people, INITIAL_PEOPLE, {
              'p-carlos': { name: 'Prof. Carlos Silva' },
              'p-mariana': { name: 'Profa. Mariana Costa' },
              'p-roberto': { name: 'Prof. Roberto Mendes' },
              'p-lucas': { name: 'Lucas Ferreira (Técnico TI)' },
              'p-aluno': { name: 'Marcos Oliveira (Aluno Monitor)' },
            })
          : parsed.people;
        if (parsed.permissions) this.permissions = parsed.permissions;
        if (parsed.controlPoints) this.controlPoints = isLegacyDemo
          ? migrateDemoRecords(parsed.controlPoints, INITIAL_CONTROL_POINTS, {
              'cp-entrada': { name: 'Catraca Entrada Principal', description: 'Acesso de pedestres' },
              'cp-lab-redes': { name: 'Fechadura Lab Redes', description: 'Porta com leitor RFID' },
              'cp-oficina': { name: 'Acesso Oficina Eletromecânica', description: 'Ponto restrito a docentes e técnicos autorizados' },
              'cp-saida': { name: 'Catraca Saída Portaria', description: 'Registro de saída' },
            })
          : parsed.controlPoints;
        if (parsed.devices) this.devices = isLegacyDemo
          ? migrateDemoRecords(parsed.devices, INITIAL_DEVICES, {
              'dev-01': { name: 'ESP32 Portaria In' },
              'dev-02': { name: 'ESP32 Lab Redes' },
              'dev-03': { name: 'ESP32 Oficina' },
              'dev-04': { name: 'ESP32 Portaria Out' },
            })
          : parsed.devices;
        if (parsed.events) this.events = parsed.events;
        if (isLegacyDemo) this.saveToStorage();
      }
    } catch {
      // fallback to initial
    }
  }

  public resetToDefaults() {
    this.supabaseOrganizationId = null;
    this.organization = INITIAL_ORG;
    this.profile = INITIAL_PROFILE;
    this.sectors = INITIAL_SECTORS;
    this.areas = INITIAL_AREAS;
    this.people = INITIAL_PEOPLE;
    this.permissions = INITIAL_PERMISSIONS;
    this.controlPoints = INITIAL_CONTROL_POINTS;
    this.devices = INITIAL_DEVICES;
    this.events = INITIAL_EVENTS;
    this.saveToStorage();
  }

  // --- Getters ---
  getOrganization() { return this.organization; }
  getProfile() { return this.profile; }
  getSectors() { return [...this.sectors]; }
  getAreas() { return [...this.areas]; }

  /** Carrega a organização autenticada e os dados usados no fluxo de pessoas. */
  async connectOrganization(organizationId: string, organizationName: string): Promise<void> {
    const [sectorsResult, areasResult, peopleResult, controlPointsResult, eventsResult] = await Promise.all([
      supabase.from('sectors').select('*').eq('organization_id', organizationId),
      supabase.from('areas').select('*').eq('organization_id', organizationId),
      supabase.from('people').select('*').eq('organization_id', organizationId).order('name'),
      supabase.from('control_points').select('*').eq('organization_id', organizationId).order('name'),
      supabase.from('events').select('*').eq('organization_id', organizationId).order('occurred_at', { ascending: false }).limit(500),
    ]);

    const firstError = sectorsResult.error || areasResult.error || peopleResult.error || controlPointsResult.error || eventsResult.error;
    if (firstError) throw firstError;

    const personRows = peopleResult.data || [];
    const personIds = personRows.map(person => person.id);
    const controlPointRows = controlPointsResult.data || [];
    const controlPointIds = controlPointRows.map(point => point.id);
    const permissionsResult = personIds.length
      ? await supabase.from('permissions').select('*').in('person_id', personIds)
      : { data: [], error: null };
    if (permissionsResult.error) throw permissionsResult.error;
    const devicesResult = controlPointIds.length
      ? await supabase.from('devices').select('*').in('control_point_id', controlPointIds)
      : { data: [], error: null };
    if (devicesResult.error) throw devicesResult.error;

    this.supabaseOrganizationId = organizationId;
    this.organization = { ...INITIAL_ORG, id: organizationId, name: organizationName };
    this.sectors = (sectorsResult.data || []) as Sector[];
    this.areas = (areasResult.data || []) as Area[];
    this.people = personRows.map(row => ({
      ...row,
      sector_id: row.sector_id || undefined,
    })) as Person[];
    this.permissions = (permissionsResult.data || []) as Permission[];
    this.controlPoints = controlPointRows.map(row => ({
      ...row,
      area_id: row.area_id || undefined,
    })) as ControlPoint[];
    this.devices = (devicesResult.data || []).map(row => ({
      ...row,
      control_point_id: row.control_point_id || undefined,
    })) as Device[];
    this.events = (eventsResult.data || []).map(row => ({
      ...row,
      device_id: row.device_id || undefined,
      control_point_id: row.control_point_id || undefined,
    })) as Event[];
  }

  disconnectOrganization(): void {
    this.supabaseOrganizationId = null;
    this.organization = INITIAL_ORG;
    this.profile = INITIAL_PROFILE;
    this.sectors = INITIAL_SECTORS;
    this.areas = INITIAL_AREAS;
    this.people = INITIAL_PEOPLE;
    this.permissions = INITIAL_PERMISSIONS;
    this.controlPoints = INITIAL_CONTROL_POINTS;
    this.devices = INITIAL_DEVICES;
    this.events = INITIAL_EVENTS;
  }

  async refreshEvents(): Promise<void> {
    if (!this.supabaseOrganizationId) return;
    const { data, error } = await supabase.from('events')
      .select('*')
      .eq('organization_id', this.supabaseOrganizationId)
      .order('occurred_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    this.events = (data || []).map(row => ({
      ...row,
      device_id: row.device_id || undefined,
      control_point_id: row.control_point_id || undefined,
    })) as Event[];
  }
  
  getPeople(): (Person & { sector?: Sector; permissionsCount: number })[] {
    return this.people.map(p => ({
      ...p,
      sector: this.sectors.find(s => s.id === p.sector_id),
      permissionsCount: this.permissions.filter(perm => perm.person_id === p.id).length,
    }));
  }

  getControlPoints(): (ControlPoint & { area?: Area; device?: Device })[] {
    return this.controlPoints.map(cp => ({
      ...cp,
      area: this.areas.find(a => a.id === cp.area_id),
      device: this.devices.find(d => d.control_point_id === cp.id),
    }));
  }

  getDevices(): (Device & { controlPoint?: ControlPoint & { area?: Area } })[] {
    return this.devices.map(d => {
      const cp = this.controlPoints.find(c => c.id === d.control_point_id);
      return {
        ...d,
        controlPoint: cp ? {
          ...cp,
          area: this.areas.find(a => a.id === cp.area_id)
        } : undefined
      };
    });
  }

  getPermissionsForPerson(personId: string): Area[] {
    const permAreaIds = this.permissions.filter(p => p.person_id === personId).map(p => p.area_id);
    return this.areas.filter(a => permAreaIds.includes(a.id));
  }

  getEvents(limit = 100): (Event & { person?: Person; controlPoint?: ControlPoint & { area?: Area } })[] {
    return [...this.events]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, limit)
      .map(ev => {
        const p = this.people.find(person => person.id === ev.person_id);
        const cp = this.controlPoints.find(c => c.id === ev.control_point_id);
        return {
          ...ev,
          person: p,
          controlPoint: cp ? {
            ...cp,
            area: this.areas.find(a => a.id === cp.area_id)
          } : undefined
        };
      });
  }

  /**
   * Cálculo de Última Localização Registrada (Regra D002, D003, D004)
   * Derivada estritamente do último evento VÁLIDO (allowed).
   * Eventos negados NÃO alteram a última localização.
   */
  getLastRecordedLocations(): LastRecordedLocation[] {
    return this.people.map(person => {
      const sector = this.sectors.find(s => s.id === person.sector_id);
      // Busca último evento autorizado
      const personEvents = this.events
        .filter(e => e.person_id === person.id && e.access_result === 'allowed')
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

      const lastValid = personEvents[0];
      if (!lastValid) {
        return {
          person_id: person.id,
          person_name: person.name,
          identifier: person.identifier,
          sector_name: sector?.name,
          last_event_at: undefined,
          last_event_type: undefined,
          last_access_result: undefined,
          area_name: 'Sem registro',
          control_point_name: 'Nenhum',
        };
      }

      const cp = this.controlPoints.find(c => c.id === lastValid.control_point_id);
      const area = this.areas.find(a => a.id === cp?.area_id);

      return {
        person_id: person.id,
        person_name: person.name,
        identifier: person.identifier,
        sector_name: sector?.name,
        last_event_at: lastValid.occurred_at,
        last_event_type: lastValid.event_type,
        last_access_result: lastValid.access_result,
        area_name: area?.name || 'Área não associada',
        control_point_name: cp?.name || 'Ponto não identificado',
      };
    });
  }

  /**
   * Determina o estado de presença (Presente no Campus / Fora)
   * Regra USE_CASES.md & REQUIREMENTS.md:
   * Entrada registrada -> presente.
   * Saída registrada -> ausente.
   * Entrada sem saída -> presente (sem inventar horário de saída!).
   */
  getPresenceSummary() {
    const locations = this.getLastRecordedLocations();
    let presentCount = 0;
    let absentCount = 0;

    const detailed = locations.map(loc => {
      // Verifica o último evento de fluxo (entry ou exit)
      const flowEvents = this.events
        .filter(e => e.person_id === loc.person_id && (e.event_type === 'entry' || e.event_type === 'exit'))
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

      const lastFlow = flowEvents[0];
      const isPresent = lastFlow ? lastFlow.event_type === 'entry' : false;

      if (isPresent) presentCount++;
      else absentCount++;

      return {
        ...loc,
        isPresent,
        lastFlowType: lastFlow?.event_type,
        lastFlowTime: lastFlow?.occurred_at,
      };
    });

    return {
      total: this.people.length,
      presentCount,
      absentCount,
      people: detailed,
    };
  }

  // --- Actions ---

  async addPerson(data: { name: string; sector_id?: string; identifier?: string; active: boolean; authorizedAreaIds: string[] }): Promise<Person> {
    const normalizedIdentifier = data.identifier?.trim().toUpperCase() || undefined;
    if (normalizedIdentifier && this.people.some(person => person.identifier?.toUpperCase() === normalizedIdentifier)) {
      throw new Error('Este identificador já está associado a outra pessoa.');
    }

    if (this.supabaseOrganizationId) {
      const { data: insertedPerson, error } = await supabase.rpc('save_person_with_permissions', {
        p_person_id: null,
        p_organization_id: this.supabaseOrganizationId,
        p_name: data.name.trim(),
        p_sector_id: data.sector_id || null,
        p_identifier: normalizedIdentifier || null,
        p_active: data.active,
        p_authorized_area_ids: data.authorizedAreaIds,
      }).single();
      if (error) throw new Error(error.code === '23505' ? 'Este cartão já está associado a outra pessoa.' : error.message);

      const insertedRow = insertedPerson as Person;
      const person = { ...insertedRow, sector_id: insertedRow.sector_id || undefined };
      this.people.unshift(person);
      this.permissions.push(...data.authorizedAreaIds.map(areaId => ({
        id: `perm-${person.id}-${areaId}`,
        person_id: person.id,
        area_id: areaId,
        created_at: new Date().toISOString(),
      })));
      return person;
    }

    const newPerson: Person = {
      id: `p-${Date.now()}`,
      organization_id: this.organization.id,
      name: data.name.trim(),
      sector_id: data.sector_id || undefined,
      identifier: normalizedIdentifier,
      active: data.active,
      created_at: new Date().toISOString(),
    };
    this.people.unshift(newPerson);

    // Salva permissões de áreas autorizadas
    data.authorizedAreaIds.forEach(areaId => {
      this.permissions.push({
        id: `perm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        person_id: newPerson.id,
        area_id: areaId,
        created_at: new Date().toISOString(),
      });
    });

    this.saveToStorage();
    return newPerson;
  }

  async updatePerson(id: string, data: { name: string; sector_id?: string; identifier?: string; active: boolean; authorizedAreaIds: string[] }): Promise<Person> {
    const person = this.people.find(item => item.id === id);
    if (!person) throw new Error('Pessoa não encontrada.');

    const normalizedIdentifier = data.identifier?.trim().toUpperCase() || undefined;
    if (normalizedIdentifier && this.people.some(item => item.id !== id && item.identifier?.toUpperCase() === normalizedIdentifier)) {
      throw new Error('Este identificador já está associado a outra pessoa.');
    }

    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.rpc('save_person_with_permissions', {
        p_person_id: id,
        p_organization_id: this.supabaseOrganizationId,
        p_name: data.name.trim(),
        p_sector_id: data.sector_id || null,
        p_identifier: normalizedIdentifier || null,
        p_active: data.active,
        p_authorized_area_ids: data.authorizedAreaIds,
      }).single();
      if (error) throw new Error(error.code === '23505' ? 'Este cartão já está associado a outra pessoa.' : error.message);

      const updatedRow = row as Person;
      const updated = { ...updatedRow, sector_id: updatedRow.sector_id || undefined };
      this.people = this.people.map(item => item.id === id ? updated : item);
      this.permissions = this.permissions.filter(permission => permission.person_id !== id);
      this.permissions.push(...data.authorizedAreaIds.map(areaId => ({
        id: `perm-${id}-${areaId}`,
        person_id: id,
        area_id: areaId,
        created_at: new Date().toISOString(),
      })));
      return updated;
    }

    const updatedPerson: Person = {
      ...person,
      name: data.name.trim(),
      sector_id: data.sector_id || undefined,
      identifier: normalizedIdentifier,
      active: data.active,
    };
    this.people = this.people.map(item => item.id === id ? updatedPerson : item);
    this.permissions = this.permissions.filter(permission => permission.person_id !== id);
    data.authorizedAreaIds.forEach(areaId => {
      this.permissions.push({
        id: `perm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        person_id: id,
        area_id: areaId,
        created_at: new Date().toISOString(),
      });
    });
    this.saveToStorage();
    return updatedPerson;
  }

  async setPersonActive(id: string, active: boolean): Promise<void> {
    if (this.supabaseOrganizationId) {
      const { error } = await supabase.from('people').update({ active }).eq('id', id);
      if (error) throw error;
    }
    this.people = this.people.map(person => person.id === id ? { ...person, active } : person);
    if (!this.supabaseOrganizationId) this.saveToStorage();
  }

  async addSector(data: { name: string; description?: string }): Promise<Sector> {
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('sectors').insert({
        organization_id: this.supabaseOrganizationId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      }).select().single();
      if (error) throw error;
      const sector = row as Sector;
      this.sectors.push(sector);
      return sector;
    }
    const newSec: Sector = {
      id: `sec-${Date.now()}`,
      organization_id: this.organization.id,
      name: data.name.trim(),
      description: data.description?.trim(),
      created_at: new Date().toISOString(),
    };
    this.sectors.push(newSec);
    this.saveToStorage();
    return newSec;
  }

  async updateSector(id: string, data: { name: string; description?: string }): Promise<Sector> {
    const sector = this.sectors.find(item => item.id === id);
    if (!sector) throw new Error('Setor não encontrado.');
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('sectors').update({
        name: data.name.trim(),
        description: data.description?.trim() || null,
      }).eq('id', id).select().single();
      if (error) throw error;
      const updated = row as Sector;
      this.sectors = this.sectors.map(item => item.id === id ? updated : item);
      return updated;
    }
    const updatedSector = { ...sector, name: data.name.trim(), description: data.description?.trim() };
    this.sectors = this.sectors.map(item => item.id === id ? updatedSector : item);
    this.saveToStorage();
    return updatedSector;
  }

  async deleteSector(id: string): Promise<void> {
    if (this.supabaseOrganizationId) {
      const { error } = await supabase.from('sectors').delete().eq('id', id);
      if (error) throw error;
    }
    this.sectors = this.sectors.filter(s => s.id !== id);
    // Remove vínculo nas pessoas daquele setor
    this.people = this.people.map(p => (p.sector_id === id ? { ...p, sector_id: undefined } : p));
    if (!this.supabaseOrganizationId) this.saveToStorage();
  }

  async addArea(data: { name: string; description?: string }): Promise<Area> {
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('areas').insert({
        organization_id: this.supabaseOrganizationId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      }).select().single();
      if (error) throw error;
      const area = row as Area;
      this.areas.push(area);
      return area;
    }
    const newArea: Area = {
      id: `area-${Date.now()}`,
      organization_id: this.organization.id,
      name: data.name.trim(),
      description: data.description?.trim(),
      created_at: new Date().toISOString(),
    };
    this.areas.push(newArea);
    this.saveToStorage();
    return newArea;
  }

  async updateArea(id: string, data: { name: string; description?: string }): Promise<Area> {
    const area = this.areas.find(item => item.id === id);
    if (!area) throw new Error('Área não encontrada.');
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('areas').update({
        name: data.name.trim(),
        description: data.description?.trim() || null,
      }).eq('id', id).select().single();
      if (error) throw error;
      const updated = row as Area;
      this.areas = this.areas.map(item => item.id === id ? updated : item);
      return updated;
    }
    const updatedArea = { ...area, name: data.name.trim(), description: data.description?.trim() };
    this.areas = this.areas.map(item => item.id === id ? updatedArea : item);
    this.saveToStorage();
    return updatedArea;
  }

  async deleteArea(id: string): Promise<void> {
    if (this.supabaseOrganizationId) {
      const { error } = await supabase.from('areas').delete().eq('id', id);
      if (error) throw error;
    }
    this.areas = this.areas.filter(a => a.id !== id);
    this.permissions = this.permissions.filter(p => p.area_id !== id);
    this.controlPoints = this.controlPoints.map(cp => (cp.area_id === id ? { ...cp, area_id: undefined } : cp));
    if (!this.supabaseOrganizationId) this.saveToStorage();
  }

  async addControlPoint(data: { name: string; area_id?: string; description?: string; active: boolean }): Promise<ControlPoint> {
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('control_points').insert({
        organization_id: this.supabaseOrganizationId,
        area_id: data.area_id || null,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        active: data.active,
      }).select().single();
      if (error) throw error;
      const point = { ...row, area_id: row.area_id || undefined } as ControlPoint;
      this.controlPoints.push(point);
      return point;
    }
    const newCp: ControlPoint = {
      id: `cp-${Date.now()}`,
      organization_id: this.organization.id,
      name: data.name.trim(),
      area_id: data.area_id || undefined,
      description: data.description?.trim(),
      active: data.active,
      created_at: new Date().toISOString(),
    };
    this.controlPoints.push(newCp);
    this.saveToStorage();
    return newCp;
  }

  async updateControlPoint(id: string, data: { name: string; area_id?: string; description?: string }): Promise<ControlPoint> {
    const point = this.controlPoints.find(item => item.id === id);
    if (!point) throw new Error('Ponto de controle não encontrado.');
    if (this.supabaseOrganizationId) {
      const { data: row, error } = await supabase.from('control_points').update({
        name: data.name.trim(),
        area_id: data.area_id || null,
        description: data.description?.trim() || null,
      }).eq('id', id).select().single();
      if (error) throw error;
      const updated = { ...row, area_id: row.area_id || undefined } as ControlPoint;
      this.controlPoints = this.controlPoints.map(item => item.id === id ? updated : item);
      return updated;
    }
    const updatedPoint = { ...point, name: data.name.trim(), area_id: data.area_id || undefined, description: data.description?.trim() };
    this.controlPoints = this.controlPoints.map(item => item.id === id ? updatedPoint : item);
    this.saveToStorage();
    return updatedPoint;
  }

  async deleteControlPoint(id: string): Promise<void> {
    if (this.supabaseOrganizationId) {
      const { error } = await supabase.from('control_points').delete().eq('id', id);
      if (error) throw error;
    }
    this.controlPoints = this.controlPoints.filter(cp => cp.id !== id);
    this.devices = this.devices.map(d => (d.control_point_id === id ? { ...d, control_point_id: undefined } : d));
    if (!this.supabaseOrganizationId) this.saveToStorage();
  }

  async addDevice(data: { name: string; control_point_id?: string; device_key: string; type?: string }): Promise<Device> {
    if (this.devices.some(device => device.device_key === data.device_key.trim())) {
      throw new Error('Esta chave já está sendo usada por outro dispositivo.');
    }
    if (this.supabaseOrganizationId) {
      if (!data.control_point_id) throw new Error('Associe o dispositivo a um ponto de controle.');
      const { data: row, error } = await supabase.from('devices').insert({
        control_point_id: data.control_point_id,
        name: data.name.trim(),
        device_key: data.device_key.trim(),
        type: data.type || 'esp32_rc522',
        active: true,
      }).select().single();
      if (error) throw new Error(error.code === '23505' ? 'Esta chave já está sendo usada por outro dispositivo.' : error.message);
      const device = { ...row, control_point_id: row.control_point_id || undefined } as Device;
      this.devices.push(device);
      return device;
    }
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      control_point_id: data.control_point_id || undefined,
      name: data.name.trim(),
      device_key: data.device_key.trim(),
      type: data.type || 'esp32_rc522',
      active: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.devices.push(newDev);
    this.saveToStorage();
    return newDev;
  }

  async updateDevice(id: string, data: { name: string; control_point_id?: string; device_key: string }): Promise<Device> {
    const device = this.devices.find(item => item.id === id);
    if (!device) throw new Error('Dispositivo não encontrado.');
    const normalizedKey = data.device_key.trim();
    if (this.devices.some(item => item.id !== id && item.device_key === normalizedKey)) {
      throw new Error('Esta chave já está sendo usada por outro dispositivo.');
    }
    if (this.supabaseOrganizationId) {
      if (!data.control_point_id) throw new Error('Associe o dispositivo a um ponto de controle.');
      const { data: row, error } = await supabase.from('devices').update({
        name: data.name.trim(),
        control_point_id: data.control_point_id,
        device_key: normalizedKey,
      }).eq('id', id).select().single();
      if (error) throw new Error(error.code === '23505' ? 'Esta chave já está sendo usada por outro dispositivo.' : error.message);
      const updated = { ...row, control_point_id: row.control_point_id || undefined } as Device;
      this.devices = this.devices.map(item => item.id === id ? updated : item);
      return updated;
    }
    const updatedDevice = { ...device, name: data.name.trim(), control_point_id: data.control_point_id || undefined, device_key: normalizedKey };
    this.devices = this.devices.map(item => item.id === id ? updatedDevice : item);
    this.saveToStorage();
    return updatedDevice;
  }

  async pingDevice(deviceId: string): Promise<void> {
    const lastSeen = new Date().toISOString();
    if (this.supabaseOrganizationId) {
      const { error } = await supabase.from('devices').update({ last_seen_at: lastSeen }).eq('id', deviceId);
      if (error) throw error;
    }
    this.devices = this.devices.map(d => (d.id === deviceId ? { ...d, last_seen_at: lastSeen } : d));
    if (!this.supabaseOrganizationId) this.saveToStorage();
  }

  /**
   * Motor de Eventos & Identificação (Processa leitura de cartão RFID)
   * Valida autorização, gera evento imutável e atualiza dispositivo
   */
  processIdentification(payload: {
    identifier: string;
    control_point_id: string;
    overrideEventType?: EventType;
  }): { event: Event; allowed: boolean; message: string; person?: Person } {
    const identifierUpper = payload.identifier.trim().toUpperCase();
    const person = this.people.find(p => p.identifier?.toUpperCase() === identifierUpper);

    const cp = this.controlPoints.find(c => c.id === payload.control_point_id);
    const device = this.devices.find(d => d.control_point_id === payload.control_point_id);

    // Heartbeat do dispositivo que disparou
    if (device) {
      device.last_seen_at = new Date().toISOString();
    }

    if (!person) {
      throw new Error(`Cartão/Identificador [${identifierUpper}] não cadastrado no sistema.`);
    }

    if (!person.active) {
      const deniedEvent: Event = {
        id: `ev-${Date.now()}`,
        organization_id: this.organization.id,
        person_id: person.id,
        control_point_id: payload.control_point_id,
        device_id: device?.id,
        event_type: 'identification',
        access_result: 'denied',
        occurred_at: new Date().toISOString(),
        metadata: { reason: 'Pessoa inativa no cadastro' },
      };
      this.events.unshift(deniedEvent);
      if (!this.supabaseOrganizationId) this.saveToStorage();
      return { event: deniedEvent, allowed: false, message: 'Acesso Negado: Cadastro inativo', person };
    }

    // Determina o tipo de evento
    let detectedType: EventType = payload.overrideEventType || 'identification';
    if (!payload.overrideEventType) {
      if (cp?.name.toLowerCase().includes('entrada') || cp?.area_id === 'area-portaria') {
        // Se estiver na portaria, alterna entre entrada e saída
        const lastFlow = this.events
          .filter(e => e.person_id === person.id && (e.event_type === 'entry' || e.event_type === 'exit'))
          .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())[0];
        detectedType = lastFlow?.event_type === 'entry' ? 'exit' : 'entry';
      }
    }

    // Verificação de Permissão se o ponto de controle for vinculado a uma área restrita
    let isAllowed = true;
    let denyReason = '';

    if (cp?.area_id && cp.area_id !== 'area-portaria') {
      const hasPermission = this.permissions.some(
        perm => perm.person_id === person.id && perm.area_id === cp.area_id
      );
      if (!hasPermission) {
        isAllowed = false;
        denyReason = 'Sem permissão para esta área física';
      }
    }

    const newEvent: Event = {
      id: `ev-${Date.now()}`,
      organization_id: this.organization.id,
      person_id: person.id,
      control_point_id: payload.control_point_id,
      device_id: device?.id,
      event_type: detectedType,
      access_result: isAllowed ? 'allowed' : 'denied',
      occurred_at: new Date().toISOString(),
      metadata: isAllowed ? { status: 'Identificação validada com sucesso' } : { reason: denyReason },
    };

    this.events.unshift(newEvent);
    if (!this.supabaseOrganizationId) this.saveToStorage();

    const resultMsg = isAllowed
      ? `Acesso Permitido (${detectedType === 'entry' ? 'Entrada Registrada' : detectedType === 'exit' ? 'Saída Registrada' : 'Identificado no local'})`
      : `Acesso Negado: ${denyReason}`;

    return {
      event: newEvent,
      allowed: isAllowed,
      message: resultMsg,
      person,
    };
  }
}

export const dataService = new DataService();
