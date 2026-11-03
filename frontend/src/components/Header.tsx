import React from 'react';
import { LogOut } from 'lucide-react';
import type { Profile } from '../types/domain';

interface HeaderProps {
  profile: Profile;
  title: string;
  subtitle: string;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  title,
  subtitle,
  onSignOut,
}) => {
  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gestor',
    operator: 'Operador',
  };

  return (
    <header className="app-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 28px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255, 255, 255, 0.86)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div>
        <h1 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-sub)',
          marginTop: '3px',
          fontWeight: 400,
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '5px 12px 5px 5px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          cursor: 'default',
        }}>
          <div className="avatar avatar-brand">
            {profile.name.charAt(0)}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}>
              {profile.name}
            </div>
            <div style={{
              fontSize: '0.66rem',
              color: 'var(--text-sub)',
              fontWeight: 500,
            }}>
              {roleLabel[profile.role] || profile.role}
            </div>
          </div>
        </div>
        {onSignOut && (
          <button onClick={onSignOut} className="btn-outline" title="Sair da conta" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        )}
      </div>
    </header>
  );
};
