import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardShell } from './layouts/DashboardShell';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { PracticePage } from './pages/PracticePage';
import { ProfilePage } from './pages/ProfilePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResultsPage } from './pages/ResultsPage';
import { ShipGatePage } from './pages/ShipGatePage';
import { TestChecklistPage } from './pages/TestChecklistPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/app" element={<DashboardShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/results" element={<DashboardShell />}>
        <Route index element={<ResultsPage />} />
      </Route>

      <Route path="/prp/07-test" element={<DashboardShell />}>
        <Route index element={<TestChecklistPage />} />
      </Route>

      <Route path="/prp/08-ship" element={<DashboardShell />}>
        <Route index element={<ShipGatePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
