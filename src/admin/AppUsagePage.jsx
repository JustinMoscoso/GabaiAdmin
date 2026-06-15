import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteAppUsage, listAppUsage, listChildren, saveAppUsage } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyUsage(childId = "") {
  return {
    id: crypto.randomUUID(),
    child_id: childId,
    usage_date: "",
    package_name: "",
    app_name: "",
    usage_seconds: 0,
  };
}

function AppUsagePage() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [formState, setFormState] = useState(createEmptyUsage());
  const [selectedId, setSelectedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const notifications = useAppNotifications();

  const childOptions = useMemo(
    () =>
      children.map((child) => ({
        value: child.id,
        label: child.name ? child.name : child.id,
      })),
    [children],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const [usageData, childrenData] = await Promise.all([listAppUsage(), listChildren()]);
        if (!active) return;

        setRows(usageData);
        setChildren(childrenData);
        if (usageData.length > 0) {
          const first = usageData[0];
          setSelectedId(first.id);
          setFormState({ ...createEmptyUsage(first.child_id ?? ""), ...first });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load app usage.");
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
    const [usageData, childrenData] = await Promise.all([listAppUsage(), listChildren()]);
    setRows(usageData);
    setChildren(childrenData);
    if (usageData.length > 0) {
      const current = usageData.find((row) => row.id === selectedId) ?? usageData[0];
      setSelectedId(current.id);
      setFormState({ ...createEmptyUsage(current.child_id ?? ""), ...current });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyUsage(childOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({ ...createEmptyUsage(row.child_id ?? ""), ...row });
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
      await saveAppUsage({
        ...formState,
        child_id: formState.child_id || null,
        usage_seconds: Number(formState.usage_seconds || 0),
      });
      notifications.success("App usage saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save app usage.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this usage row?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteAppUsage(selectedId);
      notifications.success("App usage deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyUsage(childOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete app usage.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="App usage"
      description="Manage usage history rows in public.app_usage."
      resourceLabel="Usage admin"
      rows={rows.map((row) => ({
        ...row,
        child_name: children.find((child) => child.id === row.child_id)?.name ?? row.child_id ?? "-",
      }))}
      columns={[
        { key: "child_name", label: "Child" },
        { key: "usage_date", label: "Date" },
        { key: "app_name", label: "App" },
        { key: "package_name", label: "Package" },
        { key: "usage_seconds", label: "Seconds" },
      ]}
      fields={[
        { name: "id", label: "Usage ID", type: "text", readOnly: true },
        { name: "child_id", label: "Child", type: "select", options: childOptions },
        { name: "usage_date", label: "Usage date", type: "date" },
        { name: "app_name", label: "App name", type: "text", placeholder: "YouTube" },
        { name: "package_name", label: "Package name", type: "text", placeholder: "com.google.android.youtube" },
        { name: "usage_seconds", label: "Usage seconds", type: "number" },
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
      note="Usage rows are stored in public.app_usage. This is read/write so you can correct imported data."
    />
  );
}

export default AppUsagePage;
