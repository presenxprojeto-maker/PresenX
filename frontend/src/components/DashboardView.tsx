import type { CSSProperties } from 'react';
import { dataService } from '../services/dataService';

interface DashboardViewProps {
  onGoToEvents: () => void;
  onGoToPeople: () => void;
  onOpenPublicPanel: () => void;
}

const activityHours = [6, 9, 12, 15, 18, 21];

export function DashboardView({ onGoToEvents, onGoToPeople, onOpenPublicPanel }: DashboardViewProps) {
  const people = dataService.getPeople().filter(person => person.active);
  const presence = dataService.getPresenceSummary();
  const activePersonIds = new Set(people.map(person => person.id));
  const presentCount = presence.people.filter(person => activePersonIds.has(person.person_id) && person.isPresent).length;
  const events = dataService.getEvents(1000);
  const today = new Date();
  const eventsToday = events.filter(event => isToday(new Date(event.occurred_at), today));
  const deniedToday = eventsToday.filter(event => event.access_result === 'denied').length;
  const recentEvents = events.slice(0, 5);
  const latestEvent = eventsToday.reduce<(typeof eventsToday)[number] | null>((latest, event) => {
    if (!latest || new Date(event.occurred_at) > new Date(latest.occurred_at)) return event;
    return latest;
  }, null);
  const activity = activityHours.map(hour => ({
    hour,
    count: eventsToday.filter(event => {
      const eventHour = new Date(event.occurred_at).getHours();
      return eventHour >= hour && eventHour < hour + 3;
    }).length,
  }));
  const peak = Math.max(0, ...activity.map(block => block.count));
  const activityDescription = activity.map(block => `${block.hour} horas: ${block.count} registros`).join('; ');

  return (
    <div className="dashboard-layout">
      <section className="dashboard-actions" aria-label="Ações rápidas">
        <button onClick={onGoToPeople} className="btn-outline">Ver pessoas</button>
        <button onClick={onGoToEvents} className="btn-solid">Ver eventos</button>
      </section>

      <section className="dashboard-presence" aria-label="Presença estimada no local">
        <div className="dashboard-presence-indicator" aria-hidden="true" />
        <strong>{presentCount}</strong>
        <span>com entrada registrada no local</span>
        <small>Estimativa pela última entrada ou saída.</small>
        <button onClick={onOpenPublicPanel}>Abrir painel de presença</button>
      </section>

      <section className="dashboard-overview panel" aria-label="Movimentação de hoje">
        <div className="dashboard-overview-main">
          <div className="dashboard-eyebrow">MOVIMENTAÇÃO · {today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</div>
          <h2 className="dashboard-total-title">Acessos registrados</h2>
          <div className="dashboard-total-line">
            <span className="dashboard-total-number">{eventsToday.length}</span>
            <span className="dashboard-total-unit">leituras hoje</span>
          </div>
          <p className="dashboard-last-event">
            {latestEvent
              ? `Última leitura às ${new Date(latestEvent.occurred_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Nenhuma leitura registrada hoje'}
          </p>
        </div>

        <div className="dashboard-activity">
          <div className="dashboard-activity-heading">
            <h3>Leituras por horário</h3>
            <span>Hoje</span>
          </div>
          <svg className="activity-chart" viewBox="0 0 350 142" role="img" aria-label={`Registros em blocos de três horas. ${activityDescription}`}>
            <line x1="10" y1="105" x2="340" y2="105" stroke="var(--border)" strokeWidth="1" />
            {activity.map((block, index) => {
              const barHeight = peak === 0 ? 3 : Math.max(7, (block.count / peak) * 65);
              const x = 21 + index * 54;
              return (
                <g key={block.hour}>
                  <rect
                    x={x}
                    y={105 - barHeight}
                    width="25"
                    height={barHeight}
                    rx="3"
                    fill={block.count === peak && peak > 0 ? 'var(--brand)' : '#b7d0e3'}
                  />
                  <text x={x + 12.5} y="128" textAnchor="middle" fill="var(--text-sub)" fontSize="10">
                    {String(block.hour).padStart(2, '0')}h
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="dashboard-chart-note">Cada barra reúne um intervalo de 3 horas.</p>
        </div>
      </section>

      <section className="dashboard-facts" aria-label="Outros indicadores de hoje">
        <div className="dashboard-fact">
          <span className="dashboard-fact-label">Cadastros ativos</span>
          <strong>{people.length}</strong>
          <button onClick={onGoToPeople} aria-label="Ver pessoas cadastradas">Ver cadastro</button>
        </div>
        <div className="dashboard-fact dashboard-fact-denied">
          <span className="dashboard-fact-label">Acessos negados</span>
          <strong>{deniedToday}</strong>
          <button onClick={onGoToEvents} aria-label="Ver eventos de acesso">Ver eventos</button>
        </div>
      </section>

      <section className="panel dashboard-recent">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-eyebrow">ACOMPANHAMENTO</span>
            <h2 className="dashboard-section-title">Últimos registros</h2>
          </div>
          <button onClick={onGoToEvents} className="btn-outline" style={{ whiteSpace: 'nowrap' }}>Ver todos</button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="dashboard-empty">
            Ainda não há registros para mostrar.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={cellHeader}>Pessoa</th>
                  <th style={cellHeader}>Ponto de controle</th>
                  <th style={cellHeader}>Horário</th>
                  <th style={cellHeader}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map(event => (
                  <tr key={event.id} className="table-row">
                    <td style={cellBody}>{event.person?.name || 'Pessoa não identificada'}</td>
                    <td style={{ ...cellBody, color: 'var(--text-muted)' }}>{event.controlPoint?.name || 'Sem ponto informado'}</td>
                    <td style={{ ...cellBody, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(event.occurred_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={cellBody}>
                      <span className={`tag ${event.access_result === 'allowed' ? 'tag-success' : 'tag-danger'}`}>
                        {event.access_result === 'allowed' ? 'Permitido' : 'Negado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="dashboard-note">
        A última localização indica onde ocorreu o registro mais recente, não necessariamente onde a pessoa está agora.
      </p>
    </div>
  );
}

function isToday(date: Date, today: Date) {
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

const cellHeader: CSSProperties = { padding: '9px 10px', fontSize: '0.75rem', fontWeight: 600 };
const cellBody: CSSProperties = { padding: '11px 10px', borderBottom: '1px solid var(--border-subtle)' };
