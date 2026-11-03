import React, { useState } from 'react';
import { Radio, X, CheckCircle2, AlertOctagon, Zap } from 'lucide-react';
import { dataService } from '../services/dataService';
import type { EventType } from '../types/domain';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventProcessed: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onEventProcessed,
}) => {
  if (!isOpen) return null;

  const people = dataService.getPeople();
  const controlPoints = dataService.getControlPoints();

  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [customRfid, setCustomRfid] = useState<string>('');
  const [selectedCpId, setSelectedCpId] = useState<string>(controlPoints[0]?.id || '');
  const [overrideType, setOverrideType] = useState<string>('auto');

  const [feedback, setFeedback] = useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    let identifierToUse = customRfid.trim();
    if (!identifierToUse && selectedPersonId) {
      const person = people.find(p => p.id === selectedPersonId);
      identifierToUse = person?.identifier || '';
    }

    if (!identifierToUse) {
      setFeedback({
        success: false,
        title: 'Cartão não informado',
        message: 'Selecione uma pessoa com cartão ou digite um código para simular a leitura.',
      });
      return;
    }

    if (!selectedCpId) {
      setFeedback({
        success: false,
        title: 'Ponto não selecionado',
        message: 'Selecione o ponto de controle onde a leitura será registrada.',
      });
      return;
    }

    try {
      const result = dataService.processIdentification({
        identifier: identifierToUse,
        control_point_id: selectedCpId,
        overrideEventType: overrideType === 'auto' ? undefined : (overrideType as EventType),
      });

      setFeedback({
        success: result.allowed,
        title: result.allowed ? 'Leitura Autorizada' : 'Acesso Negado',
        message: `${result.message} — Pessoa: ${result.person?.name || 'Desconhecida'}`,
      });

      onEventProcessed();
    } catch (err: any) {
      setFeedback({
        success: false,
        title: 'Falha na Validação',
        message: err.message || 'Erro ao processar identificação.',
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>
              <Radio size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Simular identificação
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Esta ação cria um registro de demonstração, não lê um cartão físico.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Selecionar Pessoa ou Digitar RFID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Cartão ou pessoa
            </label>

            <select
              className="input-field"
              value={selectedPersonId}
              onChange={e => {
                setSelectedPersonId(e.target.value);
                setCustomRfid('');
              }}
            >
              <option value="">Digitar RFID manual avulso...</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.identifier ? `(RFID: ${p.identifier})` : '(Sem RFID)'} - {p.sector?.name || 'Sem setor'}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ou digite o código do cartão:</span>
              <input
                type="text"
                placeholder="Ex: 5A11D399 ou cartão não cadastrado"
                className="input-field"
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                value={customRfid}
                onChange={e => {
                  setCustomRfid(e.target.value);
                  setSelectedPersonId('');
                }}
              />
            </div>
          </div>

          {/* Selecionar Ponto de Controle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Ponto de controle
            </label>
            <select
              className="input-field"
              value={selectedCpId}
              onChange={e => setSelectedCpId(e.target.value)}
            >
              {controlPoints.map(cp => (
                <option key={cp.id} value={cp.id}>
                  {cp.name} (Área: {cp.area?.name || 'Geral'}) {cp.device ? `[${cp.device.name}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Evento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Tipo de registro
            </label>
            <select
              className="input-field"
              value={overrideType}
              onChange={e => setOverrideType(e.target.value)}
            >
              <option value="auto">Automático</option>
              <option value="entry">Entrada</option>
              <option value="exit">Saída</option>
              <option value="identification">Identificação em área</option>
            </select>
          </div>

          {/* Feedback Visual */}
          {feedback && (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: feedback.success ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
              border: feedback.success ? '1px solid var(--emerald-border)' : '1px solid var(--rose-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              {feedback.success ? (
                <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertOctagon size={20} color="var(--rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: feedback.success ? 'var(--emerald)' : 'var(--rose)' }}>
                  {feedback.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {feedback.message}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-outline">
              Fechar
            </button>
            <button type="submit" className="btn-solid" style={{ padding: '8px 16px' }}>
              <Zap size={15} />
              <span>Simular leitura</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
