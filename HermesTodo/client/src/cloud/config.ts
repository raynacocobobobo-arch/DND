/** Public browser configuration only. Never place service_role or secret keys here. */
export const CLOUD_CONFIG_KEY = "hermestodo-supabase-public-v1";
export const DEMO_DATA_KEY = "hermestodo-public-preview-v1";
export type CloudConfig = { url: string; publishableKey: string };

const HOSTED_CLOUD_CONFIG: CloudConfig = {
  url: "https://arnrlepjuqdmvbipswci.supabase.co",
  publishableKey: "sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt"
};

function isHostedHermesTodo(): boolean {
  return import.meta.env.VITE_STATIC_PREVIEW === "true"
    && typeof window !== "undefined"
    && window.location.hostname === "raynacocobobobo-arch.github.io"
    && window.location.pathname.startsWith("/DND/hermestodo");
}

function storedCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw) as Partial<CloudConfig>;
    if (typeof item.url !== "string" || typeof item.publishableKey !== "string") return null;
    const url = new URL(item.url);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) return null;
    if (!item.publishableKey.startsWith("sb_publishable_") && !item.publishableKey.startsWith("eyJ")) return null;
    return { url: url.origin, publishableKey: item.publishableKey };
  } catch {
    return null;
  }
}

export function readCloudConfig(): CloudConfig | null {
  // The public Pages site is a private single-user tool: always bind it to the
  // approved Supabase project so the owner never has to configure "cloud mode".
  if (isHostedHermesTodo()) return HOSTED_CLOUD_CONFIG;
  return storedCloudConfig();
}

export function isCloudMode(): boolean {
  return import.meta.env.VITE_STATIC_PREVIEW === "true" && readCloudConfig() !== null;
}

export function saveCloudConfig(urlValue: string, keyValue: string): void {
  const url = new URL(urlValue.trim());
  const key = keyValue.trim();
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co") || url.username || url.password || url.search || url.hash) {
    throw new Error("请输入 Supabase 项目地址，例如 https://xxxx.supabase.co");
  }
  if (key.startsWith("sb_secret_") || /service_role/i.test(key)) {
    throw new Error("不能在网页中填写 secret/service_role 密钥。请使用 publishable 或旧版 anon 公钥。");
  }
  if (!(key.startsWith("sb_publishable_") || key.startsWith("eyJ"))) {
    throw new Error("请输入 Supabase publishable key（或旧版 anon 公钥）。");
  }
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify({ url: url.origin, publishableKey: key }));
}

export function clearCloudConfig(): void {
  localStorage.removeItem(CLOUD_CONFIG_KEY);
}
