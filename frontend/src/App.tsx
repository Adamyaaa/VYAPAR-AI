import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AuthPage } from './features/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';

// Route-level code splitting: each page (several of which pull in Recharts
// and/or Framer Motion) ships as its own chunk, loaded on navigation instead
// of all up front.
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Customers = lazy(() => import('./features/customers/Customers').then((m) => ({ default: m.Customers })));
const Ledger = lazy(() => import('./features/ledger/Ledger').then((m) => ({ default: m.Ledger })));
const Reports = lazy(() => import('./features/reports/Reports').then((m) => ({ default: m.Reports })));
const Analytics = lazy(() => import('./features/analytics/Analytics').then((m) => ({ default: m.Analytics })));
const Settings = lazy(() => import('./features/settings/Settings').then((m) => ({ default: m.Settings })));
const Support = lazy(() => import('./features/support/Support').then((m) => ({ default: m.Support })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-border border-t-indigo" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage mode="signin" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/ledger" element={<Ledger />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/support" element={<Support />} />
                      </Routes>
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
