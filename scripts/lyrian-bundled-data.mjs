// Shared Node-side loader for the bundled Lyrian rules data.
// Used by the local mock official-API endpoint (scripts/server.mjs), the
// payload validator (scripts/validate-api-payload.mjs), and the sample
// payload generator (scripts/generate-sample-api-payload.mjs).
//
// The bundled data files are browser scripts that assign to window globals,
// so they are evaluated inside an isolated vm sandbox instead of parsed as
// JSON. That keeps this loader correct even if a future data build emits
// non-JSON JavaScript.

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

// Collections the app's data mapper requires on summary game data.
export const GAME_DATA_COLLECTIONS = ["races", "ancestries", "classes", "abilities", "breakthroughs", "items"];
// Detail data intentionally carries fewer collections (rich race/ancestry/class
// records with descriptionHtml, lineageChoices, keyAbility, etc.).
export const DETAIL_DATA_COLLECTIONS = ["races", "ancestries", "classes"];

export async function loadWindowGlobal(filePath, globalName) {
  const source = await fs.readFile(filePath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: filePath });
  const value = sandbox.window[globalName];
  if (!value || typeof value !== "object") {
    throw new Error(`${filePath} did not define window.${globalName}.`);
  }
  return value;
}

export async function readBundledVersionManifest(projectRoot) {
  const jsonPath = path.join(projectRoot, "assets", "versions", "manifest.json");
  try {
    return JSON.parse(await fs.readFile(jsonPath, "utf8"));
  } catch {
    return loadWindowGlobal(path.join(projectRoot, "assets", "versions", "manifest.js"), "LYRIAN_VERSION_MANIFEST");
  }
}

export async function listBundledVersionIds(projectRoot) {
  const manifest = await readBundledVersionManifest(projectRoot);
  return (manifest.versions || []).map((entry) => entry.id).filter(Boolean);
}

export async function loadBundledGameData(projectRoot, versionId = "") {
  const manifest = await readBundledVersionManifest(projectRoot);
  const requested = String(versionId || "").trim() || manifest.latestKnownVersion || manifest.defaultVersion || "";
  const record = (manifest.versions || []).find((entry) => entry.id === requested);
  if (!record || !record.dataPath || !record.detailPath) {
    const available = (manifest.versions || []).map((entry) => entry.id).join(", ") || "none";
    const error = new Error(`Rules version "${requested}" is not bundled locally. Available versions: ${available}.`);
    error.code = "UNKNOWN_VERSION";
    error.availableVersions = (manifest.versions || []).map((entry) => entry.id);
    throw error;
  }
  const data = await loadWindowGlobal(path.join(projectRoot, record.dataPath), "LYRIAN_DATA");
  const detailData = await loadWindowGlobal(path.join(projectRoot, record.detailPath), "LYRIAN_DETAIL_DATA");
  return { versionId: requested, data, detailData, manifest };
}

// Builds the payload shape the app's API provider expects from
// GET {apiBaseUrl}{gameDataPath}. This is the reference contract for an
// official implementation: docs/api-integration-plan.md describes it, and
// docs/sample-api-payload.json is a truncated generated example.
//
// The versionManifest deliberately lists only the served version, marked
// status "api" with no local dataPath. Listing other versions without a
// matching data endpoint would let the in-app version manager select a
// version whose data it cannot load (see docs/api-mode-ownership-map.md).
export async function buildApiPayload(projectRoot, versionId = "") {
  const { versionId: served, data, detailData, manifest } = await loadBundledGameData(projectRoot, versionId);
  return {
    ok: true,
    schema: 1,
    source: "local-mock-official-api",
    generatedAt: new Date().toISOString(),
    data,
    detailData,
    versionManifest: {
      schema: 1,
      defaultVersion: served,
      latestKnownVersion: manifest.latestKnownVersion || served,
      officialManualUrl: manifest.officialManualUrl || "https://rpg.angelssword.com/game/online-manual",
      versions: [
        {
          id: served,
          label: `${served} - Lyrian Chronicles`,
          status: "api",
          local: false,
          updates: (manifest.versions || []).find((entry) => entry.id === served)?.updates || []
        }
      ]
    }
  };
}
