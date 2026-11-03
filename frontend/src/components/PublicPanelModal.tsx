import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, UserCheck, UserX, Activity } from 'lucide-react';
import { dataService } from '../services/dataService';

interface PublicPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
}

export const PublicPanelModal: React.FC<PublicPanelModalProps> = ({ isOpen, onClose, organizationName }) => {
  if (!isOpen) return null;

  const [currentTime, setCurrentTime] = useState(new Date());
  const presence = dataService.getPresenceSummary();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString('pt-BR');
  const dateFormatted = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-app)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-main)',
      overflow: 'hidden',
    }}>
      {/* Top TV Bar */}
      <header style={{
        padding: '16px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--brand)',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.04em'
          }}>
            {organizationName}
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Presença no local
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              Situação calculada pelo último registro de entrada ou saída
            </div>
          </div>
        </div>

        {/* Data / Hora / Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand)' }}>
              {timeFormatted}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'capitalize' }}>
              {dateFormatted}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            title="Sair da tela do painel"
          >
            <X size={15} /> Fechar Painel
          </button>
        </div>
      </header>

      {/* Faixa de Status de Presença */}
      <div style={{
        padding: '12px 28px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <UserCheck size={16} color="var(--emerald)" />
            <span>Com entrada registrada: <strong style={{ color: 'var(--emerald)' }}>{presence.presentCount}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <UserX size={16} color="var(--text-sub)" />
            <span style={{ color: 'var(--text-muted)' }}>Sem entrada registrada: <strong>{presence.absentCount}</strong></span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
          A localização corresponde ao último registro validado.
        </div>
      </div>

      {/* Pessoas e últimos registros */}
      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '16px',
        }}>
          {presence.people.map(person => {
            const isPresent = person.isPresent;
            const timeStr = person.last_event_at
              ? new Date(person.last_event_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : '--:--';

            return (
              <div
                key={person.person_id}
                className="panel"
                style={{
                  background: isPresent ? 'var(--bg-card)' : 'var(--bg-surface)',
                  border: isPresent ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      {person.person_name}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--indigo)', fontWeight: 500, marginTop: '2px' }}>
                      {person.sector_name || 'Sem setor'}
                    </div>
                  </div>

                  <span className={`tag ${isPresent ? 'tag-success' : 'tag-neutral'}`} style={{ fontSize: '0.72rem' }}>
                    {isPresent ? 'No local' : 'Fora do local'}
                  </span>
                </div>

                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isPresent ? 'var(--text-main)' : 'var(--text-sub)' }}>
                    <MapPin size={13} color="var(--brand)" />
                    <span style={{ fontWeight: 500 }}>{person.area_name}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> Último registro: {timeStr} ({person.control_point_name})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Rodapé Informativo */}
      <footer style={{
        padding: '10px 28px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        fontSize: '0.72rem',
        color: 'var(--text-sub)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={12} color="var(--brand)" />
          <span>PresenX • {organizationName}</span>
        </div>
      </footer>
    </div>
  );
};
