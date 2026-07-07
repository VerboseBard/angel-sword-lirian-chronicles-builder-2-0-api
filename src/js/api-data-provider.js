import { applyMappedLyrianData, mapApiPayloadToLyrianGlobals } from "./data-mapper.js";

export const DEFAULT_API_CONFIG = {
  schema: 1,
  mode: "static",
  enabled: false,
  apiBaseUrl: "",
  gameDataPath: "/builder/game-data",
  timeoutMs: 8000,
  fallbackToStatic: true,
  strict: false
};

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizePath(value) {
  const path = String(value || "").trim() || DEFAULT_API_CONFIG.gameDataPath;
  return path.startsWith("/") ? path : `/${path}`;
}

function getRuntimeApiConfig() {
  const supplied = window.LYRIAN_API_CONFIG && typeof window.LYRIAN_API_CONFIG === "object"
    ? window.LYRIAN_API_CONFIG
    : {};
  return {
    ...DEFAULT_API_CONFIG,
    ...supplied,
    apiBaseUrl: normalizeBaseUrl(supplied.apiBaseUrl),
    gameDataPath: normalizePath(supplied.gameDataPath),
    timeoutMs: Math.max(1000, Number(supplied.timeoutMs || DEFAULT_API_CONFIG.timeoutMs) || DEFAULT_API_CONFIG.timeoutMs)
  };
}

function shouldUseApi(config) {
  return Boolean(config.enabled) && String(config.mode || "").toLowerCase() === "api" && config.apiBaseUrl;
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`The API response from ${url} was not valid JSON.`);
    }
    if (!response.ok) {
      throw new Error(data?.message || `The API returned HTTP ${response.status}.`);
    }
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function loadApiDataProvider() {
  const config = getRuntimeApiConfig();
  if (!shouldUseApi(config)) {
    return {
      ok: true,
      provider: "static",
      mode: "static",
      config,
      message: "API mode is disabled; using bundled local data."
    };
  }

  const endpoint = `${config.apiBaseUrl}${config.gameDataPath}`;
  try {
    const payload = await fetchJsonWithTimeout(endpoint, config.timeoutMs);
    const mapped = mapApiPayloadToLyrianGlobals(payload);
    applyMappedLyrianData(mapped);
    return {
      ok: true,
      provider: "api",
      mode: "api",
      config,
      endpoint,
      version: mapped.data.version,
      message: `Loaded Lyrian data v${mapped.data.version} from configured API.`
    };
  } catch (error) {
    if (config.strict || !config.fallbackToStatic) {
      throw error;
    }
    return {
      ok: false,
      provider: "static",
      mode: "static-fallback",
      config,
      endpoint,
      error: error?.message || "API data load failed.",
      message: "API data load failed; using bundled local data instead."
    };
  }
}
