import React, { useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  UserRoundX,
  UserRoundCheck,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Layers,
  MapPin,
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface PeopleViewProps {
  onRefresh: () => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ onRefresh }) => {
  const people = dataService.getPeople();
  const sectors = dataService.getSectors();
  const areas = dataService.getAreas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [active, setActive] = useState(true);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleArea = (areaId: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const personData = {
        name,
        sector_id: sectorId || undefined,
        identifier: identifier.trim() || undefined,
        active,
        authorizedAreaIds: selectedAreaIds,
      };
      if (editingPersonId) await dataService.updatePerson(editingPersonId, personData);
      else await dataService.addPerson(personData);

      closePersonForm();
      onRefresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a pessoa.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateForm = () => {
    setEditingPersonId(null);
    setName('');
    setSectorId('');
    setIdentifier('');
    setActive(true);
    setSelectedAreaIds([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditForm = (personId: string) => {
    const person = people.find(item => item.id === personId);
    if (!person) return;
    setEditingPersonId(person.id);
    setName(person.name);
    setSectorId(person.sector_id || '');
    setIdentifier(person.identifier || '');
    setActive(person.active);
    setSelectedAreaIds(dataService.getPermissionsForPerson(person.id).map(area => area.id));
    setFormError('');
    setIsModalOpen(true);
  };

  const closePersonForm = () => {
    setIsModalOpen(false);
    setEditingPersonId(null);
    setFormError('');
  };

  const handleToggleActive = async (id: string, personName: string, currentlyActive: boolean) => {
    const nextActive = !currentlyActive;
    const action = nextActive ? 'reativar' : 'desativar';
    if (confirm(`Deseja ${action} o cadastro de "${personName}"?`)) {
      try {
        await dataService.setPersonActive(id, nextActive);
        onRefresh();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Não foi possível atualizar o cadastro.');
      }
    }
  };

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.identifier && p.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sector && p.sector.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px', position: 'relative' }}>
          <Search size={15} color="var(--text-sub)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '34px' }}
            placeholder="Buscar por nome, código RFID ou setor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={openCreateForm} className="btn-solid">
          <Plus size={15} />
          <span>Nova pessoa</span>
        </button>
      </div>

      {/* Tabela de Pessoas */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--brand)" />
              <span>Pessoas cadastradas ({filteredPeople.length})</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              Cadastro, cartão RFID e áreas com acesso
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Nome Completo</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Setor Principal</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Identificador (RFID)</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Áreas Autorizadas</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-sub)' }}>
                    Nenhum indivíduo encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredPeople.map(p => {
                  const permAreas = dataService.getPermissionsForPerson(p.id);

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '4px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)'
                          }}>
                            {p.name.charAt(0)}
                          </div>
                          <span>{p.name}</span>
                        </div>
                      </td>

                      <td style={{ padding: '10px' }}>
                        {p.sector ? (
                          <span className="tag tag-indigo">
                            <Layers size={11} /> {p.sector.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>Sem setor</span>
                        )}
                      </td>

                      <td style={{ padding: '10px' }}>
                        {p.identifier ? (
                          <span className="tag tag-brand" style={{ fontFamily: 'var(--font-mono)' }}>
                            <Tag size={11} /> {p.identifier}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>Sem credencial</span>
                        )}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                          {permAreas.length === 0 ? (
                            <span style={{ color: 'var(--text-sub)', fontSize: '0.72rem' }}>Nenhuma área autorizada</span>
                          ) : (
                            permAreas.map(a => (
                              <span key={a.id} className="tag tag-neutral" style={{ fontSize: '0.68rem' }}>
                                <MapPin size={10} /> {a.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '10px' }}>
                        {p.active ? (
                          <span className="tag tag-success">
                            <CheckCircle2 size={11} /> Ativo
                          </span>
                        ) : (
                          <span className="tag tag-danger">
                            <XCircle size={11} /> Inativo
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button
                          onClick={() => openEditForm(p.id)}
                          className="btn-icon"
                          title="Editar pessoa"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p.id, p.name, p.active)}
                          className={p.active ? 'btn-danger-subtle' : 'btn-icon'}
                          title={p.active ? 'Desativar cadastro' : 'Reativar cadastro'}
                          style={{ marginLeft: '4px' }}
                        >
                          {p.active ? <UserRoundX size={13} /> : <UserRoundCheck size={13} />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Pessoa */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="panel modal-content person-dialog" role="dialog" aria-modal="true" aria-labelledby="person-dialog-title" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'var(--bg-surface)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--brand)" />
                <h3 id="person-dialog-title" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
                  {editingPersonId ? 'Editar pessoa' : 'Nova pessoa'}
                </h3>
              </div>
              <button onClick={closePersonForm} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <p className="person-form-intro">
              Comece pelo nome. Setor, cartão e permissões podem ser preenchidos agora ou depois.
            </p>

            <form onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ex.: Ana Souza"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="person-secondary-fields">
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Setor (opcional)
                  </label>
                  <select
                    className="input-field"
                    value={sectorId}
                    onChange={e => setSectorId(e.target.value)}
                  >
                    <option value="">Sem setor</option>
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Cartão RFID (opcional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Código do cartão"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <details className="form-advanced">
                <summary>
                  <span>Permissões de acesso</span>
                  <span className="form-advanced-count">{selectedAreaIds.length} áreas</span>
                </summary>
                <p>Marque as áreas restritas que esta pessoa pode acessar.</p>
                <div style={{
                  maxHeight: '130px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  background: 'var(--bg-app)'
                }}>
                  {areas.map(a => {
                    const isChecked = selectedAreaIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.8rem',
                          color: isChecked ? 'var(--text-main)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: 'var(--radius-xs)',
                          background: isChecked ? 'var(--brand-subtle)' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleArea(a.id)}
                          style={{ accentColor: 'var(--brand)' }}
                        />
                        <span>{a.name}</span>
                      </label>
                    );
                  })}
                </div>
              </details>

              {editingPersonId && (
                <label className="person-active-toggle">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    style={{ accentColor: 'var(--brand)' }}
                  />
                  Cadastro ativo
                </label>
              )}

              {/* Botoes de Ação */}
              {formError && (
                <p role="alert" style={{ color: 'var(--rose)', fontSize: '0.78rem', margin: 0 }}>
                  {formError}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={closePersonForm} className="btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn-solid" disabled={isSaving}>
                  {isSaving ? 'Salvando…' : editingPersonId ? 'Salvar alterações' : 'Salvar pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
