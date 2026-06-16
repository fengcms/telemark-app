import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CustomersPage } from '@/pages/CustomersPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SummaryPage } from '@/pages/SummaryPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AppShell>
                <CustomersPage />
              </AppShell>
            }
            path="/"
          />
          <Route
            element={
              <AppShell>
                <SummaryPage />
              </AppShell>
            }
            path="/summary"
          />
          <Route
            element={
              <AppShell>
                <HistoryPage />
              </AppShell>
            }
            path="/history"
          />
          <Route
            element={
              <AppShell>
                <ProfilePage />
              </AppShell>
            }
            path="/profile"
          />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
