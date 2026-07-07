// Validates a candidate official-API payload against the contract the app's
// data provider expects, without needing to run the app.
//
// Usage:
//   node scripts/validate-api-payload.mjs <url-or-file> [--compare-local] [--version <id>]
//
// Examples:
//   node scripts/validate-api-payload.mjs http://127.0.0.1:4180/builder/game-data
//   node scripts/validate-api-payload.mjs https://api.example.com/builder/game-data --compare-local
//   node scripts/validate-api-payload.mjs docs/sample-api-payload.json
//
// Exit code 0 = payload is usable (warnings allowed). Exit code 1 = the app
// would reject or degrade on this payload, or the input could not be read.
//
// The structural acceptance check runs the app's real mapper
// (src/js/data-mapper.js), so a PASS here means the shipped app code accepts
// the payload — the validator cannot drift from the app.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mapApiPayloadToLyrianGlobals } from "../src/js/data-mapper.js";
import { DETAIL_DATA_COLLECTIONS, GAME_DATA_COLLECTIONS, loadBundledGameData } from "./lyrian-bundled-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const results = { pass: 0, warn: 0, fail: 0 };

function pass(message) {
  results.pass += 1;
  console.log(`  PASS  ${message}`);
}

function warn(message) {
  results.warn += 1;
  console.log(`  WARN  ${message}`);
}

function fail(message) {
  results.fail += 1;
  console.log(`  FAIL  ${message}`);
}

function parseArgs(argv) {
  const args = { source: "", compareLocal: false, version: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--compare-local") {
      args.compareLocal = true;
    } else if (value === "--version") {
      args.version = argv[index + 1] || "";
      index += 1;
    } else if (!args.source) {
      args.source = value;
    }
  }
  return args;
}

async function loadPayload(source) {
  if (/^https?:\/\//i.test(source)) {
    console.log(`Fetching payload from ${source} ...`);
    const response = await fetch(source, { headers: { accept: "application/json" } });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`The endpoint returned HTTP ${response.status}. Body starts: ${text.slice(0, 200)}`);
    }
    return JSON.parse(text);
  }
  const filePath = path.resolve(process.cwd(), source);
  console.log(`Reading payload from ${filePath} ...`);
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function findCollectionRoot(payload) {
  // Mirrors the candidate order in src/js/data-mapper.js.
  return payload?.data || payload?.lyrianData || payload?.gameData || payload;
}

function checkEntries(collectionName, entries) {
  const missingId = [];
  const missingName = [];
  const seen = new Map();
  const duplicates = new Set();
  entries.forEach((entry, index) => {
    const id = typeof entry?.id === "string" ? entry.id.trim() : "";
    const name = typeof entry?.name === "string" ? entry.name.trim() : "";
    if (!id) {
      missingId.push(index);
    } else if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.set(id, index);
    }
    if (!name) {
      missingName.push(index);
    }
  });
  if (missingId.length) {
    fail(`${collectionName}: ${missingId.length} entr${missingId.length === 1 ? "y" : "ies"} missing a stable string "id" (first at index ${missingId[0]}). Saves and lookups key on ids.`);
  } else {
    pass(`${collectionName}: every entry has a stable string id.`);
  }
  if (duplicates.size) {
    fail(`${collectionName}: duplicate ids found: ${[...duplicates].slice(0, 10).join(", ")}${duplicates.size > 10 ? ", ..." : ""}`);
  }
  if (missingName.length) {
    warn(`${collectionName}: ${missingName.length} entr${missingName.length === 1 ? "y" : "ies"} missing a "name" (first at index ${missingName[0]}).`);
  }
}

function compareIdSets(collectionName, localEntries, remoteEntries) {
  const localIds = new Set(localEntries.map((entry) => entry?.id).filter(Boolean));
  const remoteIds = new Set(remoteEntries.map((entry) => entry?.id).filter(Boolean));
  const missingRemotely = [...localIds].filter((id) => !remoteIds.has(id));
  const extraRemotely = [...remoteIds].filter((id) => !localIds.has(id));
  if (!missingRemotely.length && !extraRemotely.length) {
    pass(`${collectionName}: id set matches the bundled local data exactly (${localIds.size} ids).`);
    return;
  }
  if (missingRemotely.length) {
    warn(`${collectionName}: ${missingRemotely.length} local id(s) missing from the payload, e.g. ${missingRemotely.slice(0, 8).join(", ")}${missingRemotely.length > 8 ? ", ..." : ""}`);
  }
  if (extraRemotely.length) {
    warn(`${collectionName}: ${extraRemotely.length} id(s) in the payload that are not in local data, e.g. ${extraRemotely.slice(0, 8).join(", ")}${extraRemotely.length > 8 ? ", ..." : ""} (fine if the payload is a newer rules version).`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source) {
    console.log("Usage: node scripts/validate-api-payload.mjs <url-or-file> [--compare-local] [--version <id>]");
    console.log("Validates an official-API game-data payload against what the app's data provider accepts.");
    process.exitCode = 1;
    return;
  }

  let payload;
  try {
    payload = await loadPayload(args.source);
  } catch (error) {
    fail(`Could not load the payload: ${error.message}`);
    summarize();
    return;
  }
  pass("Payload is valid JSON.");

  // 1. Acceptance by the app's real mapper.
  let mapped = null;
  try {
    mapped = mapApiPayloadToLyrianGlobals(payload);
    pass(`The app's data mapper accepts this payload (game data version "${mapped.data.version}").`);
  } catch (error) {
    fail(`The app's data mapper rejects this payload: ${error.message}`);
  }

  // 2. Collection-level checks on the summary game data.
  const dataRoot = findCollectionRoot(payload);
  for (const collection of GAME_DATA_COLLECTIONS) {
    const entries = dataRoot?.[collection];
    if (!Array.isArray(entries)) {
      fail(`data.${collection} is missing or not an array. The app requires all of: ${GAME_DATA_COLLECTIONS.join(", ")}.`);
      continue;
    }
    if (!entries.length) {
      warn(`data.${collection} is an empty array.`);
      continue;
    }
    pass(`data.${collection}: ${entries.length} entries.`);
    checkEntries(`data.${collection}`, entries);
  }
  if (typeof dataRoot?.version === "string" && dataRoot.version.trim()) {
    pass(`data.version is "${dataRoot.version.trim()}".`);
  } else {
    warn(`data.version is missing; the app will label the data "api". Send the real rules version string.`);
  }

  // 3. Detail data. Optional, but without it detail-driven UI (rich class/race
  // text, demon lineage choices, class key abilities) degrades to summary data.
  const detail = payload?.detailData || payload?.lyrianDetailData || payload?.details;
  if (!detail || typeof detail !== "object") {
    warn("No detailData found. The app falls back to summary data for detail views: rich descriptions, demon lineageChoices, and class keyAbility/abilities detail will be degraded.");
  } else {
    const missingDetail = DETAIL_DATA_COLLECTIONS.filter((key) => !Array.isArray(detail[key]));
    if (missingDetail.length) {
      fail(`detailData is present but missing array collection(s): ${missingDetail.join(", ")}. The app will discard it and fall back to summary data.`);
    } else {
      pass(`detailData provides ${DETAIL_DATA_COLLECTIONS.map((key) => `${key} (${detail[key].length})`).join(", ")}.`);
      const detailRace = detail.races.find((entry) => entry && typeof entry === "object");
      if (detailRace && !("descriptionHtml" in detailRace) && !("descriptionText" in detailRace)) {
        warn("detailData.races entries have no descriptionHtml/descriptionText; detail views may look empty.");
      }
    }
  }

  // 4. Version manifest. Optional: the app synthesizes a single-version
  // manifest when absent.
  const manifest = payload?.versionManifest || payload?.manifest;
  if (!manifest || !Array.isArray(manifest.versions)) {
    warn("No versionManifest with a versions array; the app will synthesize a single-version manifest from data.version.");
  } else {
    pass(`versionManifest lists ${manifest.versions.length} version(s), default "${manifest.defaultVersion || "(unset)"}".`);
    const withLocalPaths = manifest.versions.filter((entry) => entry?.dataPath || entry?.detailPath);
    if (withLocalPaths.length) {
      warn(`versionManifest contains ${withLocalPaths.length} version(s) with local dataPath/detailPath entries. In API mode the in-app version switcher would load those LOCAL files over the API data. An API payload should list only versions the API itself can serve.`);
    }
  }

  // 5. Optional comparison against the bundled local data.
  if (args.compareLocal && mapped) {
    console.log("\nComparing against bundled local data ...");
    try {
      const local = await loadBundledGameData(PROJECT_ROOT, args.version);
      console.log(`Local reference: rules version ${local.versionId}.`);
      for (const collection of GAME_DATA_COLLECTIONS) {
        const localEntries = local.data[collection] || [];
        const remoteEntries = Array.isArray(dataRoot?.[collection]) ? dataRoot[collection] : [];
        if (localEntries.length !== remoteEntries.length) {
          warn(`data.${collection}: payload has ${remoteEntries.length} entries, bundled local ${local.versionId} has ${localEntries.length}.`);
        } else {
          pass(`data.${collection}: entry count matches bundled local data (${localEntries.length}).`);
        }
        compareIdSets(`data.${collection}`, localEntries, remoteEntries);
      }
    } catch (error) {
      warn(`Local comparison skipped: ${error.message}`);
    }
  }

  summarize();
}

function summarize() {
  console.log(`\n${results.fail ? "RESULT: FAIL" : "RESULT: PASS"} - ${results.pass} passed, ${results.warn} warnings, ${results.fail} failures.`);
  if (results.fail) {
    console.log("The app would reject or degrade on this payload. Fix the failures above, then re-run this validator.");
    process.exitCode = 1;
  } else if (results.warn) {
    console.log("Usable payload. Review the warnings: each one is a place the app will degrade or improvise.");
  }
}

main().catch((error) => {
  console.error("Validator crashed:", error);
  process.exitCode = 1;
});
