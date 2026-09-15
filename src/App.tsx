import { useState, useRef, useMemo, useEffect } from 'react';
import { TopHeader } from './components/layout/TopHeader';
import { StatutoryBanner } from './components/layout/StatutoryBanner';
import { SidebarNav, type ActiveTab } from './components/layout/SidebarNav';
import { DashboardView } from './views/DashboardView';
import { City3DView } from './views/City3DView';
import { RegistryView } from './views/RegistryView';
import { CandidateRegistrationView } from './views/CandidateRegistrationView';
import { DiscrepancyStudioView } from './views/DiscrepancyStudioView';
import { VerificationQueueView } from './views/VerificationQueueView';
import { SosContextView } from './views/SosContextView';
import { LoginView } from './views/LoginView';
import { RequestAccessView } from './views/RequestAccessView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { SelectWorkspaceView } from './views/SelectWorkspaceView';
import { cadastreService } from './services/cadastreService';
import type { UserRole, CandidateVsu } from './types/cadastre';
import { generateTowerFloors } from './data/buildingData';
import './styles/designSystem.css';
import './styles/stitchScreens.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export default function App() {
  const viewerRef = useRef<any>(null);

  // Application State
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [currentRole, setCurrentRole] = useState<UserRole>('public_demo');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  const [selectedVsu, setSelectedVsu] = useState<CandidateVsu | null>(null);

  // Active 3D mode hint
  const [city3dMode, setCity3dMode] = useState<'cadastre' | 'audit' | 'sos'>('cadastre');

  // Track newly registered VSU for active highlight in registry
  const [highlightedVsuId, setHighlightedVsuId] = useState<string | null>(null);

  // Stitch auth screen state
  const [userEmail, setUserEmail] = useState<string>('arun.sharma@spatial.gov.in');

  // Badge counts
  const [alertsCount, setAlertsCount] = useState<number>(3);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(1);

  const floors = useMemo(() => generateTowerFloors(), []);

  useEffect(() => {
    cadastreService.setUserRole(currentRole);
  }, [currentRole]);

  useEffect(() => {
    async function loadCounts() {
      const [alerts, tasks] = await Promise.all([
        cadastreService.getDiscrepancyAlerts(),
        cadastreService.getVerificationTasks(),
      ]);
      setAlertsCount(alerts.length);
      setPendingTasksCount(tasks.filter((t) => t.verificationStatus === 'Under Review').length);
    }
    loadCounts();
  }, [activeTab]);

  const handleSelectBuildingFromDash = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setCity3dMode('cadastre');
    setActiveTab('city3d');
    setTimeout(() => {
      if (viewerRef.current?.cesiumElement) {
        viewerRef.current.cesiumElement.resize();
      }
    }, 50);
  };

  const handleNavigateTo3DFromRegistry = (vsu: CandidateVsu) => {
    if (vsu.buildingId) {
      setSelectedBuildingId(vsu.buildingId);
    }
    setSelectedVsu(vsu);
    setCity3dMode('cadastre');
    setActiveTab('city3d');
    setTimeout(() => {
      if (viewerRef.current?.cesiumElement) {
        viewerRef.current.cesiumElement.resize();
      }
    }, 50);
  };

  const handleNavigateToVerify = (vsu: CandidateVsu) => {
    setSelectedVsu(vsu);
    setActiveTab('verification');
  };

  const handleTriggerEscapeFromSos = () => {
    // Navigate to 3D and trigger escape route
    setCity3dMode('sos');
    setActiveTab('city3d');
  };

  // Stitch screen navigation helper
  const handleStitchNavigate = (tab: 'login' | 'request-access' | 'reset-password' | 'workspace' | 'dashboard') => {
    setActiveTab(tab as ActiveTab);
  };

  const handleSelectRoleAndNavigate = (role: UserRole, targetTab: 'dashboard' | 'city3d' | 'registry' | 'verification' | 'discrepancies') => {
    setCurrentRole(role);
    setActiveTab(targetTab);
  };

  const handleLogout = () => {
    setActiveTab('login');
  };

  // Guard role permissions: redirect to dashboard if currentRole does not have permission for activeTab
  useEffect(() => {
    const isStitchAuth = activeTab === 'login' || activeTab === 'request-access' || activeTab === 'reset-password' || activeTab === 'workspace';
    if (!isStitchAuth) {
      if (currentRole === 'public_demo') {
        const allowed = ['dashboard', 'city3d', 'registry', 'sos'];
        if (!allowed.includes(activeTab)) {
          setActiveTab('dashboard');
        }
      } else if (currentRole === 'municipal_officer') {
        const allowed = ['dashboard', 'city3d', 'registry', 'discrepancies', 'verification', 'sos'];
        if (!allowed.includes(activeTab)) {
          setActiveTab('dashboard');
        }
      }
    }
  }, [currentRole, activeTab]);

  // Determine if we're on a Stitch auth screen (hide sidebar/header)
  const isStitchFullScreen = activeTab === 'login' || activeTab === 'request-access' || activeTab === 'reset-password' || activeTab === 'workspace';

  return (
    <div className="app-shell">
      {/* Stitch Full-Screen Auth Views (no header/sidebar) */}
      {isStitchFullScreen ? (
        <main style={{ flex: 1, overflow: 'auto', width: '100%', height: '100vh' }}>
          {activeTab === 'login' && (
            <LoginView
              onNavigate={handleStitchNavigate}
              onLoginSuccess={(email) => setUserEmail(email)}
            />
          )}
          {activeTab === 'request-access' && (
            <RequestAccessView onNavigate={handleStitchNavigate} />
          )}
          {activeTab === 'reset-password' && (
            <ResetPasswordView onNavigate={handleStitchNavigate} />
          )}
          {activeTab === 'workspace' && (
            <SelectWorkspaceView
              currentRole={currentRole}
              onSelectRoleAndNavigate={handleSelectRoleAndNavigate}
              onNavigate={handleStitchNavigate}
              userEmail={userEmail}
              pendingTasksCount={pendingTasksCount}
            />
          )}
        </main>
      ) : (
        <>
          {/* 1. Mandatory Statutory Disclaimer Banner */}
          <StatutoryBanner />

          {/* 2. Top Header with Emblem, Title & Authenticated Role */}
          <TopHeader
            currentRole={currentRole}
            activeAlertsCount={alertsCount}
            onOpenAlerts={() => setActiveTab('discrepancies')}
            userEmail={userEmail}
            onLogout={handleLogout}
          />

          {/* 3. Main Workspace Body */}
          <div className="app-body">
            {/* Left Sidebar Navigation (Only accessible windows displayed) */}
            <SidebarNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeRole={currentRole}
              alertsCount={alertsCount}
              pendingTasksCount={pendingTasksCount}
              userEmail={userEmail}
              onLogout={handleLogout}
            />

            {/* Viewport Content Area */}
            <main className="main-content">
              {/* Dashboard View */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={setActiveTab}
                  onSelectBuilding={handleSelectBuildingFromDash}
                  onSelectVsu={handleNavigateTo3DFromRegistry}
                  currentRole={currentRole}
                  pendingTasksCount={pendingTasksCount}
                />
              )}

              {/* 3D City & Exploded Tower View (Kept persistent in DOM) */}
              <div style={{ width: '100%', height: '100%', display: activeTab === 'city3d' ? 'block' : 'none' }}>
                <City3DView
                  viewerRef={viewerRef}
                  floors={floors}
                  selectedBuildingId={selectedBuildingId}
                  onSelectBuilding={setSelectedBuildingId}
                  selectedVsu={selectedVsu}
                  onSelectVsu={setSelectedVsu}
                  onNavigateToVerify={handleNavigateToVerify}
                  initialMode={city3dMode}
                  currentRole={currentRole}
                />
              </div>

              {/* Vertical Cadastre Registry */}
              {activeTab === 'registry' && (
                <RegistryView
                  onNavigateTo3D={handleNavigateTo3DFromRegistry}
                  onNavigateToVerify={handleNavigateToVerify}
                  currentRole={currentRole}
                  initialSelectedVsuId={highlightedVsuId}
                  onClearInitialSelection={() => setHighlightedVsuId(null)}
                />
              )}

              {/* Candidate VSU Registration Form */}
              {activeTab === 'register' && (
                <CandidateRegistrationView
                  onSuccess={(vsuId) => {
                    setHighlightedVsuId(vsuId);
                    setActiveTab('registry');
                  }}
                  onNavigateToVerify={(vsuId) => {
                    if (vsuId) setHighlightedVsuId(vsuId);
                    setActiveTab('verification');
                  }}
                  onCancel={() => setActiveTab('dashboard')}
                />
              )}

              {/* Satellite & Survey Discrepancy Studio */}
              {activeTab === 'discrepancies' && (
                <DiscrepancyStudioView
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectBuilding={(bId) => {
                    setSelectedBuildingId(bId);
                    setActiveTab('city3d');
                  }}
                  onSelectVsu={handleNavigateTo3DFromRegistry}
                />
              )}

              {/* Surveyor Verification Queue */}
              {activeTab === 'verification' && (
                <VerificationQueueView
                  currentRole={currentRole}
                  onNavigateTo3D={handleNavigateTo3DFromRegistry}
                  initialSelectedVsuId={highlightedVsuId || selectedVsu?.id}
                  initialSelectedIdentifier={selectedVsu?.prototypeVsuIdentifier}
                  onClearInitialSelection={() => {
                    setHighlightedVsuId(null);
                    setSelectedVsu(null);
                  }}
                />
              )}

              {/* SOS Geospatial Context Resolver */}
              {activeTab === 'sos' && (
                <SosContextView onTrigger3DEscapeRoute={handleTriggerEscapeFromSos} />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
