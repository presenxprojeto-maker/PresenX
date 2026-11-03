import {
  Activity,
  Building2,
  Cpu,
  LayoutDashboard,
  Map,
  Tv,
  Users,
  Layers,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'map' | 'people' | 'sectors_areas' | 'hardware' | 'events';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenPublicPanel: () => void;
  orgName: string;
}

const mainNav = [
  { id: 'dashboard' as ActiveTab, label: 'Início', icon: LayoutDashboard },
  { id: 'people' as ActiveTab, label: 'Pessoas', icon: Users },
  { id: 'sectors_areas' as ActiveTab, label: 'Setores e áreas', icon: Layers },
  { id: 'hardware' as ActiveTab, label: 'Pontos de controle', icon: Cpu },
  { id: 'events' as ActiveTab, label: 'Eventos', icon: Activity },
  { id: 'map' as ActiveTab, label: 'Mapa', icon: Map },
];

export function Sidebar({ activeTab, onSelectTab, onOpenPublicPanel, orgName }: SidebarProps) {
  return (
    <aside className="app-sidebar" style={{
      width: '238px',
      height: '100vh',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      inset: '0 auto 0 0',
      zIndex: 40,
    }}>
      <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
          <span className="brand-mark" aria-hidden="true" style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '-0.08em' }}>PX</span>
          PresenX
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: 'var(--text-sub)', fontSize: '0.73rem' }}>
          <Building2 size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orgName}</span>
        </div>
      </div>

      <nav aria-label="Navegação principal" style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        <div style={{ padding: '4px 10px 7px', color: 'var(--text-faint)', fontSize: '0.68rem', fontWeight: 600 }}>NAVEGAÇÃO</div>
        {mainNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 11px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                background: isActive ? 'rgba(255, 255, 255, .16)' : 'transparent',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 450,
                textAlign: 'left',
                width: '100%',
                transition: 'background .18s ease, color .18s ease, transform .18s ease',
              }}
            >
              <Icon size={16} strokeWidth={1.8} color={isActive ? 'var(--brand-light)' : 'currentColor'} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 4px 8px' }} />
        <button onClick={onOpenPublicPanel} className="plain-nav-button"><Tv size={15} />Painel de presença</button>
      </nav>

      <div style={{ padding: '13px 16px', borderTop: '1px solid var(--border)', color: 'var(--amber)', fontSize: '0.72rem' }}>
        Dados de demonstração
      </div>
    </aside>
  );
}
