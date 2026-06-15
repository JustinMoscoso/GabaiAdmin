import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteBlockedContent, listBlockedContent, listChildren, saveBlockedContent } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyItem(childId = "") {
  return {
    id: crypto.randomUUID(),
    child_id: childId,
    type: "app",
    value: "",
    display_name: "",
  };
}

function BlockedContentPage() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [formState, setFormState] = useState(createEmptyItem());
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
        const [blockedData, childrenData] = await Promise.all([listBlockedContent(), listChildren()]);
        if (!active) return;

        setRows(blockedData);
        setChildren(childrenData);
        if (blockedData.length > 0) {
          const first = blockedData[0];
          setSelectedId(first.id);
          setFormState({ ...createEmptyItem(first.child_id ?? ""), ...first });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load blocked content.");
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
    const [blockedData, childrenData] = await Promise.all([listBlockedContent(), listChildren()]);
    setRows(blockedData);
    setChildren(childrenData);
    if (blockedData.length > 0) {
      const current = blockedData.find((row) => row.id === selectedId) ?? blockedData[0];
      setSelectedId(current.id);
      setFormState({ ...createEmptyItem(current.child_id ?? ""), ...current });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyItem(childOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({ ...createEmptyItem(row.child_id ?? ""), ...row });
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
      await saveBlockedContent({
        ...formState,
        child_id: formState.child_id || null,
      });
      notifications.success("Blocked item saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save blocked item.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this blocked item?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteBlockedContent(selectedId);
      notifications.success("Blocked item deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyItem(childOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete blocked item.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="Blocked content"
      description="Manage blocked apps and websites for each child profile."
      resourceLabel="Content admin"
      rows={rows.map((row) => ({
        ...row,
        child_name: children.find((child) => child.id === row.child_id)?.name ?? row.child_id ?? "-",
      }))}
      columns={[
        { key: "child_name", label: "Child" },
        { key: "type", label: "Type" },
        { key: "display_name", label: "Display name" },
        { key: "value", label: "Value" },
      ]}
      fields={[
        { name: "id", label: "Blocked item ID", type: "text", readOnly: true },
        { name: "child_id", label: "Child", type: "select", options: childOptions },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "app", label: "App" },
            { value: "website", label: "Website" },
          ],
        },
        { name: "value", label: "Value", type: "text", placeholder: "com.example.app or domain.com" },
        { name: "display_name", label: "Display name", type: "text", placeholder: "Friendly label" },
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
      note="Blocked entries are stored in public.blocked_content."
    />
  );
}

export default BlockedContentPage;
