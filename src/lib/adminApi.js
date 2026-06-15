import { supabase } from "./supabaseClient";

const formatNumber = new Intl.NumberFormat("en-US");

function ensureClient() {
  if (!supabase) {
    return false;
  }

  return true;
}

function formatDistance(fromDate) {
  const date = new Date(fromDate);
  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const delta = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(delta / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatUsage(seconds) {
  const total = Number(seconds ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatLimit(minutes) {
  const total = Number(minutes ?? 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins ? `${mins}m` : ""}`.trim() : `${mins}m`;
}

function startOfDayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getRuleDisplay(rule, appLimitCount) {
  if (!rule) {
    return [
      {
        title: "Daily screen limit",
        value: "Not set",
        detail: "public.rules.daily_screen_limit_minutes",
      },
      {
        title: "Bedtime window",
        value: "Not set",
        detail: "public.rules.bedtime_start / bedtime_end",
      },
      {
        title: "App limit coverage",
        value: formatNumber.format(appLimitCount),
        detail: "public.app_time_limits",
      },
    ];
  }

  return [
    {
      title: "Daily screen limit",
      value: formatLimit(rule.daily_screen_limit_minutes),
      detail: "public.rules.daily_screen_limit_minutes",
    },
    {
      title: "Bedtime window",
      value:
        rule.bedtime_start && rule.bedtime_end
          ? `${String(rule.bedtime_start).slice(0, 5)} - ${String(rule.bedtime_end).slice(0, 5)}`
          : "Not set",
      detail: "public.rules.bedtime_start / bedtime_end",
    },
    {
      title: "App limit coverage",
      value: `${formatNumber.format(appLimitCount)} apps`,
      detail: "public.app_time_limits",
    },
  ];
}

export async function getDashboardData() {
  if (!ensureClient()) {
    return {
      stats: [],
      childrenRows: [],
      ruleCards: [],
      blockedItems: [],
      auditRows: [],
      notifications: [],
    };
  }

  const [
    childrenCount,
    lockedCount,
    blockedCount,
    unreadCount,
    childrenResult,
    rulesResult,
    blockedResult,
    notificationsResult,
    auditResult,
    appUsageResult,
    appLimitsResult,
  ] = await Promise.all([
    supabase.from("children").select("id", { count: "exact", head: true }).eq("is_linked", true),
    supabase.from("children").select("id", { count: "exact", head: true }).eq("is_locked", true),
    supabase.from("blocked_content").select("id", { count: "exact", head: true }),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("children")
      .select("id, name, is_locked, is_linked, last_seen_at, profile_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("rules")
      .select("id, child_id, daily_screen_limit_minutes, bedtime_start, bedtime_end, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("blocked_content")
      .select("id, child_id, type, value, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, parent_id, child_id, type, title, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_logs")
      .select("id, user_id, action, table_name, record_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("app_usage")
      .select("child_id, usage_seconds, usage_date")
      .gte("usage_date", startOfDayIso()),
    supabase.from("app_time_limits").select("id", { count: "exact", head: true }),
  ]);

  const error = [
    childrenCount.error,
    lockedCount.error,
    blockedCount.error,
    unreadCount.error,
    childrenResult.error,
    rulesResult.error,
    blockedResult.error,
    notificationsResult.error,
    auditResult.error,
    appUsageResult.error,
    appLimitsResult.error,
  ].find(Boolean);

  if (error) {
    throw error;
  }

  const usageByChild = (appUsageResult.data ?? []).reduce((acc, row) => {
    const current = acc[row.child_id] ?? 0;
    acc[row.child_id] = current + Number(row.usage_seconds ?? 0);
    return acc;
  }, {});

  const latestRule = rulesResult.data?.[0] ?? null;
  const rulesByChild = (rulesResult.data ?? []).reduce((acc, rule) => {
    if (!acc[rule.child_id]) {
      acc[rule.child_id] = rule;
    }
    return acc;
  }, {});

  const childrenRows = (childrenResult.data ?? []).map((child) => {
    const totalSeconds = usageByChild[child.id] ?? 0;
    const rule = rulesByChild[child.id] ?? latestRule;
    const limitMinutes = rule?.daily_screen_limit_minutes ?? 0;
    const overLimit = limitMinutes > 0 && totalSeconds > limitMinutes * 60;
    const lastSeen = child.last_seen_at ? formatDistance(child.last_seen_at) : "No activity yet";
    const status = child.is_locked ? "Offline" : child.is_linked ? "Online" : "Pending";

    return {
      id: child.id,
      name: child.name,
      status,
      lastSeen,
      screenTime: `${formatUsage(totalSeconds)} / ${formatLimit(limitMinutes || 0)}`,
      lockState: child.is_locked ? "Locked" : "Unlocked",
      risk: child.is_locked || overLimit ? "Medium" : status === "Pending" ? "High" : "Low",
    };
  });

  const ruleCards = getRuleDisplay(latestRule, appLimitsResult.count ?? 0);
  const blockedItems = (blockedResult.data ?? []).map((item) => ({
    type: item.type,
    value: item.value,
    displayName: item.display_name ?? item.value,
  }));

  const auditRows = (auditResult.data ?? []).map((item) => ({
    action: item.action,
    table: item.table_name,
    recordId: item.record_id,
    actor: item.user_id ? String(item.user_id).slice(0, 8) : "system",
    when: item.created_at ? formatDistance(item.created_at) : "recently",
  }));

  const stats = [
    {
      label: "Children linked",
      value: formatNumber.format(childrenCount.count ?? 0),
      detail: "Active parent-child pairs in public.children",
      icon: "bi-people-fill",
    },
    {
      label: "Devices locked",
      value: formatNumber.format(lockedCount.count ?? 0),
      detail: "Children currently flagged is_locked = true",
      icon: "bi-shield-lock-fill",
    },
    {
      label: "Blocked items",
      value: formatNumber.format(blockedCount.count ?? 0),
      detail: "Rows in blocked_content across apps and websites",
      icon: "bi-slash-circle-fill",
    },
    {
      label: "Unread alerts",
      value: formatNumber.format(unreadCount.count ?? 0),
      detail: "Notifications waiting in public.notifications",
      icon: "bi-bell-fill",
    },
  ];

  return {
    stats,
    childrenRows,
    ruleCards,
    blockedItems,
    auditRows,
    notifications: notificationsResult.data ?? [],
  };
}

export async function getChildrenRows() {
  if (!ensureClient()) {
    return [];
  }

  const [childrenResult, rulesResult, appUsageResult] = await Promise.all([
    supabase
      .from("children")
      .select("id, name, is_locked, is_linked, last_seen_at, profile_image_url, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("rules")
      .select("id, child_id, daily_screen_limit_minutes, bedtime_start, bedtime_end, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("app_usage")
      .select("child_id, usage_seconds, usage_date")
      .gte("usage_date", startOfDayIso()),
  ]);

  const error = [childrenResult.error, rulesResult.error, appUsageResult.error].find(Boolean);
  if (error) throw error;

  const usageByChild = (appUsageResult.data ?? []).reduce((acc, row) => {
    acc[row.child_id] = (acc[row.child_id] ?? 0) + Number(row.usage_seconds ?? 0);
    return acc;
  }, {});

  const latestRuleByChild = (rulesResult.data ?? []).reduce((acc, rule) => {
    if (!acc[rule.child_id]) {
      acc[rule.child_id] = rule;
    }
    return acc;
  }, {});

  return (childrenResult.data ?? []).map((child) => {
    const totalSeconds = usageByChild[child.id] ?? 0;
    const rule = latestRuleByChild[child.id];
    const limitMinutes = rule?.daily_screen_limit_minutes ?? 0;
    const overLimit = limitMinutes > 0 && totalSeconds > limitMinutes * 60;
    const ageMinutes = child.last_seen_at ? Math.max(0, (Date.now() - new Date(child.last_seen_at).getTime()) / 60000) : null;
    const status = child.is_locked ? "Offline" : ageMinutes !== null && ageMinutes <= 10 ? "Online" : "Offline";

    return {
      id: child.id,
      name: child.name,
      status,
      lastSeen: child.last_seen_at ? formatDistance(child.last_seen_at) : "No activity yet",
      screenTime: `${formatUsage(totalSeconds)} / ${formatLimit(limitMinutes || 0)}`,
      lockState: child.is_locked ? "Locked" : "Unlocked",
      risk: child.is_locked || overLimit ? "Medium" : status === "Offline" ? "Low" : "Low",
    };
  });
}

export async function getRulesData() {
  if (!ensureClient()) {
    return [];
  }

  const [rulesResult, appLimitsResult] = await Promise.all([
    supabase
      .from("rules")
      .select("id, child_id, daily_screen_limit_minutes, bedtime_start, bedtime_end, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("app_time_limits").select("id", { count: "exact", head: true }),
  ]);

  const error = [rulesResult.error, appLimitsResult.error].find(Boolean);
  if (error) throw error;

  const latestRule = rulesResult.data?.[0] ?? null;

  return getRuleDisplay(latestRule, appLimitsResult.count ?? 0);
}

export async function getBlockedContentData() {
  if (!ensureClient()) {
    return [];
  }

  const { data, error } = await supabase
    .from("blocked_content")
    .select("id, child_id, type, value, display_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    value: item.value,
    displayName: item.display_name ?? item.value,
    childId: item.child_id,
  }));
}

export async function getAuditRows() {
  if (!ensureClient()) {
    return [];
  }

  const [auditResult, usersResult] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("id, user_id, action, table_name, record_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("users").select("id, name, email, role"),
  ]);

  const error = [auditResult.error, usersResult.error].find(Boolean);
  if (error) throw error;

  const actorById = (usersResult.data ?? []).reduce((acc, user) => {
    acc[user.id] = user.name ?? user.email ?? user.role ?? "user";
    return acc;
  }, {});

  return (auditResult.data ?? []).map((item) => ({
    action: item.action,
    table: item.table_name,
    recordId: item.record_id,
    actor: actorById[item.user_id] ?? (item.user_id ? String(item.user_id).slice(0, 8) : "system"),
    when: item.created_at ? formatDistance(item.created_at) : "recently",
  }));
}
