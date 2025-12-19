import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitFlowProvider } from './context/HabitFlowContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import Login from './components/common/Login';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DailyEntryPage from './pages/DailyEntryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import GlobalSearch from './components/common/GlobalSearch';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import './App.css';
import './utils/chartSetup';

// Lazy Load Pages - REVERTED due to build issues
// const HomePage = lazy(() => import('./pages/HomePage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// const DailyEntryPage = lazy(() => import('./pages/DailyEntryPage'));
// const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
// const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main app content (shown when logged in)
function AppContent() {
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  if (loading) {
    return <LoadingSkeleton message="Loading HabitFlow..." />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <HabitFlowProvider>
              <a href="#main-content" className="skip-to-main">Skip to main content</a>
              <GlobalSearch />
              <Navbar onLogout={logout} user={user} />
              <main className="main-content" id="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/entry" element={<DailyEntryPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <BottomNav />
            </HabitFlowProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <OfflineIndicator />
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
