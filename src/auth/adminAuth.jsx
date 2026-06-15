/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AdminAuthContext = createContext(null);
const SESSION_KEY = "gabai_admin_session";

function cacheSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readCachedSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCachedSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

async function fetchAdminProfile(user) {
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, profile_image_url, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.role !== "admin") {
    return null;
  }

  if (data.is_active === false) {
    throw new Error("This admin account is disabled.");
  }

  return {
    id: data.id,
    email: data.email ?? user.email ?? "",
    name: data.name ?? data.email ?? user.email ?? "Admin",
    role: data.role,
    profileImageUrl: data.profile_image_url ?? null,
  };
}

export async function signInAdmin(email, password) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const adminProfile = await fetchAdminProfile(data.user);

  if (!adminProfile) {
    await supabase.auth.signOut();
    throw new Error("This account is not enabled for admin access.");
  }

  const session = {
    email: adminProfile.email,
    name: adminProfile.name,
    role: adminProfile.role,
    id: adminProfile.id,
    profileImageUrl: adminProfile.profileImageUrl,
    createdAt: new Date().toISOString(),
  };

  cacheSession(session);
  return session;
}

export async function signOutAdmin() {
  clearCachedSession();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => readCachedSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!supabase) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!authSession?.user) {
        clearCachedSession();
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const adminProfile = await fetchAdminProfile(authSession.user);

        if (!active) {
          return;
        }

        if (!adminProfile) {
          clearCachedSession();
          setSession(null);
          setLoading(false);
          return;
        }

        const nextSession = {
          email: adminProfile.email,
          name: adminProfile.name,
          role: adminProfile.role,
          id: adminProfile.id,
          profileImageUrl: adminProfile.profileImageUrl,
          createdAt: new Date().toISOString(),
        };

        cacheSession(nextSession);
        setSession(nextSession);
      } catch {
        clearCachedSession();
        setSession(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase
      ? supabase.auth.onAuthStateChange(async (_event, authSession) => {
          if (!active) {
            return;
          }

          if (!authSession?.user) {
            clearCachedSession();
            setSession(null);
            setLoading(false);
            return;
          }

          try {
            const adminProfile = await fetchAdminProfile(authSession.user);

            if (!active) {
              return;
            }

            if (!adminProfile) {
              clearCachedSession();
              setSession(null);
              setLoading(false);
              return;
            }

            const nextSession = {
              email: adminProfile.email,
              name: adminProfile.name,
              role: adminProfile.role,
              id: adminProfile.id,
              profileImageUrl: adminProfile.profileImageUrl,
              createdAt: new Date().toISOString(),
            };

            cacheSession(nextSession);
            setSession(nextSession);
            setLoading(false);
          } catch {
            clearCachedSession();
            setSession(null);
            setLoading(false);
          }
        })
      : { subscription: null };

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      setSession,
    }),
    [session, loading],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);

  if (!value) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }

  return value;
}

export function getAdminSession() {
  return readCachedSession();
}

export function setAdminSession(session) {
  cacheSession(session);
}

export function clearAdminSession() {
  clearCachedSession();
}
