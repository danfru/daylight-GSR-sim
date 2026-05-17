import { useState } from 'react';
import { useGSR } from './store/useGSR.js';
import SplashScreen from './components/SplashScreen.jsx';
import impactLogo from './assets/impact-logo-2d.png';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectIntake from './pages/ProjectIntake.jsx';
import BMPSelector from './pages/BMPSelector.jsx';
import SiteWiseCalculator from './pages/SiteWiseCalculator.jsx';
import ClimateScreener from './pages/ClimateScreener.jsx';
import RAWPBuilder from './pages/RAWPBuilder.jsx';
import FERTracker from './pages/FERTracker.jsx';
import ReferenceLibrary from './pages/ReferenceLibrary.jsx';

const MODULE_MAP = {
  dashboard: Dashboard,
  intake:    ProjectIntake,
  bmps:      BMPSelector,
  sitewise:  SiteWiseCalculator,
  climate:   ClimateScreener,
  rawp:      RAWPBuilder,
  fer:       FERTracker,
  library:   ReferenceLibrary,
};

export default function App() {
  const activeModule = useGSR((s) => s.activeModule);
  const ActivePage = MODULE_MAP[activeModule] || Dashboard;

  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('gsr-onboarded') === '1'
  );

  function handleEnter() {
    sessionStorage.setItem('gsr-onboarded', '1');
    setSplashDone(true);
  }

  if (!splashDone) {
    return <SplashScreen onEnter={handleEnter} />;
  }

  return (
    <div className="app-root">
      <Header />
      <Sidebar />
      <main className="app-main">
        <div className="page-fade" key={activeModule}>
          <ActivePage />
        </div>
      </main>

      <footer className="app-footer">

        {/* Left — Impact Environmental */}
        <div className="app-footer-brand">
          <img
            src={impactLogo}
            alt="Impact Environmental"
            className="app-footer-powered-logo"
            style={{ height: 28 }}
          />
          <div className="app-footer-text-stack">
            <span className="app-footer-name">Impact Environmental</span>
            <span className="app-footer-tagline">Welcome to solid ground.</span>
          </div>
        </div>

        <div className="app-footer-divider" />

        {/* Center — Tool info */}
        <div className="app-footer-powered">
          <div className="app-footer-powered-text">
            <span className="app-footer-powered-label">Tool</span>
            <span className="app-footer-powered-name">GSR Compliance Simulator</span>
            <span className="app-footer-powered-sub">DER-31 (2025) · 6 NYCRR Part 375 · BCP Application Rev. Oct 2025</span>
          </div>
        </div>

        <div className="app-footer-divider" />

        {/* Right — Status */}
        <div className="app-footer-right">
          <span className="app-footer-status">
            <span className="app-footer-status-dot" />
            System Online
          </span>
          <span className="app-footer-version">v1.0 · 2026</span>
        </div>

      </footer>
    </div>
  );
}
