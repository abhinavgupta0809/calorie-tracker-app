import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getProfile } from './api/client.js';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LogMeal from './pages/LogMeal.jsx';
import Progress from './pages/Progress.jsx';

function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-100 text-sm text-zinc-500">
      Loading…
    </div>
  );
}

function RequireProfile({ children }) {
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setStatus(p ? 'ok' : 'none');
      })
      .catch(() => setStatus('none'));
  }, []);

  if (status === 'loading') return <Loading />;
  if (!profile) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/dashboard"
        element={
          <RequireProfile>
            <Dashboard />
          </RequireProfile>
        }
      />
      <Route
        path="/log-meal"
        element={
          <RequireProfile>
            <LogMeal />
          </RequireProfile>
        }
      />
      <Route
        path="/progress"
        element={
          <RequireProfile>
            <Progress />
          </RequireProfile>
        }
      />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getProfile()
      .then((p) => setStatus(p ? 'dash' : 'onboard'))
      .catch(() => setStatus('onboard'));
  }, []);

  if (status === 'loading') return <Loading />;
  if (status === 'dash') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/onboarding" replace />;
}
