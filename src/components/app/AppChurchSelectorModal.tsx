import React, { useState, useMemo } from 'react';
import { ChurchProfile } from '../../types';
import {
  getChurchCatalog,
  getSelectedChurchId,
  setSelectedChurchId,
} from '../../services/churchCatalogService';
import {
  Search,
  MapPin,
  CheckCircle2,
  Building2,
  X,
  Radio,
  QrCode,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AppChurchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChurch?: (church: ChurchProfile) => void;
  canClose?: boolean;
}

export const AppChurchSelectorModal: React.FC<AppChurchSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectChurch,
  canClose = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [activeChurchId, setActiveChurchId] = useState<string>(() => getSelectedChurchId());
  const [quickCode, setQuickCode] = useState('');
  const [quickCodeError, setQuickCodeError] = useState('');

  const catalog = useMemo(() => getChurchCatalog(), [isOpen]);

  // Unique cities for quick filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set);
  }, [catalog]);

  // Filtered churches
  const filteredChurches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog.filter((c) => {
      const matchCity =
        selectedCityFilter === 'all' ||
        c.city.toLowerCase() === selectedCityFilter.toLowerCase();

      if (!matchCity) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.neighborhood?.toLowerCase().includes(q) ||
        c.pastorPresident?.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    });
  }, [catalog, searchQuery, selectedCityFilter]);

  if (!isOpen) return null;

  const handlePickChurch = (church: ChurchProfile) => {
    setSelectedChurchId(church.id);
    setActiveChurchId(church.id);
    if (onSelectChurch) {
      onSelectChurch(church);
    }
    onClose();
  };

  const handleApplyQuickCode = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCodeError('');
    const code = quickCode.trim().toLowerCase();
    if (!code) return;

    const found = catalog.find(
      (c) => c.id.toLowerCase() === code || c.slug.toLowerCase() === code
    );
    if (found) {
      handlePickChurch(found);
    } else {
      setQuickCodeError('Congregação não encontrada com este código.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="animate-page-enter"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'relative',
          }}
        >
          {canClose && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Encontre sua Igreja
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-gold, #f59e0b)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  Hub
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Selecione sua congregação para ter cultos, células e avisos da sua comunidade
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginTop: '0.5rem' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, pastor, bairro ou cidade..."
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: searchQuery ? '2.5rem' : '1rem',
                fontSize: '0.85rem',
                borderRadius: '14px',
                background: 'var(--bg-primary)',
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* City Filter Chips */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginTop: '0.65rem',
              overflowX: 'auto',
              paddingBottom: '0.2rem',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCityFilter('all')}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: selectedCityFilter === 'all' ? 700 : 500,
                background: selectedCityFilter === 'all' ? 'var(--accent-gold, #f59e0b)' : 'var(--bg-primary)',
                color: selectedCityFilter === 'all' ? '#0B1120' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              Todas as Cidades
            </button>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCityFilter(city)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: selectedCityFilter === city ? 700 : 500,
                  background: selectedCityFilter === city ? 'var(--accent-gold, #f59e0b)' : 'var(--bg-primary)',
                  color: selectedCityFilter === city ? '#0B1120' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Content: List of churches */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {filteredChurches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Building2 size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Nenhuma igreja encontrada
              </p>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Tente buscar por &quot;Manaus&quot;, &quot;MACDP&quot; ou o nome do bairro.
              </p>
            </div>
          ) : (
            filteredChurches.map((church) => {
              const isSelected = church.id === activeChurchId;
              return (
                <div
                  key={church.id}
                  onClick={() => handlePickChurch(church)}
                  style={{
                    padding: '0.95rem 1rem',
                    borderRadius: '16px',
                    border: isSelected ? '1.5px solid var(--accent-gold, #f59e0b)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                    {/* Church Logo */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={church.logoUrl || '/icon-192.png'}
                        alt={church.shortName}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon-192.png';
                        }}
                      />
                      {church.isLiveNow && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#EF4444',
                            border: '2px solid var(--bg-primary)',
                          }}
                        />
                      )}
                    </div>

                    {/* Church Info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                          {church.shortName}
                        </strong>
                        {church.isVerified && (
                          <span title="Igreja Oficial Verificada" style={{ display: 'inline-flex' }}>
                            <ShieldCheck size={15} color="#10B981" />
                          </span>
                        )}
                        {church.isLiveNow && (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#EF4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Radio size={9} /> Ao Vivo
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          margin: '0.15rem 0 0.3rem 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {church.name}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.725rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} color="var(--accent-gold, #f59e0b)" />
                          {church.neighborhood ? `${church.neighborhood}, ` : ''}
                          {church.city} - {church.state}
                        </span>
                        {church.pastorPresident && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={12} />
                            {church.pastorPresident}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {isSelected ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          background: 'var(--accent-gold, #f59e0b)',
                          color: '#0B1120',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Selecionada</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>Acessar</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Quick Code Section */}
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <QrCode size={15} color="var(--accent-gold, #f59e0b)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Tem o código da congregação?
              </span>
            </div>
            <form onSubmit={handleApplyQuickCode} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Ex: macdp-central, macdp-norte..."
                className="form-input"
                style={{ flex: 1, fontSize: '0.775rem', padding: '0.4rem 0.65rem' }}
              />
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              >
                Entrar
              </button>
            </form>
            {quickCodeError && (
              <p style={{ fontSize: '0.725rem', color: '#EF4444', margin: '0.35rem 0 0 0' }}>
                {quickCodeError}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>O app memorizará sua congregação automaticamente.</span>
          {canClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
