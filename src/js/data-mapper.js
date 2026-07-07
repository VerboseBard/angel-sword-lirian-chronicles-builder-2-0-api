const REQUIRED_COLLECTIONS = ["races", "ancestries", "classes", "abilities", "breakthroughs", "items"];

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function hasRequiredCollections(payload) {
  return REQUIRED_COLLECTIONS.every((key) => Array.isArray(payload?.[key]));
}

function normalizeGameData(payload, fallbackVersion = "") {
  const data = asObject(payload);
  if (!data || !hasRequiredCollections(data)) {
    return null;
  }
  return {
    ...data,
    version: String(data.version || fallbackVersion || "api").trim()
  };
}

function normalizeDetailData(payload, fallbackData) {
  const detail = asObject(payload);
  if (detail && hasRequiredCollections(detail)) {
    return {
      ...detail,
      version: String(detail.version || fallbackData.version || "api").trim()
    };
  }
  return fallbackData;
}

function normalizeVersionManifest(payload, data) {
  const manifest = asObject(payload);
  if (manifest && Array.isArray(manifest.versions)) {
    return {
      ...manifest,
      defaultVersion: manifest.defaultVersion || data.version,
      latestKnownVersion: manifest.latestKnownVersion || data.version
    };
  }
  return {
    schema: 1,
    defaultVersion: data.version,
    latestKnownVersion: data.version,
    officialManualUrl: "https://rpg.angelssword.com/game/online-manual",
    versions: [
      {
        id: data.version,
        label: `${data.version} - Lyrian Chronicles`,
        status: "api",
        local: false,
        updates: ["Loaded from the configured Angel's Sword API provider."]
      }
    ]
  };
}

export function mapApiPayloadToLyrianGlobals(payload) {
  const root = asObject(payload);
  if (!root) {
    throw new Error("The API response was not an object.");
  }

  const candidateData = root.data || root.lyrianData || root.gameData || root;
  const data = normalizeGameData(candidateData);
  if (!data) {
    throw new Error("The API response did not contain usable Lyrian game data collections.");
  }

  const detailData = normalizeDetailData(root.detailData || root.lyrianDetailData || root.details, data);
  const versionManifest = normalizeVersionManifest(root.versionManifest || root.manifest, data);

  return {
    data,
    detailData,
    versionManifest,
    source: root.source || "api"
  };
}

export function applyMappedLyrianData(mapped) {
  if (!mapped?.data || !mapped?.detailData) {
    throw new Error("Mapped API data is incomplete.");
  }
  window.LYRIAN_DATA = mapped.data;
  window.LYRIAN_DETAIL_DATA = mapped.detailData;
  window.LYRIAN_VERSION_MANIFEST = mapped.versionManifest;
}
