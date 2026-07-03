import { createClient } from "@supabase/supabase-js";

let cachedClient = null;

export function getSupabaseConfig(env = import.meta.env) {
  return {
    url: env?.VITE_SUPABASE_URL || "",
    anonKey: env?.VITE_SUPABASE_ANON_KEY || "",
  };
}

export function isSupabaseConfigured(env = import.meta.env) {
  const config = getSupabaseConfig(env);
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseClient(env = import.meta.env) {
  if (typeof window !== "undefined" && window.__youshuSupabaseClient) {
    return window.__youshuSupabaseClient;
  }

  if (!isSupabaseConfigured(env)) {
    return null;
  }

  if (!cachedClient) {
    const config = getSupabaseConfig(env);
    cachedClient = createClient(config.url, config.anonKey);
  }

  return cachedClient;
}
