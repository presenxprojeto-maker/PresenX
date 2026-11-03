import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MapView } from './components/MapView';
import { PeopleView } from './components/PeopleView';
import { SectorsAreasView } from './components/SectorsAreasView';
import { ControlPointsDevicesView } from './components/ControlPointsDevicesView';
import { EventsView } from './components/EventsView';
import { SimulationModal } from './components/SimulationModal';
import { PublicPanelModal } from './components/PublicPanelModal';
import { dataService } from './services/dataService';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { LoginView } from './components/LoginView';
import { SplashScreen } from './components/SplashScreen';
import type { Profile, UserRole } from './types/domain';

type AccessState = 'checking' | 'demo' | 'signed_out' | 'loading_profile' | 'signed_in' | 'profile_missing' | 'profile_error' | 'data_error';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPublicPanelOpen, setIsPublicPanelOpen] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [accessState, setAccessState] = useState<AccessState>(isSupabaseConfigured ? 'checking' : 'demo');
  const [introFinished, setIntroFinished] = useState(false);
  const [authenticatedProfile, setAuthenticatedProfile] = useState<Profile | null>(null);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    const introTimer = window.setTimeout(() => setIntroFinished(true), 1900);
    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isActive = true;
    let eventsChannel: ReturnType<typeof supabase.channel> | null = null;

    const loadProfile = async (userId: string) => {
      if (isActive) setAccessState('loading_profile');
      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id, organization_id, name, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!isActive) return;
      if (profileError) {
        setAccessState('profile_error');
        return;
      }
      if (!profileRow) {
        setAccessState('profile_missing');
        return;
      }

      const profile = profileRow as Profile;
      setAuthenticatedProfile({ ...profile, role: profile.role as UserRole });
      const { data: organizationRow, error: organizationError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .maybeSingle();
      if (!isActive) return;
      if (organizationError || !organizationRow) {
        setAccessState('profile_error');
        return;
      }
      try {
        await dataService.connectOrganization(profile.organization_id, organizationRow.name);
      } catch {
        if (isActive) setAccessState('data_error');
        return;
      }
      if (!isActive) return;
      if (eventsChannel) await supabase.removeChannel(eventsChannel);
      eventsChannel = supabase.channel(`presenx-events-${profile.organization_id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `organization_id=eq.${profile.organization_id}`,
        }, () => {
          void dataService.refreshEvents().then(() => {
            if (isActive) setUpdateKey(key => key + 1);
          });
        })
        .subscribe();
      setOrganizationName(organizationRow.name);
      setAccessState('signed_in');
    };

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isActive) return;
      if (error) {
        setAccessState('profile_error');
        return;
      }
      if (data.session?.user) await loadProfile(data.session.user.id);
      else setAccessState('signed_out');
    };

    void initialize();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        if (eventsChannel) {
          void supabase.removeChannel(eventsChannel);
          eventsChannel = null;
        }
        dataService.disconnectOrganization();
        setAuthenticatedProfile(null);
        setOrganizationName('');
        setAccessState('signed_out');
        return;
      }
      window.setTimeout(() => void loadProfile(session.user.id), 0);
    });

    return () => {
      isActive = false;
      if (eventsChannel) void supabase.removeChannel(eventsChannel);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const forceRefresh = () => setUpdateKey(k => k + 1);

  const org = dataService.getOrganization();
  const demoProfile = dataService.getProfile();
  const profile = authenticatedProfile || demoProfile;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isAccessReady = accessState !== 'checking' && accessState !== 'loading_profile';

  if (!introFinished || !isAccessReady) {
    return <SplashScreen isReady={isAccessReady} />;
  }

  if (accessState === 'signed_out') {
    return <LoginView onSignedIn={() => setAccessState('loading_profile')} />;
  }

  if (accessState === 'profile_missing' || accessState === 'profile_error' || accessState === 'data_error') {
    const message = accessState === 'profile_missing'
      ? 'Sua conta autenticou, mas não tem um perfil administrativo vinculado a uma organização. Peça ao responsável pelo Supabase para configurar seu perfil.'
      : accessState === 'data_error'
        ? 'O login funcionou, mas não foi possível carregar pessoas, setores, áreas e permissões no banco. Confira o schema e as políticas de acesso do Supabase.'
        : 'Não foi possível carregar seu perfil. Confira a conexão e as políticas de acesso do Supabase.';
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'var(--bg-main)' }}>
        <section className="panel" style={{ maxWidth: '480px', padding: '28px' }}>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Acesso administrativo indisponível</h1>
          <p role="alert" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{message}</p>
          <button onClick={() => void handleSignOut()} className="btn-outline">Sair</button>
        </section>
      </main>
    );
  }

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Resumo de hoje',
          subtitle: 'Pessoas e registros do ambiente',
        };
      case 'map':
        return {
          title: 'Mapa',
          subtitle: 'Áreas e pontos de controle',
        };
      case 'people':
        return {
          title: 'Pessoas',
          subtitle: 'Pessoas cadastradas e seus acessos',
        };
      case 'sectors_areas':
        return {
          title: 'Setores e áreas',
          subtitle: 'Equipes de trabalho e espaços da organização',
        };
      case 'hardware':
        return {
          title: 'Pontos de controle',
          subtitle: 'Locais de leitura e leitores vinculados',
        };
      case 'events':
        return {
          title: 'Eventos',
          subtitle: 'Registros de entrada, saída e acesso negado',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Fixa */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPublicPanel={() => setIsPublicPanelOpen(true)}
        orgName={accessState === 'signed_in' ? organizationName : org.name}
      />

      {/* Conteúdo Principal */}
      <div style={{ marginLeft: '238px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          profile={profile}
          title={title}
          subtitle={subtitle}
          onSignOut={accessState === 'signed_in' ? () => void handleSignOut() : undefined}
        />

        <main className="app-content" style={{ padding: '24px', flex: 1 }}>
          <div key={updateKey}>
            {activeTab === 'dashboard' && (
              <DashboardView
                onGoToEvents={() => setActiveTab('events')}
                onGoToPeople={() => setActiveTab('people')}
                onOpenPublicPanel={() => setIsPublicPanelOpen(true)}
              />
            )}

            {activeTab === 'map' && (
              <MapView onOpenSimulator={() => setIsSimulatorOpen(true)} />
            )}

            {activeTab === 'people' && (
              <PeopleView onRefresh={forceRefresh} />
            )}

            {activeTab === 'sectors_areas' && (
              <SectorsAreasView onRefresh={forceRefresh} />
            )}

            {activeTab === 'hardware' && (
              <ControlPointsDevicesView onRefresh={forceRefresh} />
            )}

            {activeTab === 'events' && (
              <EventsView />
            )}
          </div>
        </main>
      </div>

      {/* Modais Globais */}
      <SimulationModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventProcessed={forceRefresh}
      />

      <PublicPanelModal
        isOpen={isPublicPanelOpen}
        onClose={() => setIsPublicPanelOpen(false)}
        organizationName={accessState === 'signed_in' ? organizationName : org.name}
      />
    </div>
  );
}

export default App;
