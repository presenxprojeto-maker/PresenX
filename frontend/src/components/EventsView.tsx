import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Filter, Search, MapPin, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';

export const EventsView: React.FC = () => {
  const events = dataService.getEvents(200);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');

  const filteredEvents = events.filter(ev => {
    const matchesSearch =
      (ev.person?.name && ev.person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.identifier && ev.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.controlPoint?.name && ev.controlPoint.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.controlPoint?.area?.name && ev.controlPoint.area.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ev.person?.identifier && ev.person.identifier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || ev.event_type === filterType;
    const matchesResult = filterResult === 'all' || ev.access_result === filterResult;

    return matchesSearch && matchesType && matchesResult;
  });
  const allowedCount = filteredEvents.filter(event => event.access_result === 'allowed').length;
  const deniedCount = filteredEvents.length - allowedCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Filter Bar */}
      <div className="panel events-filter-bar" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={15} color="var(--text-sub)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '34px' }}
            placeholder="Buscar pessoa, ponto ou cartão"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="var(--text-sub)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Tipo:</span>
            <select
              className="input-field"
              aria-label="Filtrar por tipo de evento"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="entry">Entrada</option>
              <option value="exit">Saída</option>
              <option value="identification">Identificação</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Resultado:</span>
            <select
              className="input-field"
              aria-label="Filtrar por resultado"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="allowed">Autorizado</option>
              <option value="denied">Negado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Eventos */}
      <div className="panel events-results-panel" style={{ padding: '20px' }}>
        <div className="events-results-heading">
          <div>
            <h2>Registros encontrados</h2>
            <p>{filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'} com os filtros atuais</p>
          </div>
          <div className="events-results-counts" aria-label={`${allowedCount} autorizados e ${deniedCount} negados`}>
            <span className="tag tag-success">{allowedCount} autorizados</span>
            <span className="tag tag-danger">{deniedCount} negados</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="events-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Data e hora</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Pessoa</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Local</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Acesso</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Observação</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-sub)' }}>
                    Nenhum evento registrado corresponde aos filtros informados.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(ev => {
                  const isAllowed = ev.access_result === 'allowed';
                  const dateObj = new Date(ev.occurred_at);
                  const dateStr = dateObj.toLocaleDateString('pt-BR');
                  const timeStr = dateObj.toLocaleTimeString('pt-BR');

                  return (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--text-sub)" /> {timeStr}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{dateStr}</div>
                      </td>

                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ev.person?.name || 'Não identificado'}</div>
                        {ev.person?.identifier && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                            RFID: {ev.person.identifier}
                          </div>
                        )}
                        {!ev.person && ev.identifier && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                            Cartão: {ev.identifier}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{ev.controlPoint?.name || 'Local não informado'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} /> {ev.controlPoint?.area?.name || 'Área não informada'}
                        </div>
                      </td>

                      <td style={{ padding: '10px' }}>
                        <span className="tag tag-neutral" style={{ textTransform: 'capitalize' }}>
                          {ev.event_type === 'entry' ? 'Entrada' : ev.event_type === 'exit' ? 'Saída' : 'Identificação'}
                        </span>
                      </td>

                      <td style={{ padding: '10px' }}>
                        {isAllowed ? (
                          <span className="tag tag-success">
                            <ShieldCheck size={11} /> Autorizado
                          </span>
                        ) : (
                          <span className="tag tag-danger">
                            <ShieldAlert size={11} /> Negado
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '10px', color: 'var(--text-sub)', fontSize: '0.75rem' }}>
                        {ev.metadata ? (
                          <span>
                            {String(ev.metadata.note || ev.metadata.reason || ev.metadata.status || 'Registrado')}
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
