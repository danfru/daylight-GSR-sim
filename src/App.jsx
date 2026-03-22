import { useGSR } from './store/useGSR.js';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ProjectIntake from './pages/ProjectIntake.jsx';
import BMPSelector from './pages/BMPSelector.jsx';
import FootprintCalculator from './pages/FootprintCalculator.jsx';
import ClimateScreener from './pages/ClimateScreener.jsx';
import RAWPBuilder from './pages/RAWPBuilder.jsx';
import FERTracker from './pages/FERTracker.jsx';
import ReferenceLibrary from './pages/ReferenceLibrary.jsx';

const MODULE_MAP = {
  intake:    ProjectIntake,
  bmps:      BMPSelector,
  footprint: FootprintCalculator,
  climate:   ClimateScreener,
  rawp:      RAWPBuilder,
  fer:       FERTracker,
  library:   ReferenceLibrary,
};

export default function App() {
  const activeModule = useGSR((s) => s.activeModule);
  const ActivePage = MODULE_MAP[activeModule] || ProjectIntake;

  return (
    <div style={{ background: 'var(--midnight)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <Header />
      <Sidebar />
      <main style={{
        marginLeft: 220,
        marginTop: 56,
        padding: '28px 32px',
        minHeight: 'calc(100vh - 56px)',
      }}>
        <ActivePage />
      </main>
    </div>
  );
}
