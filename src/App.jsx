import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./auth/adminAuth";
import LandingPage from "./LandingPage";
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

const routerBasename = window.location.pathname.startsWith("/GabaiAdmin")
  ? "/GabaiAdmin"
  : undefined;

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
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AppNotificationsProvider>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin/login"
            element={
              <AdminAuthProvider>
                <LoginPage />
              </AdminAuthProvider>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <RequireAdmin>
                  <AdminShell />
                </RequireAdmin>
              </AdminAuthProvider>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="home" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="parents" element={<ParentsPage />} />
            <Route path="children" element={<ChildrenPage />} />
            <Route path="pairing-tokens" element={<PairingTokensPage />} />
            <Route path="app-usage" element={<AppUsagePage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="blocked-content" element={<BlockedContentPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/home" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/parents" element={<Navigate to="/admin/parents" replace />} />
          <Route path="/children" element={<Navigate to="/admin/children" replace />} />
          <Route path="/pairing-tokens" element={<Navigate to="/admin/pairing-tokens" replace />} />
          <Route path="/app-usage" element={<Navigate to="/admin/app-usage" replace />} />
          <Route path="/rules" element={<Navigate to="/admin/rules" replace />} />
          <Route path="/blocked-content" element={<Navigate to="/admin/blocked-content" replace />} />
          <Route path="/notifications" element={<Navigate to="/admin/notifications" replace />} />
          <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
        </Routes>
      </BrowserRouter>
    </AppNotificationsProvider>
  );
}

export default App;
