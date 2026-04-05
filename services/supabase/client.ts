import {
  DATA_ANON_KEY_KEY,
  DATA_URL_KEY,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants/supabase";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseOptions = {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

/** Central Supabase — activation codes & business connections */
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  supabaseOptions,
);

// ── Dynamic Data Client ──────────────────────────────────────────────────────

let _dataClient: SupabaseClient | null = null;

/** Save data connection credentials to SecureStore */
export async function saveDataConnection(
  dataUrl: string,
  dataAnonKey: string,
): Promise<void> {
  await SecureStore.setItemAsync(DATA_URL_KEY, dataUrl);
  await SecureStore.setItemAsync(DATA_ANON_KEY_KEY, dataAnonKey);
  // Invalidate cached client
  _dataClient = null;
}

/** Check if data connection credentials exist */
export async function hasDataConnection(): Promise<boolean> {
  const url = await SecureStore.getItemAsync(DATA_URL_KEY);
  const key = await SecureStore.getItemAsync(DATA_ANON_KEY_KEY);
  return !!(url && key);
}

/** Get or create the Data Supabase client. Returns null if not configured. */
export async function getDataClient(): Promise<SupabaseClient | null> {
  if (_dataClient) return _dataClient;

  const url = await SecureStore.getItemAsync(DATA_URL_KEY);
  const key = await SecureStore.getItemAsync(DATA_ANON_KEY_KEY);

  if (!url || !key) return null;

  _dataClient = createClient(url, key, supabaseOptions);
  return _dataClient;
}

/** Clear data connection credentials */
export async function clearDataConnection(): Promise<void> {
  await SecureStore.deleteItemAsync(DATA_URL_KEY);
  await SecureStore.deleteItemAsync(DATA_ANON_KEY_KEY);
  _dataClient = null;
}

// ── Fetch credentials from Central ──────────────────────────────────────────

/**
 * Ask Central for the Data Supabase credentials.
 * Verifies device ownership via activation_codes.
 * Saves them to SecureStore and returns the client.
 */
export async function fetchAndSaveDataConnection(
  businessId: string,
  deviceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("get_data_connection", {
      p_business_id: businessId,
      p_device_id: deviceId,
    });

    if (error) {
      console.warn("[DataConn] RPC error:", error.message);
      return { success: false, error: "network_error" };
    }

    if (!data?.success) {
      return { success: false, error: data?.error ?? "unknown" };
    }

    await saveDataConnection(data.data_url, data.data_anon_key);
    console.log("[DataConn] Credentials fetched and saved from Central");
    return { success: true };
  } catch (err) {
    console.warn("[DataConn] Network error:", err);
    return { success: false, error: "network_error" };
  }
}

/**
 * Ensure we have a Data client — fetch from Central if missing.
 * This is the main entry point for cloud sync.
 */
export async function ensureDataClient(
  businessId: string,
  deviceId: string,
): Promise<SupabaseClient | null> {
  // Try cached/stored first
  const existing = await getDataClient();
  if (existing) return existing;

  // Not stored → ask Central
  const result = await fetchAndSaveDataConnection(businessId, deviceId);
  if (!result.success) {
    console.warn("[DataConn] Could not obtain credentials:", result.error);
    return null;
  }

  return getDataClient();
}
