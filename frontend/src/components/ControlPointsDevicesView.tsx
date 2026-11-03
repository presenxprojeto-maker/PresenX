import React, { useState } from 'react';
import { Cpu, MapPin, Plus, Trash2, Radio, Clock, DoorOpen, Pencil, Check, X } from 'lucide-react';
import { dataService } from '../services/dataService';

interface ControlPointsDevicesViewProps {
  onRefresh: () => void;
}

export const ControlPointsDevicesView: React.FC<ControlPointsDevicesViewProps> = ({ onRefresh }) => {
  const controlPoints = dataService.getControlPoints();
  const devices = dataService.getDevices();
  const areas = dataService.getAreas();

  // States Ponto de Controle
  const [cpName, setCpName] = useState('');
  const [cpAreaId, setCpAreaId] = useState('');
  const [cpDesc, setCpDesc] = useState('');
  const [editingPointId, setEditingPointId] = useState<string | null>(null);

  // States Dispositivo
  const [devName, setDevName] = useState('');
  const [devCpId, setDevCpId] = useState('');
  const [devKey, setDevKey] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const handleSaveControlPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpName.trim()) return;
    const pointData = { name: cpName, area_id: cpAreaId || undefined, description: cpDesc || undefined };
    setFormError('');
    try {
      if (editingPointId) await dataService.updateControlPoint(editingPointId, pointData);
      else await dataService.addControlPoint({ ...pointData, active: true });
      setCpName('');
      setCpAreaId('');
      setCpDesc('');
      setEditingPointId(null);
      onRefresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o ponto de controle.');
    }
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim() || !devKey.trim()) return;
    try {
      const deviceData = { name: devName, control_point_id: devCpId || undefined, device_key: devKey };
      if (editingDeviceId) await dataService.updateDevice(editingDeviceId, deviceData);
      else await dataService.addDevice(deviceData);
      setEditingDeviceId(null);
      setFormError('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o dispositivo.');
      return;
    }
    setDevName('');
    setDevCpId('');
    setDevKey('');
    onRefresh();
  };

  const handlePingDevice = async (deviceId: string) => {
    try {
      await dataService.pingDevice(deviceId);
      onRefresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível atualizar o dispositivo.');
    }
  };

  const handleDeleteControlPoint = async (id: string, name: string) => {
    if (confirm(`Remover ponto de controle "${name}"?`)) {
      try {
        await dataService.deleteControlPoint(id);
        onRefresh();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Não foi possível excluir o ponto de controle.');
      }
    }
  };

  const startEditPoint = (id: string) => {
    const point = controlPoints.find(item => item.id === id);
    if (!point) return;
    setEditingPointId(id);
    setCpName(point.name);
    setCpAreaId(point.area_id || '');
    setCpDesc(point.description || '');
  };

  const startEditDevice = (id: string) => {
    const device = devices.find(item => item.id === id);
    if (!device) return;
    setEditingDeviceId(id);
    setDevName(device.name);
    setDevCpId(device.control_point_id || '');
    setDevKey(device.device_key);
    setFormError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="help-note">
        <strong>Como se conectam</strong>
        <span>O ponto de controle é onde o acesso é registrado. Associe-o a uma área e vincule o leitor físico a esse ponto.</span>
      </div>

      <div className="directory-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* PONTOS DE CONTROLE */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-subtle)', color: 'var(--brand)' }}>
              <DoorOpen size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Pontos de Controle ({controlPoints.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Entradas e locais de leitura
              </p>
            </div>
          </div>

          {/* Form Ponto de Controle */}
          <form onSubmit={handleSaveControlPoint} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              required
              placeholder="Nome do ponto (ex.: Catraca principal)"
              className="input-field"
              value={cpName}
              onChange={e => setCpName(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                className="input-field"
                value={cpAreaId}
                onChange={e => setCpAreaId(e.target.value)}
              >
                <option value="">Área Física...</option>
                {areas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Descrição (opcional)"
                className="input-field"
                value={cpDesc}
                onChange={e => setCpDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="submit" className="btn-solid" style={{ alignSelf: 'flex-start' }}>
                {editingPointId ? <Check size={14} /> : <Plus size={14} />}
                {editingPointId ? 'Salvar alterações' : 'Criar Ponto de Controle'}
              </button>
              {editingPointId && <button type="button" className="btn-outline" title="Cancelar edição" onClick={() => { setEditingPointId(null); setCpName(''); setCpAreaId(''); setCpDesc(''); }}><X size={14} /></button>}
            </div>
          </form>

          {/* Lista de Pontos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {controlPoints.map(cp => (
              <div
                key={cp.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)' }}>{cp.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span className="tag tag-brand" style={{ fontSize: '0.68rem' }}>
                      <MapPin size={10} /> {cp.area ? cp.area.name : 'Sem área'}
                    </span>
                    {cp.device && (
                      <span className="tag tag-neutral" style={{ fontSize: '0.68rem' }}>
                        <Cpu size={10} /> {cp.device.name}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEditPoint(cp.id)} className="btn-icon" title="Editar ponto"><Pencil size={12} /></button>
                  <button onClick={() => handleDeleteControlPoint(cp.id, cp.name)} className="btn-danger-subtle" title="Remover ponto"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISPOSITIVOS (HARDWARE ESP32) */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Dispositivos de Hardware ({devices.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Leitores vinculados a um ponto
              </p>
            </div>
          </div>

          {/* Form Dispositivo */}
          <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                required
                placeholder="Nome (ex: ESP32 Bloco B)"
                className="input-field"
                value={devName}
                onChange={e => setDevName(e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="Chave (ex: px_key_002)"
                className="input-field"
                value={devKey}
                onChange={e => setDevKey(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="input-field"
                style={{ flex: 1 }}
                value={devCpId}
                onChange={e => setDevCpId(e.target.value)}
              >
                <option value="">Associar a Ponto de Controle...</option>
                {controlPoints.map(cp => (
                  <option key={cp.id} value={cp.id}>{cp.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn-solid" style={{ whiteSpace: 'nowrap' }}>
                  {editingDeviceId ? <Check size={14} /> : <Plus size={14} />}
                  {editingDeviceId ? 'Salvar' : 'Cadastrar Hardware'}
                </button>
                {editingDeviceId && <button type="button" className="btn-outline" title="Cancelar edição" onClick={() => { setEditingDeviceId(null); setDevName(''); setDevCpId(''); setDevKey(''); setFormError(''); }}><X size={14} /></button>}
              </div>
            </div>
            {formError && <p role="alert" style={{ color: 'var(--rose)', fontSize: '0.75rem', margin: 0 }}>{formError}</p>}
          </form>

          {/* Lista de Dispositivos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {devices.map(d => {
              return (
                <div
                  key={d.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)' }}>{d.name}</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                      Ponto: <strong>{d.controlPoint?.name || 'Não associado'}</strong>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} /> Último ping de demonstração: {d.last_seen_at ? new Date(d.last_seen_at).toLocaleTimeString('pt-BR') : 'nenhum'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => startEditDevice(d.id)} className="btn-icon" title="Editar dispositivo"><Pencil size={12} /></button>
                    <button
                      onClick={() => handlePingDevice(d.id)}
                      className="btn-outline"
                    title="Simular ping de demonstração"
                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    >
                      <Radio size={12} color="var(--emerald)" /> Simular ping
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
