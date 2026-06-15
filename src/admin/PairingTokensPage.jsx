import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deletePairingToken, listParents, listPairingTokens, savePairingToken, toLocalDateTime, fromLocalDateTime } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyToken(parentId = "") {
  return {
    id: crypto.randomUUID(),
    parent_id: parentId,
    token: "",
    expires_at: "",
    is_used: false,
  };
}

function PairingTokensPage() {
  const [rows, setRows] = useState([]);
  const [parents, setParents] = useState([]);
  const [formState, setFormState] = useState(createEmptyToken());
  const [selectedId, setSelectedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const notifications = useAppNotifications();

  const parentOptions = useMemo(
    () =>
      parents.map((parent) => ({
        value: parent.id,
        label: parent.name ? parent.name : parent.email ?? parent.id,
      })),
    [parents],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const [tokensData, parentsData] = await Promise.all([listPairingTokens(), listParents()]);
        if (!active) return;

        setRows(tokensData);
        setParents(parentsData);
        if (tokensData.length > 0) {
          const first = tokensData[0];
          setSelectedId(first.id);
          setFormState({
            ...createEmptyToken(first.parent_id ?? ""),
            ...first,
            expires_at: toLocalDateTime(first.expires_at),
          });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load pairing tokens.");
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
    const [tokensData, parentsData] = await Promise.all([listPairingTokens(), listParents()]);
    setRows(tokensData);
    setParents(parentsData);
    if (tokensData.length > 0) {
      const current = tokensData.find((row) => row.id === selectedId) ?? tokensData[0];
      setSelectedId(current.id);
      setFormState({
        ...createEmptyToken(current.parent_id ?? ""),
        ...current,
        expires_at: toLocalDateTime(current.expires_at),
      });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyToken(parentOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({
      ...createEmptyToken(row.parent_id ?? ""),
      ...row,
      expires_at: toLocalDateTime(row.expires_at),
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
      await savePairingToken({
        ...formState,
        parent_id: formState.parent_id || null,
        expires_at: fromLocalDateTime(formState.expires_at),
        is_used: Boolean(formState.is_used),
      });
      notifications.success("Pairing token saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save pairing token.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this pairing token?")) return;

    setSaving(true);
    setError("");
    try {
      await deletePairingToken(selectedId);
      notifications.success("Pairing token deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyToken(parentOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete pairing token.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="Pairing tokens"
      description="Manage token-based pairing records for parent onboarding and device linking."
      resourceLabel="Pairing admin"
      rows={rows.map((row) => ({
        ...row,
        parent_name: parents.find((parent) => parent.id === row.parent_id)?.name ?? row.parent_id ?? "-",
      }))}
      columns={[
        { key: "parent_name", label: "Parent" },
        { key: "token", label: "Token" },
        { key: "expires_at", label: "Expires", render: (row) => (row.expires_at ? new Date(row.expires_at).toLocaleString() : "-") },
        { key: "is_used", label: "Used", render: (row) => (row.is_used ? "Yes" : "No") },
      ]}
      fields={[
        { name: "id", label: "Token ID", type: "text", readOnly: true },
        { name: "parent_id", label: "Parent", type: "select", options: parentOptions },
        { name: "token", label: "Token", type: "text", placeholder: "PAIR-XXXX-XXXX" },
        { name: "expires_at", label: "Expires at", type: "datetime-local" },
        { name: "is_used", label: "Used", type: "checkbox" },
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
      note="These tokens live in public.pairing_tokens and can be used to onboard parents or pair devices."
    />
  );
}

export default PairingTokensPage;
