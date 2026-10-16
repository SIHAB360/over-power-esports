import { createClient } from "@supabase/supabase-js";

const authStorage = {
  getItem(key) {
    if (typeof window === "undefined") return null;

    const rememberSession = window.localStorage.getItem("op-remember-session") !== "false";
    const primary = rememberSession ? window.localStorage : window.sessionStorage;
    const fallback = rememberSession ? window.sessionStorage : window.localStorage;
    const value = primary.getItem(key);

    if (value !== null) return value;

    const fallbackValue = fallback.getItem(key);
    if (fallbackValue !== null) {
      primary.setItem(key, fallbackValue);
      fallback.removeItem(key);
    }

    return fallbackValue;
  },

  setItem(key, value) {
    if (typeof window === "undefined") return;

    const rememberSession = window.localStorage.getItem("op-remember-session") !== "false";
    const primary = rememberSession ? window.localStorage : window.sessionStorage;
    const secondary = rememberSession ? window.sessionStorage : window.localStorage;

    primary.setItem(key, value);
    secondary.removeItem(key);
  },

  removeItem(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: authStorage
    }
  }
);
