import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Metrics from './pages/Metrics';
import MetricGroups from './pages/MetricGroups';
import Evaluations from './pages/Evaluations';
import Projects from './pages/Projects';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="metric-groups" element={<MetricGroups />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="projects" element={<Projects />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
