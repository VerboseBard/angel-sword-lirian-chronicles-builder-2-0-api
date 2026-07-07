const REQUIRED_COLLECTIONS = ["races", "ancestries", "classes", "abilities", "breakthroughs", "items"];
// Detail data intentionally carries fewer collections than summary data: the
// bundled assets/lyrian-detail-data.js shape only provides races, ancestries,
// and classes (with rich fields such as descriptionHtml and lineageChoices).
// Requiring all six summary collections here would silently reject valid
// detail payloads and fall back to summary data.
const REQUIRED_DETAIL_COLLECTIONS = ["races", "ancestries", "classes"];

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function hasCollections(payload, keys) {
  return keys.every((key) => Array.isArray(payload?.[key]));
}

function hasRequiredCollections(payload) {
  return hasCollections(payload, REQUIRED_COLLECTIONS);
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
  if (detail && hasCollections(detail, REQUIRED_DETAIL_COLLECTIONS)) {
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
