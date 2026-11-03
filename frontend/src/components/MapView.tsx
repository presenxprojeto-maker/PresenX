import React, { useState } from 'react';
import {
  MapPin,
  Cpu,
  Clock,
  Radio,
  DoorOpen,
  Building,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface MapViewProps {
  onOpenSimulator: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ onOpenSimulator }) => {
  const areas = dataService.getAreas();
  const controlPoints = dataService.getControlPoints();
  const devices = dataService.getDevices();
  const lastLocations = dataService.getLastRecordedLocations();
  const events = dataService.getEvents(50);

  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || '');

  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const selectedAreaCp = controlPoints.filter(cp => cp.area_id === selectedAreaId);
  const selectedAreaPeople = lastLocations.filter(loc => loc.area_name === selectedArea?.name);
  const selectedAreaEvents = events.filter(ev => ev.controlPoint?.area_id === selectedAreaId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header com Contexto Arquitetural */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={18} color="var(--brand)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Áreas
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              Últimos registros por área
            </div>
          </div>
        </div>

        <button onClick={onOpenSimulator} className="btn-solid" style={{ fontSize: '0.78rem' }}>
          <Radio size={14} />
          <span>Simular identificação</span>
        </button>
      </div>

      {/* Grid Principal: Planta / Zonas à esquerda e Detalhes da Área à direita */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '20px' }}>
        
        {/* Planta Espacial Interativa */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Áreas monitoradas
            </span>
            <span className="tag tag-neutral">
              <Activity size={12} /> {areas.length} áreas mapeadas
            </span>
          </div>

          {/* Grid de Blocos / Áreas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '14px',
            background: 'var(--bg-surface)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)'
          }}>
            {areas.map(area => {
              const isSelected = area.id === selectedAreaId;
              const areaCp = controlPoints.filter(cp => cp.area_id === area.id);
              const occupants = lastLocations.filter(loc => loc.area_name === area.name);
              const hasDevices = areaCp.some(cp => devices.some(d => d.control_point_id === cp.id));

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  style={{
                    background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    border: isSelected ? '1px solid var(--brand)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color={isSelected ? 'var(--brand)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {area.name}
                      </span>
                    </div>
                    {occupants.length > 0 && (
                      <span className="tag tag-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {occupants.length}
                      </span>
                    )}
                  </div>

                  {area.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      {area.description}
                    </div>
                  )}

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DoorOpen size={12} /> {areaCp.length} ponto(s)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Cpu size={12} /> {hasDevices ? 'Leitor cadastrado' : 'Sem leitor'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color="var(--brand)" />
            <span>Clique sobre qualquer área para inspecionar os pontos de controle associados e as pessoas com último registro nela.</span>
          </div>
        </div>

        {/* Detalhes da Área Selecionada */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedArea ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Área em Foco
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedArea.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedArea.description || 'Sem descrição'}
                  </div>
                </div>

                <span className="tag tag-brand">
                  <Shield size={12} /> Área cadastrada
                </span>
              </div>

              {/* Pontos de Controle Instalados */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pontos de Controle Vinculados ({selectedAreaCp.length})
                </div>
                {selectedAreaCp.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    Nenhum ponto de controle instalado nesta área física.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedAreaCp.map(cp => {
                      const dev = devices.find(d => d.control_point_id === cp.id);
                      return (
                        <div
                          key={cp.id}
                          style={{
                            padding: '8px 12px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cp.name}</div>
                            {dev && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                                Dispositivo: {dev.name} ({dev.device_key})
                              </div>
                            )}
                          </div>
                          <span className={`tag ${dev ? 'tag-success' : 'tag-neutral'}`} style={{ fontSize: '0.68rem' }}>
                            {dev ? 'ESP32 Ativo' : 'Manual'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pessoas com Última Localização Registrada nesta Área */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Última Localização Registrada Aqui ({selectedAreaPeople.length})
                </div>
                {selectedAreaPeople.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    Nenhuma pessoa registrada nesta área recentemente.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedAreaPeople.map(p => (
                      <div
                        key={p.person_id}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-main)' }}>{p.person_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--indigo)' }}>
                            Setor: {p.sector_name || 'Geral'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                          <div>{p.control_point_name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            <Clock size={11} />
                            {p.last_event_at ? new Date(p.last_event_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Últimos Eventos Ocorridos nesta Área */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Auditoria de Eventos Nesta Área
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {selectedAreaEvents.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Sem registros de eventos.</div>
                  ) : (
                    selectedAreaEvents.slice(0, 5).map(ev => (
                      <div
                        key={ev.id}
                        style={{
                          fontSize: '0.75rem',
                          padding: '6px 10px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-xs)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {ev.access_result === 'allowed' ? (
                            <CheckCircle2 size={13} color="var(--emerald)" />
                          ) : (
                            <XCircle size={13} color="var(--rose)" />
                          )}
                          <span style={{ color: 'var(--text-main)' }}>{ev.person?.name || 'RFID Avulso'}</span>
                        </div>
                        <span style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {new Date(ev.occurred_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-sub)' }}>
              Selecione uma área no mapa.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
