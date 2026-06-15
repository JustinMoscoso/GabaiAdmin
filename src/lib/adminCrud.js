import { supabase } from "./supabaseClient";

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
}

export function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function fromLocalDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function withGeneratedId(record) {
  return {
    ...record,
    id: record.id || crypto.randomUUID(),
  };
}

export async function getAdminOverview() {
  requireClient();

  const [
    parentsResult,
    childrenResult,
    lockedResult,
    unreadResult,
    recentParentsResult,
    recentChildrenResult,
    recentNotificationsResult,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("children").select("id", { count: "exact", head: true }),
    supabase.from("children").select("id", { count: "exact", head: true }).eq("is_locked", true),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("users")
      .select("id, role, name, email, is_active, created_at, gender, profile_image_url")
      .eq("role", "parent")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("children")
      .select("id, parent_id, name, is_linked, is_locked, last_seen_at, profile_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, parent_id, child_id, type, title, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const error = [
    parentsResult.error,
    childrenResult.error,
    lockedResult.error,
    unreadResult.error,
    recentParentsResult.error,
    recentChildrenResult.error,
    recentNotificationsResult.error,
  ].find(Boolean);

  if (error) throw error;

  return {
    stats: [
      { label: "Parents", value: String(parentsResult.count ?? 0) },
      { label: "Children", value: String(childrenResult.count ?? 0) },
      { label: "Locked", value: String(lockedResult.count ?? 0) },
      { label: "Unread", value: String(unreadResult.count ?? 0) },
    ],
    parents: recentParentsResult.data ?? [],
    children: recentChildrenResult.data ?? [],
    notifications: recentNotificationsResult.data ?? [],
  };
}

export async function listParents() {
  requireClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, role, name, email, is_active, created_at, gender, profile_image_url")
    .eq("role", "parent")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveParent(record) {
  requireClient();
  const payload = withGeneratedId({
    role: "parent",
    is_active: true,
    ...record,
  });

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteParent(id) {
  requireClient();
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
}

export async function inviteParent(payload) {
  requireClient();
  const { data, error } = await supabase.functions.invoke("invite-parent", {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function listChildren() {
  requireClient();
  const { data, error } = await supabase
    .from("children")
    .select("id, parent_id, name, is_linked, is_locked, last_seen_at, profile_image_url, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveChild(record) {
  requireClient();
  const payload = withGeneratedId({
    is_linked: false,
    is_locked: false,
    ...record,
  });

  const { error } = await supabase.from("children").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteChild(id) {
  requireClient();
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) throw error;
}

export async function listRules() {
  requireClient();
  const { data, error } = await supabase
    .from("rules")
    .select("id, child_id, daily_screen_limit_minutes, bedtime_start, bedtime_end, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveRule(record) {
  requireClient();
  const payload = withGeneratedId(record);
  const { error } = await supabase.from("rules").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteRule(id) {
  requireClient();
  const { error } = await supabase.from("rules").delete().eq("id", id);
  if (error) throw error;
}

export async function listBlockedContent() {
  requireClient();
  const { data, error } = await supabase
    .from("blocked_content")
    .select("id, child_id, type, value, display_name, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveBlockedContent(record) {
  requireClient();
  const payload = withGeneratedId(record);
  const { error } = await supabase.from("blocked_content").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteBlockedContent(id) {
  requireClient();
  const { error } = await supabase.from("blocked_content").delete().eq("id", id);
  if (error) throw error;
}

export async function listNotifications() {
  requireClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, parent_id, child_id, type, title, message, is_read, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveNotification(record) {
  requireClient();
  const payload = withGeneratedId({
    is_read: false,
    ...record,
  });
  const { error } = await supabase.from("notifications").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteNotification(id) {
  requireClient();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

export async function listPairingTokens() {
  requireClient();
  const { data, error } = await supabase
    .from("pairing_tokens")
    .select("id, parent_id, token, expires_at, is_used, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function savePairingToken(record) {
  requireClient();
  const payload = withGeneratedId({
    is_used: false,
    ...record,
  });
  const { error } = await supabase.from("pairing_tokens").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deletePairingToken(id) {
  requireClient();
  const { error } = await supabase.from("pairing_tokens").delete().eq("id", id);
  if (error) throw error;
}

export async function listAppUsage() {
  requireClient();
  const { data, error } = await supabase
    .from("app_usage")
    .select("id, child_id, usage_date, package_name, app_name, usage_seconds, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveAppUsage(record) {
  requireClient();
  const payload = withGeneratedId(record);
  const { error } = await supabase.from("app_usage").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  return payload;
}

export async function deleteAppUsage(id) {
  requireClient();
  const { error } = await supabase.from("app_usage").delete().eq("id", id);
  if (error) throw error;
}

export async function listAuditLogs() {
  requireClient();
  const [logsResult, usersResult] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("id, user_id, action, table_name, record_id, old_data, new_data, ip_address, device_info, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("users").select("id, name, email, role"),
  ]);

  const error = [logsResult.error, usersResult.error].find(Boolean);
  if (error) throw error;

  const actorById = (usersResult.data ?? []).reduce((acc, user) => {
    acc[user.id] = user.name ?? user.email ?? user.role ?? "user";
    return acc;
  }, {});

  return (logsResult.data ?? []).map((item) => ({
    id: item.id,
    action: item.action,
    table: item.table_name,
    recordId: item.record_id,
    actor: actorById[item.user_id] ?? (item.user_id ? String(item.user_id).slice(0, 8) : "system"),
    when: item.created_at,
    ipAddress: item.ip_address,
    deviceInfo: item.device_info,
  }));
}
