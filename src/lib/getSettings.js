import dbConnect from "@/lib/mongoose";
import Settings from "@/models/Settings";

let cachedSettings = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export function clearSettingsCache() {
  cachedSettings = null;
  cacheTime = 0;
}

/**
 * Fetches global platform settings from DB with a short in-memory cache.
 * Falls back to process.env values if DB settings are empty.
 */
export async function getSettings() {
  const now = Date.now();
  if (process.env.NODE_ENV !== "development" && cachedSettings && now - cacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  await dbConnect();
  const settings = await Settings.findOne({}).lean();

  cachedSettings = {
    sunoApiKey: settings?.sunoApiKey || process.env.SUNO_API_KEY || "",
    sunoApiBase: process.env.SUNO_API_BASE || "",
    shopUrl: settings?.shopUrl || "",
    shopifyClientId: settings?.shopifyClientId || "",
    shopifySecretId: settings?.shopifySecretId || "",
    shopifyAdminApiKey: settings?.shopifyAdminApiKey || "",
    notificationEmail: settings?.notificationEmail || "",
    contactPhone: settings?.contactPhone || "",
    monthlyTarget: settings?.monthlyTarget || 20000,
  };
  cacheTime = now;

  return cachedSettings;
}
