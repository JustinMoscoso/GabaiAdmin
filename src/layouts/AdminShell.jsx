import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { signOutAdmin, useAdminAuth } from "../auth/adminAuth";

function AdminShell() {
  const { session } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutAdmin();
    window.location.href = "/login";
  };

  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { to: "/dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard" },
    { to: "/parents", icon: "bi-person-badge-fill", label: "Parents" },
    { to: "/children", icon: "bi-people-fill", label: "Children" },
    { to: "/pairing-tokens", icon: "bi-upc-scan", label: "Pairing Tokens" },
    { to: "/app-usage", icon: "bi-graph-up-arrow", label: "App Usage" },
    { to: "/rules", icon: "bi-sliders", label: "Rules" },
    { to: "/blocked-content", icon: "bi-shield-exclamation", label: "Blocked Content" },
    { to: "/notifications", icon: "bi-bell-fill", label: "Notifications" },
    { to: "/audit", icon: "bi-journal-text", label: "Audit Logs" },
  ];

  return (
    <div className="admin-shell d-flex bg-light min-vh-100">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar d-none d-lg-flex flex-column bg-dark text-white p-3 flex-shrink-0 sticky-top" style={{ width: "280px", height: "100vh" }}>
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <div className="rounded bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
            AG
          </div>
          <span className="fs-5 fw-semibold">AdminGabai</span>
        </div>

        <nav className="nav nav-pills flex-column mb-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link mb-1 ${isActive ? "active text-white" : "text-white-50 link-light"}`}
            >
              <i className={`bi ${item.icon} me-2`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <hr className="text-white-50" />

        <div className="dropdown px-2">
          <div className="d-flex align-items-center text-white text-decoration-none mb-3">
            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
              <i className="bi bi-person-fill" />
            </div>
            <div className="text-truncate" style={{ maxWidth: "180px" }}>
              <div className="small fw-semibold">{session?.email ?? "admin@gabai.app"}</div>
              <div className="small text-white-50">Administrator</div>
            </div>
          </div>
          <button type="button" className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-width-0">
        {/* Mobile Header */}
        <header className="d-lg-none sticky-top bg-white border-bottom shadow-sm p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                AG
              </div>
              <span className="fw-bold">AdminGabai</span>
            </div>
            <button
              className="btn btn-sm btn-outline-dark"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} />
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="mt-3 border-top pt-3">
              <nav className="nav nav-pills flex-column gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : "text-dark"}`}
                  >
                    <i className={`bi ${item.icon} me-2`} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <hr />
              <div className="d-flex align-items-center justify-content-between px-2">
                <span className="small text-muted text-truncate me-2">{session?.email}</span>
                <button className="btn btn-sm btn-link text-danger p-0" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminShell;

