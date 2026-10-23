import React, { useState } from 'react';
import { Shirt3DViewer } from './Shirt3DViewer';
import { Modal } from './Modal';
import { Shirt, CheckCircle2, Sparkles, X, Plus, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface Shirt3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  category?: string;
  isKids?: boolean;
  shirtPrice?: number;
  availableSizes?: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  isShirtIncluded: boolean;
  onToggleIncludeShirt: (included: boolean) => void;
  frontImageUrl?: string;
  backImageUrl?: string;
  shirtColor?: string;
}

export const Shirt3DModal: React.FC<Shirt3DModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  category = 'Conferência',
  isKids = false,
  shirtPrice = 50,
  availableSizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'Infantil 8', 'Infantil 12'],
  selectedSize,
  onSelectSize,
  isShirtIncluded,
  onToggleIncludeShirt,
  frontImageUrl,
  backImageUrl,
  shirtColor = '#361c0e',
}) => {
  const [localSize, setLocalSize] = useState(selectedSize || 'M');

  const handleConfirmAdd = () => {
    onSelectSize(localSize);
    onToggleIncludeShirt(true);
    onClose();
  };

  const handleRemove = () => {
    onToggleIncludeShirt(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Camisa Oficial em 3D" maxWidth="640px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Descritivo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shirt size={20} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {eventTitle.includes('KIDS') ? 'Camiseta Caçadores KIDS 2026' : 'Camisa Oficial Caçadores DOROT 2026'}
              </h4>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Explore todos os ângulos da peça com rotação livre 360° em tempo real.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.95rem',
              fontWeight: 900,
            }}
          >
            {formatCurrency(shirtPrice)}
          </div>
        </div>

        {/* 3D Interactive Canvas */}
        <Shirt3DViewer
          eventTitle={eventTitle}
          category={category}
          isKids={isKids}
          frontImageUrl={frontImageUrl}
          backImageUrl={backImageUrl}
          baseColor={shirtColor}
        />

        {/* Ficha Técnica Rápida */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Info size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Especificações da Peça:</strong> Malha 100% Algodão Premium Penteado 30.1 • Costura reforçada com pesponto ombro a ombro • Estampa em Silk Screen HD de alta durabilidade com pigmentos dourados.
          </div>
        </div>

        {/* Seleção de Tamanho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Escolha seu tamanho:
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
              Selecionado: {localSize}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setLocalSize(sz)}
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  border: localSize === sz ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                  background: localSize === sz ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                  color: localSize === sz ? '#0f172a' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                  transform: localSize === sz ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Ações do Rodapé */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          {isShirtIncluded ? (
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-secondary"
              style={{
                color: 'var(--status-danger)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                padding: '0.65rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              Remover Camisa
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem' }}
            >
              Agora Não
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmAdd}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.6rem',
              fontWeight: 900,
              fontSize: '0.92rem',
              gap: '0.55rem',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>
              {isShirtIncluded
                ? `Confirmar Tamanho (${localSize})`
                : `Garantir Minha Camisa (+ ${formatCurrency(shirtPrice)})`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
