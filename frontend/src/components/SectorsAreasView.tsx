import React, { useState } from 'react';
import { Plus, Trash2, FolderTree, DoorOpen, Pencil, X, Check } from 'lucide-react';
import { dataService } from '../services/dataService';

interface SectorsAreasViewProps {
  onRefresh: () => void;
}

export const SectorsAreasView: React.FC<SectorsAreasViewProps> = ({ onRefresh }) => {
  const sectors = dataService.getSectors();
  const areas = dataService.getAreas();

  // States para Setor
  const [secName, setSecName] = useState('');
  const [secDesc, setSecDesc] = useState('');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);

  // States para Área
  const [areaName, setAreaName] = useState('');
  const [areaDesc, setAreaDesc] = useState('');
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState('');

  const handleSaveSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim()) return;
    setOperationError('');
    try {
      if (editingSectorId) await dataService.updateSector(editingSectorId, { name: secName, description: secDesc });
      else await dataService.addSector({ name: secName, description: secDesc });
      setSecName('');
      setSecDesc('');
      setEditingSectorId(null);
      onRefresh();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Não foi possível salvar o setor.');
    }
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;
    setOperationError('');
    try {
      if (editingAreaId) await dataService.updateArea(editingAreaId, { name: areaName, description: areaDesc });
      else await dataService.addArea({ name: areaName, description: areaDesc });
      setAreaName('');
      setAreaDesc('');
      setEditingAreaId(null);
      onRefresh();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Não foi possível salvar a área.');
    }
  };

  const startEditSector = (id: string) => {
    const sector = sectors.find(item => item.id === id);
    if (!sector) return;
    setEditingSectorId(id);
    setSecName(sector.name);
    setSecDesc(sector.description || '');
  };

  const startEditArea = (id: string) => {
    const area = areas.find(item => item.id === id);
    if (!area) return;
    setEditingAreaId(id);
    setAreaName(area.name);
    setAreaDesc(area.description || '');
  };

  const handleDeleteSector = async (id: string, name: string) => {
    if (confirm(`Excluir o setor "${name}"? Pessoas associadas terão o vínculo de setor desfeito.`)) {
      try {
        await dataService.deleteSector(id);
        onRefresh();
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : 'Não foi possível excluir o setor.');
      }
    }
  };

  const handleDeleteArea = async (id: string, name: string) => {
    if (confirm(`Excluir a área "${name}"? Pontos de controle e permissões vinculadas serão removidos.`)) {
      try {
        await dataService.deleteArea(id);
        onRefresh();
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : 'Não foi possível excluir a área.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="help-note">
        <strong>Como funciona</strong>
        <span>Setor organiza as pessoas por equipe. Área é um espaço físico, como uma sala ou portaria. As áreas liberadas definem onde cada pessoa pode passar.</span>
      </div>
      {operationError && <p role="alert" className="form-error">{operationError}</p>}

      <div className="directory-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* COLUNA 1: SETORES (ADMINISTRATIVO) */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo-subtle)', color: 'var(--indigo)' }}>
              <FolderTree size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Setores Administrativos ({sectors.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Vínculo funcional e hierárquico
              </p>
            </div>
          </div>

          {/* Form Adicionar Setor */}
          <form onSubmit={handleSaveSector} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              required
              placeholder="Nome do Setor (ex: Manutenção TI)"
              className="input-field"
              value={secName}
              onChange={e => setSecName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Descrição (opcional)"
                className="input-field"
                style={{ flex: 1 }}
                value={secDesc}
                onChange={e => setSecDesc(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn-solid" style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                  {editingSectorId ? <Check size={14} /> : <Plus size={14} />}
                  {editingSectorId ? 'Salvar' : 'Adicionar'}
                </button>
                {editingSectorId && <button type="button" className="btn-outline" title="Cancelar edição" onClick={() => { setEditingSectorId(null); setSecName(''); setSecDesc(''); }}><X size={14} /></button>}
              </div>
            </div>
          </form>

          {/* Lista de Setores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {sectors.map(s => (
              <div
                key={s.id}
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
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)' }}>{s.name}</div>
                  {s.description && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                      {s.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEditSector(s.id)} className="btn-icon" title="Editar setor"><Pencil size={12} /></button>
                  <button onClick={() => handleDeleteSector(s.id, s.name)} className="btn-danger-subtle" title="Excluir setor"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 2: ÁREAS (ESPAÇOS FÍSICOS) */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-subtle)', color: 'var(--brand)' }}>
              <DoorOpen size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Áreas Físicas ({areas.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Locais e salas onde ocorrem eventos de acesso
              </p>
            </div>
          </div>

          {/* Form Adicionar Área */}
          <form onSubmit={handleSaveArea} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              required
              placeholder="Nome da Área (ex: Laboratório 2)"
              className="input-field"
              value={areaName}
              onChange={e => setAreaName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Descrição do local (opcional)"
                className="input-field"
                style={{ flex: 1 }}
                value={areaDesc}
                onChange={e => setAreaDesc(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn-solid" style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                  {editingAreaId ? <Check size={14} /> : <Plus size={14} />}
                  {editingAreaId ? 'Salvar' : 'Adicionar'}
                </button>
                {editingAreaId && <button type="button" className="btn-outline" title="Cancelar edição" onClick={() => { setEditingAreaId(null); setAreaName(''); setAreaDesc(''); }}><X size={14} /></button>}
              </div>
            </div>
          </form>

          {/* Lista de Áreas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {areas.map(a => (
              <div
                key={a.id}
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
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)' }}>{a.name}</div>
                  {a.description && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                      {a.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEditArea(a.id)} className="btn-icon" title="Editar área"><Pencil size={12} /></button>
                  <button onClick={() => handleDeleteArea(a.id, a.name)} className="btn-danger-subtle" title="Excluir área"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
