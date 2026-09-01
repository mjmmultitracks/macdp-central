import React, { useState } from 'react';
import { PatrimonyAsset } from '../../types';
import {
  addPatrimonyAsset,
  updatePatrimonyAsset,
  deletePatrimonyAsset,
} from '../../services/db';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Archive,
  QrCode,
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  XCircle,
  Edit2,
  Trash2,
  Printer,
  DollarSign,
  Layers,
  MapPin,
  Building,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface PatrimonyManagerProps {
  assets: PatrimonyAsset[];
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PatrimonyManager: React.FC<PatrimonyManagerProps> = ({
  assets,
  onNotify,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Asset Modal State (Create / Edit)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PatrimonyAsset | null>(null);
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState<PatrimonyAsset['category']>('Áudio & Instrumentos');
  const [location, setLocation] = useState('Auditório Principal (Cabine de Som)');
  const [department, setDepartment] = useState('Louvor & Mídia');
  const [status, setStatus] = useState<PatrimonyAsset['status']>('ativo');
  const [condition, setCondition] = useState<PatrimonyAsset['condition']>('Excelente');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedValue, setEstimatedValue] = useState<number>(5000);
  const [serialNumber, setSerialNumber] = useState('');
  const [donorOrVendor, setDonorOrVendor] = useState('Distribuidora Manaus');
  const [notes, setNotes] = useState('');

  // Print Tag Modal State
  const [tagModalAsset, setTagModalAsset] = useState<PatrimonyAsset | null>(null);

  // Handlers for Asset Modal
  const openNewAssetModal = () => {
    setEditingAsset(null);
    setAssetName('');
    setCategory('Áudio & Instrumentos');
    setLocation('Auditório Principal (Cabine de Som)');
    setDepartment('Louvor & Mídia');
    setStatus('ativo');
    setCondition('Excelente');
    setAcquisitionDate(new Date().toISOString().split('T')[0]);
    setEstimatedValue(2500);
    setSerialNumber('');
    setDonorOrVendor('Manaus Pro Áudio');
    setNotes('');
    setIsAssetModalOpen(true);
  };

  const openEditAssetModal = (asset: PatrimonyAsset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setCategory(asset.category);
    setLocation(asset.location);
    setDepartment(asset.department);
    setStatus(asset.status);
    setCondition(asset.condition);
    setAcquisitionDate(asset.acquisitionDate);
    setEstimatedValue(asset.estimatedValue);
    setSerialNumber(asset.serialNumber || '');
    setDonorOrVendor(asset.donorOrVendor || '');
    setNotes(asset.notes || '');
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !location.trim() || !department.trim()) {
      onNotify('error', 'Preencha o nome do bem, localização e departamento.');
      return;
    }

    if (editingAsset) {
      updatePatrimonyAsset(editingAsset.id, {
        name: assetName,
        category,
        location,
        department,
        status,
        condition,
        acquisitionDate,
        estimatedValue: Number(estimatedValue) || 0,
        serialNumber,
        donorOrVendor,
        notes,
      });
      onNotify('success', `Bem patrimonial "${assetName}" atualizado com sucesso!`);
    } else {
      addPatrimonyAsset({
        name: assetName,
        category,
        location,
        department,
        status,
        condition,
        acquisitionDate,
        estimatedValue: Number(estimatedValue) || 0,
        serialNumber,
        donorOrVendor,
        notes,
      });
      onNotify('success', `Bem patrimonial "${assetName}" cadastrado e tombado com sucesso!`);
    }

    setIsAssetModalOpen(false);
  };

  const handleDeleteAsset = (asset: PatrimonyAsset) => {
    if (window.confirm(`Deseja realmente remover o bem patrimonial "${asset.name}" (${asset.tagNumber})?`)) {
      deletePatrimonyAsset(asset.id);
      onNotify('info', `Bem "${asset.name}" removido do inventário.`);
    }
  };

  // Metrics
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.status !== 'baixado' ? a.estimatedValue : 0), 0);
  const activeAssetsCount = assets.filter((a) => a.status === 'ativo').length;
  const maintenanceCount = assets.filter((a) => a.status === 'em_manutencao').length;
  const inactiveCount = assets.filter((a) => a.status === 'inativo' || a.status === 'baixado').length;

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = categoryFilter === 'todos' || a.category === categoryFilter;
    const matchStatus = statusFilter === 'todos' || a.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Toolbar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Archive size={22} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Controle de Patrimônio & Bens (MACDP)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Identificação de bens com etiquetas patrimoniais, controle de ativos e inativos, localização no templo e avaliação contábil
          </p>
        </div>

        <button onClick={openNewAssetModal} className="btn btn-primary" style={{ gap: '0.45rem' }}>
          <Plus size={16} />
          <span>Novo Bem Patrimonial</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Valor Total do Patrimônio</span>
            <DollarSign size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {formatCurrency(totalAssetsValue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {assets.length} bens tombados no templo
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bens Ativos em Uso</span>
            <CheckCircle2 size={18} color="var(--status-success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--status-success)' }}>
            {activeAssetsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Operando normalmente nos cultos
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Em Manutenção</span>
            <Wrench size={18} color="var(--status-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--status-warning)' }}>
            {maintenanceCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Aguardando reparo técnico
          </div>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Inativos ou Baixados</span>
            <XCircle size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-secondary)' }}>
            {inactiveCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Descartados ou fora de operação
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por nome, código (ex: PAT-00101), sala ou serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="todos">Todas as Categorias</option>
            <option value="Áudio & Instrumentos">Áudio & Instrumentos</option>
            <option value="Vídeo & Iluminação">Vídeo & Iluminação</option>
            <option value="Informática & TI">Informática & TI</option>
            <option value="Mobiliário">Mobiliário</option>
            <option value="Climatização">Climatização</option>
            <option value="Estrutura & Outros">Estrutura & Outros</option>
          </select>

          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativos (Em Uso)</option>
            <option value="em_manutencao">Em Manutenção</option>
            <option value="inativo">Inativos</option>
            <option value="baixado">Baixados</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="card card-hover"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: `1px solid ${
                asset.status === 'em_manutencao'
                  ? 'var(--status-warning)'
                  : asset.status === 'ativo'
                  ? 'var(--border-medium)'
                  : 'var(--border-subtle)'
              }`,
              opacity: asset.status === 'baixado' ? 0.7 : 1,
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: 'var(--accent-blue-light)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    fontFamily: 'monospace',
                  }}
                >
                  🏷️ {asset.tagNumber}
                </span>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span
                    className={`badge ${
                      asset.status === 'ativo'
                        ? 'badge-success'
                        : asset.status === 'em_manutencao'
                        ? 'badge-gold'
                        : 'badge-danger'
                    }`}
                  >
                    {asset.status === 'ativo'
                      ? 'Ativo'
                      : asset.status === 'em_manutencao'
                      ? 'Em Manutenção'
                      : asset.status === 'inativo'
                      ? 'Inativo'
                      : 'Baixado'}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {asset.name}
              </h4>

              <div style={{ fontSize: '0.84rem', color: 'var(--accent-gold-light)', fontWeight: 600, marginBottom: '0.85rem' }}>
                {asset.category} • Conservação: {asset.condition}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={15} color="var(--accent-gold)" />
                  <span><strong>Localização:</strong> {asset.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building size={15} color="var(--accent-blue-light)" />
                  <span><strong>Departamento:</strong> {asset.department}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <DollarSign size={15} color="var(--status-success)" />
                  <span><strong>Valor Estimado:</strong> {formatCurrency(asset.estimatedValue)}</span>
                </div>

                {asset.serialNumber && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Serial / Modelo: {asset.serialNumber}
                  </div>
                )}

                {asset.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                    "{asset.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.4rem',
              }}
            >
              <button
                onClick={() => setTagModalAsset(asset)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem', color: 'var(--accent-gold)', flex: 1 }}
                title="Visualizar e Imprimir Etiqueta Patrimonial"
              >
                <Tag size={15} />
                <span>Etiqueta</span>
              </button>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => openEditAssetModal(asset)}
                  className="btn btn-secondary btn-sm"
                  title="Editar Bem"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteAsset(asset)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--status-error)' }}
                  title="Excluir / Dar Baixa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <Archive size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum bem patrimonial encontrado</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tente alterar os filtros de busca ou cadastre um novo item.
            </p>
            <button onClick={openNewAssetModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Cadastrar Novo Bem
            </button>
          </div>
        )}
      </div>

      {/* ==================== MODAL DE ETIQUETA PATRIMONIAL (PLAQUETA) ==================== */}
      <Modal
        isOpen={!!tagModalAsset}
        onClose={() => setTagModalAsset(null)}
        title="Etiqueta de Tombamento Patrimonial"
        maxWidth="520px"
      >
        {tagModalAsset && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            {/* Plaqueta Visual Estilizada */}
            <div
              id="printable-asset-tag"
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Plaque Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src="/images/logo.png" alt="MACDP" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#FBBF24', display: 'block', letterSpacing: '0.5px' }}>
                      MACDP CENTRAL
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA</span>
                  </div>
                </div>
                <QrCode size={36} color="#FBBF24" />
              </div>

              {/* Tag Center Code */}
              <div style={{ textAlign: 'center', padding: '0.75rem 0', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>
                  CÓDIGO DO PATRIMÔNIO
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '3px', color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {tagModalAsset.tagNumber}
                </div>
              </div>

              {/* Asset Details */}
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div><strong>Item:</strong> {tagModalAsset.name}</div>
                <div><strong>Local:</strong> {tagModalAsset.location}</div>
                <div><strong>Departamento:</strong> {tagModalAsset.department}</div>
              </div>

              {/* Security Warning Footer */}
              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.2)', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                PATRIMÔNIO ECLESIÁSTICO INALIENÁVEL • NÃO REMOVER ESTA ETIQUETA
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  onNotify('success', `Etiqueta do bem ${tagModalAsset.tagNumber} pronta para impressão!`);
                }}
                className="btn btn-primary"
                style={{ gap: '0.45rem' }}
              >
                <Printer size={16} />
                <span>Imprimir Plaqueta Patrimonial</span>
              </button>

              <button
                type="button"
                onClick={() => setTagModalAsset(null)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL CRIAR / EDITAR BEM ==================== */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title={editingAsset ? `Editar Bem: ${editingAsset.name} (${editingAsset.tagNumber})` : 'Cadastrar e Tombar Bem Patrimonial'}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveAsset}>
          <div className="form-group">
            <label className="form-label">Nome / Descrição do Bem *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ex: Console de Áudio Digital Yamaha TF5 (32 Canais)"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="Áudio & Instrumentos">Áudio & Instrumentos</option>
                <option value="Vídeo & Iluminação">Vídeo & Iluminação</option>
                <option value="Informática & TI">Informática & TI</option>
                <option value="Mobiliário">Mobiliário</option>
                <option value="Climatização">Climatização</option>
                <option value="Estrutura & Outros">Estrutura & Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento / Ministério *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Louvor & Mídia"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Localização no Templo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: Auditório Principal (Cabine de Som)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor Estimado / Aquisição (R$) *</label>
              <input
                type="number"
                min={0}
                required
                className="form-input"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="ativo">Ativo (Em Uso)</option>
                <option value="em_manutencao">Em Manutenção</option>
                <option value="inativo">Inativo</option>
                <option value="baixado">Baixado / Descartado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado de Conservação *</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bom">Bom</option>
                <option value="Regular">Regular</option>
                <option value="Danificado">Danificado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Aquisição</label>
              <input
                type="date"
                required
                className="form-input"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Número de Série / Modelo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: YMH-TF5-99281"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fornecedor / Doador</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Importadora Manaus Áudio Pro"
                value={donorOrVendor}
                onChange={(e) => setDonorOrVendor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações / Histórico de Manutenção</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Histórico do bem, detalhes sobre peças trocadas ou especificações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAssetModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingAsset ? 'Salvar Alterações' : 'Cadastrar e Gerar Etiqueta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
