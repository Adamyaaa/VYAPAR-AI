import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FileText, BarChart3, Settings, LifeBuoy } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './features/dashboard/Dashboard';
import { Customers } from './features/customers/Customers';
import { Ledger } from './pages/Ledger';
import { ComingSoon } from './pages/ComingSoon';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route
              path="/reports"
              element={
                <ComingSoon icon={FileText} title="Reports are on the way" description="Month-end summaries and GST-ready reports will live here." />
              }
            />
            <Route
              path="/analytics"
              element={
                <ComingSoon icon={BarChart3} title="Analytics are on the way" description="Deeper customer and cash-flow analytics will live here." />
              }
            />
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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
