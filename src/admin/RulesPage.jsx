import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteRule, listChildren, listRules, saveRule } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyRule(childId = "") {
  return {
    id: crypto.randomUUID(),
    child_id: childId,
    daily_screen_limit_minutes: 180,
    bedtime_start: "21:00",
    bedtime_end: "06:00",
  };
}

function RulesPage() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [formState, setFormState] = useState(createEmptyRule());
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
        label: child.name ? `${child.name}` : child.id,
      })),
    [children],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const [rulesData, childrenData] = await Promise.all([listRules(), listChildren()]);
        if (!active) return;

        setRows(rulesData);
        setChildren(childrenData);
        if (rulesData.length > 0) {
          const first = rulesData[0];
          setSelectedId(first.id);
          setFormState({ ...createEmptyRule(first.child_id ?? ""), ...first });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load rules.");
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
    const [rulesData, childrenData] = await Promise.all([listRules(), listChildren()]);
    setRows(rulesData);
    setChildren(childrenData);
    if (rulesData.length > 0) {
      const current = rulesData.find((row) => row.id === selectedId) ?? rulesData[0];
      setSelectedId(current.id);
      setFormState({ ...createEmptyRule(current.child_id ?? ""), ...current });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyRule(childOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({ ...createEmptyRule(row.child_id ?? ""), ...row });
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
      await saveRule({
        ...formState,
        daily_screen_limit_minutes: Number(formState.daily_screen_limit_minutes || 0),
        child_id: formState.child_id || null,
      });
      notifications.success("Rule saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save rule.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this rule?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteRule(selectedId);
      notifications.success("Rule deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyRule(childOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete rule.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="Rules"
      description="Manage screen limits and bedtime windows for each child."
      resourceLabel="Policy admin"
      rows={rows.map((row) => ({
        ...row,
        child_name: children.find((child) => child.id === row.child_id)?.name ?? row.child_id ?? "-",
      }))}
      columns={[
        { key: "child_name", label: "Child" },
        { key: "daily_screen_limit_minutes", label: "Daily limit" },
        {
          key: "bedtime_start",
          label: "Bedtime",
          render: (row) => `${row.bedtime_start ?? "-"} - ${row.bedtime_end ?? "-"}`,
        },
      ]}
      fields={[
        { name: "id", label: "Rule ID", type: "text", readOnly: true },
        { name: "child_id", label: "Child", type: "select", options: childOptions },
        { name: "daily_screen_limit_minutes", label: "Daily screen limit minutes", type: "number" },
        { name: "bedtime_start", label: "Bedtime start", type: "time" },
        { name: "bedtime_end", label: "Bedtime end", type: "time" },
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
      note="Rules are stored in public.rules and linked to children by child_id."
    />
  );
}

export default RulesPage;
