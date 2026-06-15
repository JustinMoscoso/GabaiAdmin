import { useEffect, useState } from "react";
import { listAuditLogs } from "../lib/adminCrud";

function AuditPage() {
  const [state, setState] = useState({
    loading: true,
    rows: [],
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const rows = await listAuditLogs();
        if (active) {
          setState({ loading: false, rows, error: "" });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            rows: [],
            error: error instanceof Error ? error.message : "Failed to load audit logs.",
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
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="spinner-border text-primary" role="status" aria-hidden="true" />
          <div>
            <h2 className="h5 mb-1">Loading audit trail...</h2>
            <p className="text-secondary mb-0">Fetching the latest audit rows from Supabase.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return <div className="alert alert-danger">{state.error}</div>;
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex align-items-center justify-content-between">
        <div>
          <div className="text-uppercase text-primary fw-semibold small">Audit logs</div>
          <h2 className="h5 mb-0">Activity history</h2>
        </div>
        <span className="badge text-bg-primary">read only</span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Action</th>
              <th>Table</th>
              <th>Record</th>
              <th>Actor</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.action}</td>
                <td>{row.table}</td>
                <td>{row.recordId}</td>
                <td>{row.actor}</td>
                <td>{row.when ? new Date(row.when).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditPage;
