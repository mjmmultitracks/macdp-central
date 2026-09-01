import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Heart,
  Church,
  Calendar,
  Video,
  Users,
  Compass,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isSolid?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  onOpenAdmin,
  isDarkMode,
  onToggleTheme,
  isSolid = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Início', icon: Church },
    { id: 'sobre', label: 'Sobre Nós', icon: Users },
    { id: 'ministerios', label: 'Ministérios', icon: Sparkles },
    { id: 'celulas', label: 'Células', icon: Compass },
    { id: 'mensagens', label: 'Mensagens', icon: Video },
    { id: 'eventos', label: 'Eventos & Cultos', icon: Calendar },
    { id: 'dizimos', label: 'Dízimos & Ofertas', icon: Heart },
    { id: 'oracao', label: 'Oração & Contato', icon: Heart },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        transition: 'all 0.3s ease',
        background: isScrolled || isSolid
          ? 'var(--bg-glass)'
          : 'linear-gradient(to bottom, rgba(11, 17, 32, 0.85) 0%, transparent 100%)',
        backdropFilter: isScrolled || isSolid ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isScrolled || isSolid ? 'blur(16px)' : 'none',
        borderBottom: isScrolled || isSolid ? '1px solid var(--border-subtle)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo Oficial MACDP"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '9px',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold-light)',
                lineHeight: 1.1,
                marginBottom: '0.18rem',
              }}
            >
              Ministério Apostólico
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: isScrolled || isSolid ? 'var(--text-primary)' : '#ffffff',
              }}
            >
              Caçadores da Presença
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  background: isActive ? 'var(--accent-gold-soft)' : 'transparent',
                  color: isActive
                    ? 'var(--accent-gold)'
                    : isScrolled || isSolid
                    ? 'var(--text-secondary)'
                    : '#e2e8f0',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions (Theme toggle + Admin Entry) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            style={{
              background: isScrolled || isSolid ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid var(--border-subtle)',
              color: isScrolled || isSolid ? 'var(--text-primary)' : '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Admin / ERP Button */}
          <button
            onClick={onOpenAdmin}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
              color: '#F8FAFC',
              border: '1px solid var(--accent-gold-light)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              gap: '0.45rem',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <ShieldCheck size={16} color="var(--accent-gold-light)" />
            <span>Painel ERP</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: isScrolled || isSolid ? 'var(--text-primary)' : '#ffffff',
              padding: '0.5rem',
              cursor: 'pointer',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 850,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--accent-gold-soft)' : 'var(--bg-tertiary)',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="btn btn-primary"
              style={{ width: '100%', gap: '0.5rem' }}
            >
              <ShieldCheck size={18} />
              <span>Acessar Painel Administrativo / ERP</span>
            </button>
          </div>
        </div>
      )}

      {/* Media query styling for responsive nav */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 959px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
