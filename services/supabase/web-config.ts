import {
    DEFAULT_WEB_CONFIG,
    parseWebConfig,
    serializeWebConfig,
    type WebConfig,
} from "@/models/web-config";
import { supabase } from "./client";

export interface WebConfigResult {
  webEnabled: boolean;
  webUrl: string | null;
  config: WebConfig;
}

export async function getWebConfig(
  businessId: string,
  deviceId: string,
): Promise<WebConfigResult> {
  const { data, error } = await supabase.rpc("get_web_config", {
    p_business_id: businessId,
    p_device_id: deviceId,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error ?? "unknown_error");

  return {
    webEnabled: data.web_enabled ?? false,
    webUrl: (data.web_url as string) ?? null,
    config: data.config
      ? parseWebConfig(data.config)
      : { ...DEFAULT_WEB_CONFIG },
  };
}

export async function updateWebConfig(
  businessId: string,
  deviceId: string,
  webEnabled: boolean,
  config: WebConfig,
): Promise<void> {
  const { data, error } = await supabase.rpc("update_web_config", {
    p_business_id: businessId,
    p_device_id: deviceId,
    p_web_enabled: webEnabled,
    p_config: serializeWebConfig(config),
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error ?? "unknown_error");
}
