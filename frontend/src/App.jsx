import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import WelcomeLandingPage from './pages/WelcomeLandingPage';
import CitizenPortal from './pages/CitizenPortal';
import UsersAdminPage from './pages/UsersAdminPage';
import Dashboard from './pages/Dashboard';
import GISNetworkMapPage from './pages/GISNetworkMapPage';
import HydraulicSimulationPage from './pages/HydraulicSimulationPage';
import WhatIfAnalysisPage from './pages/WhatIfAnalysisPage';
import LeakLocalizationPage from './pages/LeakLocalizationPage';
import FailureRiskPage from './pages/FailureRiskPage';
import DemandForecastingPage from './pages/DemandForecastingPage';
import MaintenancePage from './pages/MaintenancePage';
import ComplaintsPage from './pages/ComplaintsPage';

function MainApp() {
  const { user, role, isAuthenticated } = useAuth();
  
  // Set default tab based on initial role
  const [activeTab, setActiveTab] = useState('dashboard');

  // Enforce role-specific default tab and boundary protection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (role === 'CITIZEN') {
      const citizenAllowed = ['citizen-portal', 'gis-map', 'complaints'];
      if (!citizenAllowed.includes(activeTab)) {
        setActiveTab('citizen-portal');
      }
    } else if (role === 'FIELD_ENGINEER') {
      const engineerAllowed = ['dashboard', 'gis-map', 'failure-risk', 'maintenance', 'complaints'];
      if (!engineerAllowed.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (role === 'MUNICIPALITY_OFFICER') {
      const officerAllowed = [
        'dashboard', 'gis-map', 'simulation', 'what-if', 
        'leak-localization', 'failure-risk', 'demand-forecast', 'maintenance', 
        'complaints'
      ];
      if (!officerAllowed.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (role === 'ADMIN') {
      const adminAllowed = [
        'dashboard', 'gis-map', 'simulation', 'what-if', 
        'leak-localization', 'failure-risk', 'demand-forecast', 
        'maintenance', 'complaints', 'users-admin'
      ];
      if (!adminAllowed.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [role, isAuthenticated]);

  // If user is not authenticated, ALWAYS render the Welcome Landing Page first
  if (!isAuthenticated || !user) {
    return <WelcomeLandingPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      // Citizen Exclusive View
      case 'citizen-portal':
        return <CitizenPortal onNavigate={setActiveTab} />;

      // Core Dashboards & GIS
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'gis-map':
        return <GISNetworkMapPage />;
      
      // Engineering & Hydraulic Simulation
      case 'simulation':
        return <HydraulicSimulationPage />;
      case 'what-if':
        return <WhatIfAnalysisPage />;
      case 'leak-localization':
        return <LeakLocalizationPage />;
      
      // Machine Learning
      case 'failure-risk':
        return <FailureRiskPage />;
      case 'demand-forecast':
        return <DemandForecastingPage />;
      
      // Operations & Maintenance
      case 'maintenance':
        return <MaintenancePage />;
      case 'complaints':
        return <ComplaintsPage />;

      // Admin Only
      case 'users-admin':
        return <UsersAdminPage />;
      
      default:
        return role === 'CITIZEN' 
          ? <CitizenPortal onNavigate={setActiveTab} />
          : <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="app-main flex-1 overflow-y-auto bg-slate-50">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
