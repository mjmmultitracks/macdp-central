import React from 'react';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Radio,
  Calendar,
  BookOpen,
  Info,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { requestNotificationPermission, checkNotificationSupport } from '../../services/notificationService';

interface AppNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onSelectAction?: (url: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AppNotificationsModal: React.FC<AppNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onSelectAction,
  onNotify,
}) => {
  if (!isOpen) return null;

  const permissionState = checkNotificationSupport();

  const handleRequestPush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onNotify('success', 'Notificações ativadas com sucesso neste aparelho!');
    } else {
      onNotify('info', 'Permissão de notificação não foi concedida ou foi silenciada.');
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'live':
        return <Radio size={18} color="#EF4444" />;
      case 'evento':
        return <Calendar size={18} color="#F59E0B" />;
      case 'pastoral':
        return <BookOpen size={18} color="#3B82F6" />;
      default:
        return <Bell size={18} color="var(--accent-gold)" />;
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
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-page-enter"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Avisos & Notificações
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {notifications.filter((n) => !n.read).length} não lidas
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner de Ativação de Notificações do Navegador / Push */}
        {permissionState.isSupported && permissionState.permission !== 'granted' && (
          <div
            style={{
              margin: '1rem 1.25rem 0 1.25rem',
              padding: '0.85rem 1rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Volume2 size={20} color="var(--accent-gold)" />
              <div>
                <strong style={{ fontSize: '0.825rem', display: 'block', color: 'var(--text-primary)' }}>
                  Receber alertas no celular
                </strong>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Toque para ativar os avisos sonoros de culto
                </span>
              </div>
            </div>

            <button
              onClick={handleRequestPush}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              Ativar
            </button>
          </div>
        )}

        {/* Lista de Notificações */}
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma notificação no momento.</p>
              <span style={{ fontSize: '0.75rem' }}>Você será avisado quando houver novos cultos e eventos.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    background: item.read ? 'var(--bg-tertiary)' : 'rgba(245, 158, 11, 0.08)',
                    border: item.read ? '1px solid var(--border-subtle)' : '1px solid rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '2px' }}>{getNotificationIcon(item.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {item.title}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {item.date}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0', lineHeight: 1.45 }}>
                        {item.message}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {item.actionUrl ? (
                          <button
                            onClick={() => {
                              onMarkAsRead(item.id);
                              if (onSelectAction && item.actionUrl) {
                                onSelectAction(item.actionUrl);
                              }
                              onClose();
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.725rem' }}
                          >
                            Ver detalhes
                          </button>
                        ) : <div />}

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {!item.read && (
                            <button
                              onClick={() => onMarkAsRead(item.id)}
                              title="Marcar como lida"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-gold)',
                                cursor: 'pointer',
                                padding: '0.25rem',
                              }}
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(item.id)}
                            title="Excluir notificação"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              notifications.forEach((n) => onMarkAsRead(n.id));
              onNotify('info', 'Todas as notificações foram marcadas como lidas.');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Marcar todas como lidas
          </button>

          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 1rem' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
