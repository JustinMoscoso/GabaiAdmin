import { useState } from "react";
import { Navigate } from "react-router-dom";
import { signInAdmin, useAdminAuth } from "../auth/adminAuth";

function LoginPage() {
  const { session, loading } = useAdminAuth();
  const [email, setEmail] = useState("admin@gabai.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email.trim(), password);
      window.location.href = "/dashboard";
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card shadow-lg border-0 w-100 auth-card">
        <div className="row g-0">
          <div className="col-lg-6 text-bg-primary p-4 p-lg-5 d-flex flex-column justify-content-center">
            <p className="text-uppercase small fw-semibold opacity-75 mb-2">Admin access</p>
            <h1 className="display-5 fw-bold mb-3">Parent Control Admin</h1>
            <p className="lead mb-0">
              Sign in to manage children, screen limits, blocked apps, and the audit trail.
              This uses your Supabase auth account and checks the admin role in <code>public.users</code>.
            </p>
          </div>

          <div className="col-lg-6 p-4 p-lg-5 bg-white">
            <form className="d-grid gap-3" onSubmit={handleLogin}>
              <div>
                <label className="form-label">Email address</label>
                <input
                  className="form-control form-control-lg"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@gabai.app"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  className="form-control form-control-lg"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin123!"
                />
              </div>

              {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? "Signing in..." : "Enter dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
