import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./auth/adminAuth";
import LoginPage from "./admin/LoginPage";
import DashboardPage from "./admin/DashboardPage";
import ParentsPage from "./admin/ParentsPage";
import ChildrenPage from "./admin/ChildrenPage";
import PairingTokensPage from "./admin/PairingTokensPage";
import AppUsagePage from "./admin/AppUsagePage";
import RulesPage from "./admin/RulesPage";
import BlockedContentPage from "./admin/BlockedContentPage";
import NotificationsPage from "./admin/NotificationsPage";
import AuditPage from "./admin/AuditPage";
import AdminShell from "./layouts/AdminShell";
import { AppNotificationsProvider } from "./components/AppNotifications";

function RequireAdmin({ children }) {
  const { session, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-backdrop" />
        <div className="auth-card">
          <div className="auth-copy">
            <p className="eyebrow">Admin access</p>
            <h1>Checking session</h1>
            <p>Verifying your Supabase login and admin role.</p>
          </div>
          <div className="auth-form">
            <p className="muted-copy">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (session?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AppNotificationsProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAdmin>
                  <AdminShell />
                </RequireAdmin>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/children" element={<ChildrenPage />} />
              <Route path="/pairing-tokens" element={<PairingTokensPage />} />
              <Route path="/app-usage" element={<AppUsagePage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/blocked-content" element={<BlockedContentPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/audit" element={<AuditPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AppNotificationsProvider>
  );
}

export default App;
