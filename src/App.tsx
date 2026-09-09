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
import { cadastreService } from './services/cadastreService';
import type { UserRole, CandidateVsu } from './types/cadastre';
import { generateTowerFloors } from './data/buildingData';
import './styles/designSystem.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export default function App() {
  const viewerRef = useRef<any>(null);

  // Application State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('public_demo');
  const [selectedVsu, setSelectedVsu] = useState<CandidateVsu | null>(null);

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

  const handleSelectBuildingFromDash = (_buildingId: string) => {
    setActiveTab('city3d');
  };

  const handleNavigateTo3DFromRegistry = (vsu: CandidateVsu) => {
    setSelectedVsu(vsu);
    setActiveTab('city3d');
  };

  const handleNavigateToVerify = (vsu: CandidateVsu) => {
    setSelectedVsu(vsu);
    setActiveTab('verification');
  };

  const handleTriggerEscapeFromSos = () => {
    // Navigate to 3D and trigger escape route
    setActiveTab('city3d');
  };

  return (
    <div className="app-shell">
      {/* 1. Mandatory Statutory Disclaimer Banner */}
      <StatutoryBanner />

      {/* 2. Top Header with Emblem, Title & Role Switcher */}
      <TopHeader
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeAlertsCount={alertsCount}
        onOpenAlerts={() => setActiveTab('discrepancies')}
      />

      {/* 3. Main Workspace Body */}
      <div className="app-body">
        {/* Left Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeRole={currentRole}
          alertsCount={alertsCount}
          pendingTasksCount={pendingTasksCount}
        />

        {/* Viewport Content Area */}
        <main className="main-content">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onSelectBuilding={handleSelectBuildingFromDash}
              onSelectVsu={handleNavigateTo3DFromRegistry}
            />
          )}

          {/* 3D City & Exploded Tower View (Kept persistent in DOM) */}
          <div style={{ width: '100%', height: '100%', display: activeTab === 'city3d' ? 'block' : 'none' }}>
            <City3DView
              viewerRef={viewerRef}
              floors={floors}
              selectedVsu={selectedVsu}
              onSelectVsu={setSelectedVsu}
              onNavigateToVerify={handleNavigateToVerify}
            />
          </div>

          {/* Vertical Cadastre Registry */}
          {activeTab === 'registry' && (
            <RegistryView
              onNavigateTo3D={handleNavigateTo3DFromRegistry}
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {/* Candidate VSU Registration Form */}
          {activeTab === 'register' && (
            <CandidateRegistrationView
              onSuccess={() => setActiveTab('registry')}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {/* Satellite & Survey Discrepancy Studio */}
          {activeTab === 'discrepancies' && <DiscrepancyStudioView />}

          {/* Surveyor Verification Queue */}
          {activeTab === 'verification' && (
            <VerificationQueueView
              currentRole={currentRole}
              onNavigateTo3D={handleNavigateTo3DFromRegistry}
            />
          )}

          {/* SOS Geospatial Context Resolver */}
          {activeTab === 'sos' && (
            <SosContextView onTrigger3DEscapeRoute={handleTriggerEscapeFromSos} />
          )}
        </main>
      </div>
    </div>
  );
}
