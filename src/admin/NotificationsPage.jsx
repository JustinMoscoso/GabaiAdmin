import { useEffect, useMemo, useState } from "react";
import CrudResourcePage from "./CrudResourcePage";
import { deleteNotification, listChildren, listNotifications, listParents, saveNotification } from "../lib/adminCrud";
import { useAppNotifications } from "../components/AppNotifications";

function createEmptyNotification(parentId = "", childId = "") {
  return {
    id: crypto.randomUUID(),
    parent_id: parentId,
    child_id: childId,
    type: "alert",
    title: "",
    message: "",
    is_read: false,
  };
}

function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [formState, setFormState] = useState(createEmptyNotification());
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
        const [notificationsData, parentsData, childrenData] = await Promise.all([
          listNotifications(),
          listParents(),
          listChildren(),
        ]);
        if (!active) return;

        setRows(notificationsData);
        setParents(parentsData);
        setChildren(childrenData);
        if (notificationsData.length > 0) {
          const first = notificationsData[0];
          setSelectedId(first.id);
          setFormState({ ...createEmptyNotification(first.parent_id ?? "", first.child_id ?? ""), ...first });
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load notifications.");
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
    const [notificationsData, parentsData, childrenData] = await Promise.all([
      listNotifications(),
      listParents(),
      listChildren(),
    ]);
    setRows(notificationsData);
    setParents(parentsData);
    setChildren(childrenData);
    if (notificationsData.length > 0) {
      const current = notificationsData.find((row) => row.id === selectedId) ?? notificationsData[0];
      setSelectedId(current.id);
      setFormState({ ...createEmptyNotification(current.parent_id ?? "", current.child_id ?? ""), ...current });
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormState(createEmptyNotification(parentOptions[0]?.value ?? "", childOptions[0]?.value ?? ""));
    setError("");
    setIsFormOpen(true);
  };

  const handleSelectRow = (row) => {
    setSelectedId(row.id);
    setFormState({ ...createEmptyNotification(row.parent_id ?? "", row.child_id ?? ""), ...row });
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
      await saveNotification({
        ...formState,
        parent_id: formState.parent_id || null,
        child_id: formState.child_id || null,
        is_read: Boolean(formState.is_read),
      });
      notifications.success("Notification saved successfully.");
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save notification.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this notification?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteNotification(selectedId);
      notifications.success("Notification deleted successfully.");
      setIsFormOpen(false);
      setSelectedId(null);
      setFormState(createEmptyNotification(parentOptions[0]?.value ?? "", childOptions[0]?.value ?? ""));
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete notification.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrudResourcePage
      title="Notifications"
      description="Manage parent-facing notifications and child alerts."
      resourceLabel="Notification admin"
      rows={rows.map((row) => ({
        ...row,
        parent_name: parents.find((parent) => parent.id === row.parent_id)?.name ?? row.parent_id ?? "-",
        child_name: children.find((child) => child.id === row.child_id)?.name ?? row.child_id ?? "-",
      }))}
      columns={[
        { key: "parent_name", label: "Parent" },
        { key: "child_name", label: "Child" },
        { key: "type", label: "Type" },
        { key: "title", label: "Title" },
        { key: "is_read", label: "Read", render: (row) => (row.is_read ? "Yes" : "No") },
      ]}
      fields={[
        { name: "id", label: "Notification ID", type: "text", readOnly: true },
        { name: "parent_id", label: "Parent", type: "select", options: parentOptions },
        { name: "child_id", label: "Child", type: "select", options: childOptions },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "alert", label: "Alert" },
            { value: "warning", label: "Warning" },
            { value: "info", label: "Info" },
          ],
        },
        { name: "title", label: "Title", type: "text" },
        { name: "message", label: "Message", type: "textarea", rows: 5 },
        { name: "is_read", label: "Read", type: "checkbox" },
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
      note="Notifications are stored in public.notifications and can be tied to both parent_id and child_id."
    />
  );
}

export default NotificationsPage;
