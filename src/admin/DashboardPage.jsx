import { useEffect, useState } from "react";
import { getAdminOverview } from "../lib/adminCrud";

function DashboardPage() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getAdminOverview();
        if (active) {
          setState({ loading: false, data, error: "" });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            data: null,
            error: error instanceof Error ? error.message : "Failed to load dashboard.",
          });
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="container-fluid px-0">
        <div className="card shadow-sm border-0">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="spinner-border text-primary" role="status" aria-hidden="true" />
            <div>
              <h2 className="h5 mb-1">Loading admin data...</h2>
              <p className="text-secondary mb-0">Fetching the latest rows from Supabase.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return <div className="alert alert-danger">{state.error}</div>;
  }

  const { stats = [], parents = [], children = [], notifications = [] } = state.data ?? {};

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2 mb-4">
        <div>
          <div className="text-uppercase text-primary fw-semibold small">Dashboard</div>
          <h2 className="fw-bold mb-1">Admin console</h2>
          <p className="text-secondary mb-0">
            Manage parent profiles, children, rules, blocked content, notifications, and audit logs.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-12 col-sm-6 col-xl-3" key={stat.label}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-secondary small">{stat.label}</div>
                <div className="display-6 fw-bold mb-0">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <h3 className="h5 mb-0">Recent parents</h3>
              <span className="badge text-bg-primary">public.users</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent.id}>
                      <td>{parent.name || "-"}</td>
                      <td>{parent.email || "-"}</td>
                      <td>{parent.is_active ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <h3 className="h5 mb-0">Recent children</h3>
              <span className="badge text-bg-primary">public.children</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Linked</th>
                    <th>Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child) => (
                    <tr key={child.id}>
                      <td>{child.name || "-"}</td>
                      <td>{child.is_linked ? "Yes" : "No"}</td>
                      <td>{child.is_locked ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <h3 className="h5 mb-0">Recent notifications</h3>
          <span className="badge text-bg-primary">public.notifications</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item) => (
                <tr key={item.id}>
                  <td>{item.type || "-"}</td>
                  <td>{item.title || "-"}</td>
                  <td>{item.is_read ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
