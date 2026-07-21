import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Settings, LifeBuoy } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AuthPage } from './features/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './features/dashboard/Dashboard';
import { Customers } from './features/customers/Customers';
import { Ledger } from './features/ledger/Ledger';
import { Reports } from './features/reports/Reports';
import { Analytics } from './features/analytics/Analytics';
import { ComingSoon } from './pages/ComingSoon';

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
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/ledger" element={<Ledger />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route
                        path="/settings"
                        element={
                          <ComingSoon icon={Settings} title="Settings are on the way" description="Business profile, currency, and notification preferences will live here." />
                        }
                      />
                      <Route
                        path="/support"
                        element={
                          <ComingSoon icon={LifeBuoy} title="Support is on the way" description="Help articles and a way to reach the Hisaab AI team will live here." />
                        }
                      />
                    </Routes>
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
