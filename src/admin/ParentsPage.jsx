import { useEffect, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteParent, inviteParent, listParents, saveParent } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyParent() {
  return {
    id: crypto.randomUUID(),
    role: "parent",
    name: "",
    email: "",
    gender: "",
    is_active: true,
    profile_image_url: "",
  };
}

function createEmptyInvite() {
  return { name: "", email: "", gender: "" };
}

function ParentsPage() {
  const [rows, setRows] = useState([]);
  const [formState, setFormState] = useState(createEmptyParent);
  const [inviteState, setInviteState] = useState(createEmptyInvite);
  const [selectedId, setSelectedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const notifications = useAppNotifications();

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listParents();
        if (!active) return;

        setRows(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setFormState({
            ...createEmptyParent(),
            ...data[0],
          });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load parents.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const reload = async () => {
    const data = await listParents();
    setRows(data);
    if (data.length > 0) {
      const current = data.find((row) => row.id === selectedId) ?? data[0];
      setSelectedId(current.id);
      setFormState({
        ...createEmptyParent(),
        ...current,
        role: "parent",
      });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyParent());
    setError("");
    setIsFormOpen(true);
  };

  const handleInviteChange = (name, value) => {
    setInviteState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleInviteParent = async (event) => {
    event.preventDefault();
    setInviting(true);
    setError("");
    setInviteMessage("");

    try {
      const result = await inviteParent(inviteState);
      const message = result?.message ?? "Invite sent.";
      setInviteMessage(message);
      notifications.success(message);
      setInviteState(createEmptyInvite());
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send parent invite.";
      setError(message);
      notifications.error(message);
    } finally {
      setInviting(false);
    }
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({
      ...createEmptyParent(),
      ...row,
      role: "parent",
    });
    setError("");
    setIsFormOpen(true);
  };

  const handleChangeField = (name, value) => {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await saveParent({
        ...formState,
        is_active: Boolean(formState.is_active),
      });
      notifications.success("Parent saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save parent.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this parent profile?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteParent(selectedId);
      notifications.success("Parent deleted successfully.");
      handleNew();
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete parent.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div>
              <div className="text-uppercase text-primary fw-semibold small">Invite parent</div>
              <h3 className="h5 mb-0">Send a login link</h3>
            </div>
          </div>

          <form className="row g-3" onSubmit={handleInviteParent}>
            <div className="col-12 col-md-4">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                type="text"
                value={inviteState.name}
                onChange={(event) => handleInviteChange("name", event.target.value)}
                placeholder="Parent name"
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={inviteState.email}
                onChange={(event) => handleInviteChange("email", event.target.value)}
                placeholder="parent@example.com"
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Gender</label>
              <input
                className="form-control"
                type="text"
                value={inviteState.gender}
                onChange={(event) => handleInviteChange("gender", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={inviting}>
                {inviting ? "Sending..." : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {inviteMessage ? <div className="alert alert-success">{inviteMessage}</div> : null}

      <CrudResourcePage
        title="Parents"
        description="Manage parent profile rows in public.users. Use the invite form above to create the auth user and profile together."
        resourceLabel="Parent admin"
        rows={rows}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "gender", label: "Gender", render: (row) => row.gender || "-" },
          { key: "is_active", label: "Active", render: (row) => (row.is_active ? "Yes" : "No") },
          {
            key: "created_at",
            label: "Created",
            render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : "-"),
          },
        ]}
        fields={[
          { name: "id", label: "Profile ID", type: "text", readOnly: true },
          { name: "name", label: "Name", type: "text", placeholder: "Parent name" },
          { name: "email", label: "Email", type: "email", placeholder: "parent@example.com" },
          { name: "gender", label: "Gender", type: "text", placeholder: "Optional" },
          { name: "profile_image_url", label: "Profile image URL", type: "text", placeholder: "https://..." },
          { name: "is_active", label: "Active", type: "checkbox" },
        ]}
        formState={formState}
        loading={loading}
        saving={saving}
        error={error}
        selectedId={selectedId}
        isFormOpen={isFormOpen}
        onSelectRow={handleSelectRow}
        onChangeField={handleChangeField}
        onSubmit={handleSubmit}
        onDeleteSelected={handleDeleteSelected}
        onNew={handleNew}
        onCloseForm={() => setIsFormOpen(false)}
        note="If you need to create parents from the admin, use the invite form so the auth user and profile row stay in sync."
      />
    </>
  );
}

export default ParentsPage;
