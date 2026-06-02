import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { TrustBar } from './components/ui.jsx';

import Overview from './pages/Overview.jsx';
import Departments from './pages/Departments.jsx';
import Districts from './pages/Districts.jsx';
import Welfare from './pages/Welfare.jsx';
import RTS from './pages/RTS.jsx';
import MahaDBT from './pages/MahaDBT.jsx';
import Revenue from './pages/Revenue.jsx';
import Disaster from './pages/Disaster.jsx';
import LawOrder from './pages/LawOrder.jsx';
import Infrastructure from './pages/Infrastructure.jsx';
import Cyber from './pages/Cyber.jsx';
import Audit from './pages/Audit.jsx';
import Collector from './pages/Collector.jsx';
import Secretary from './pages/Secretary.jsx';
import CMO from './pages/CMO.jsx';
import CMBrief from './pages/CMBrief.jsx';
import CMPriority from './pages/CMPriority.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/welfare" element={<Welfare />} />
        <Route path="/rts" element={<RTS />} />
        <Route path="/mahadbt" element={<MahaDBT />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/disaster" element={<Disaster />} />
        <Route path="/law-order" element={<LawOrder />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/cyber" element={<Cyber />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/collector" element={<Collector />} />
        <Route path="/secretary" element={<Secretary />} />
        <Route path="/cmo" element={<CMO />} />
        <Route path="/cm-brief" element={<CMBrief />} />
        <Route path="/cm-priority" element={<CMPriority />} />
      </Routes>
      <div className="mt-6"><TrustBar /></div>
      <footer className="mt-4 pb-2 text-center text-[11px] text-slate-400">
        CM Governance Intelligence War Room · PoC · Figures are <b>indicative</b> — grounded in public data with modelled estimates; not official government data.
      </footer>
    </Layout>
  );
}
