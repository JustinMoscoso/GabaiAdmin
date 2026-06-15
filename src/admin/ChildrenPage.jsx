import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteChild, listChildren, listParents, saveChild, toLocalDateTime, fromLocalDateTime } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyChild(parentId = "") {
  return {
    id: crypto.randomUUID(),
    parent_id: parentId,
    name: "",
    is_linked: true,
    is_locked: false,
    last_seen_at: "",
    profile_image_url: "",
  };
}

function ChildrenPage() {
  const [rows, setRows] = useState([]);
  const [parents, setParents] = useState([]);
  const [formState, setFormState] = useState(createEmptyChild());
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
        label: parent.name ? `${parent.name} (${parent.email ?? parent.id})` : parent.id,
      })),
    [parents],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const [childrenData, parentsData] = await Promise.all([listChildren(), listParents()]);
        if (!active) return;

        setRows(childrenData);
        setParents(parentsData);
        if (childrenData.length > 0) {
          const first = childrenData[0];
          setSelectedId(first.id);
          setFormState({
            ...createEmptyChild(first.parent_id ?? ""),
            ...first,
            last_seen_at: toLocalDateTime(first.last_seen_at),
          });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load children.");
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
    const [childrenData, parentsData] = await Promise.all([listChildren(), listParents()]);
    setRows(childrenData);
    setParents(parentsData);
    if (childrenData.length > 0) {
      const current = childrenData.find((row) => row.id === selectedId) ?? childrenData[0];
      setSelectedId(current.id);
      setFormState({
        ...createEmptyChild(current.parent_id ?? ""),
        ...current,
        last_seen_at: toLocalDateTime(current.last_seen_at),
      });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyChild(parentOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({
      ...createEmptyChild(row.parent_id ?? ""),
      ...row,
      last_seen_at: toLocalDateTime(row.last_seen_at),
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
      await saveChild({
        ...formState,
        parent_id: formState.parent_id || null,
        is_linked: Boolean(formState.is_linked),
        is_locked: Boolean(formState.is_locked),
        last_seen_at: fromLocalDateTime(formState.last_seen_at),
      });
      notifications.success("Child saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save child.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this child profile?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteChild(selectedId);
      notifications.success("Child deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyChild(parentOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete child.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="Children"
      description="Manage child profiles, parent links, lock state, and last activity."
      resourceLabel="Child admin"
      rows={rows.map((row) => ({
        ...row,
        parent_name: parents.find((parent) => parent.id === row.parent_id)?.name ?? row.parent_id ?? "-",
      }))}
      columns={[
        { key: "name", label: "Name" },
        { key: "parent_name", label: "Parent" },
        { key: "is_linked", label: "Linked", render: (row) => (row.is_linked ? "Yes" : "No") },
        { key: "is_locked", label: "Locked", render: (row) => (row.is_locked ? "Yes" : "No") },
        {
          key: "last_seen_at",
          label: "Last seen",
          render: (row) => (row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : "-"),
        },
      ]}
      fields={[
        { name: "id", label: "Profile ID", type: "text", readOnly: true },
        { name: "parent_id", label: "Parent", type: "select", options: parentOptions },
        { name: "name", label: "Name", type: "text", placeholder: "Child name" },
        { name: "is_linked", label: "Linked", type: "checkbox" },
        { name: "is_locked", label: "Locked", type: "checkbox" },
        { name: "last_seen_at", label: "Last seen", type: "datetime-local" },
        { name: "profile_image_url", label: "Profile image URL", type: "text", placeholder: "https://..." },
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
      note="The parent selector is sourced from public.users where role = 'parent'."
    />
  );
}

export default ChildrenPage;
