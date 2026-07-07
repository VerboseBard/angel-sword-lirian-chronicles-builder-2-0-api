// Regenerates docs/sample-api-payload.json: a truncated, human-readable
// example of the payload the app's API provider expects from
// GET {apiBaseUrl}/builder/game-data.
//
// Each collection is cut to the first few entries so the file stays readable
// as a contract example. For the FULL payload, run `npm start` and open
// http://127.0.0.1:4180/builder/game-data (the local mock endpoint).
//
// Usage: node scripts/generate-sample-api-payload.mjs [--version <id>] [--entries <n>]

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApiPayload, DETAIL_DATA_COLLECTIONS, GAME_DATA_COLLECTIONS } from "./lyrian-bundled-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "docs", "sample-api-payload.json");

function parseArgs(argv) {
  const args = { version: "", entries: 3 };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--version") {
      args.version = argv[index + 1] || "";
      index += 1;
    } else if (argv[index] === "--entries") {
      args.entries = Math.max(1, Number(argv[index + 1]) || 3);
      index += 1;
    }
  }
  return args;
}

function truncateCollections(record, collections, limit) {
  const truncated = { ...record };
  for (const key of collections) {
    if (Array.isArray(truncated[key])) {
      truncated[key] = truncated[key].slice(0, limit);
    }
  }
  return truncated;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const payload = await buildApiPayload(PROJECT_ROOT, args.version);
  const fullCounts = Object.fromEntries(
    GAME_DATA_COLLECTIONS.map((key) => [key, (payload.data[key] || []).length])
  );

  const sample = {
    _sample: {
      note: `TRUNCATED EXAMPLE: each collection is cut to the first ${args.entries} entries so this file stays readable. The app requires the full collections. For a full reference payload, run "npm start" and open /builder/game-data on the local server.`,
      generatedBy: "scripts/generate-sample-api-payload.mjs",
      fullEntryCounts: fullCounts,
      validateWith: "node scripts/validate-api-payload.mjs <your-endpoint-url>"
    },
    ...payload,
    source: "sample-api-payload",
    data: truncateCollections(payload.data, GAME_DATA_COLLECTIONS, args.entries),
    detailData: truncateCollections(payload.detailData, DETAIL_DATA_COLLECTIONS, args.entries)
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(PROJECT_ROOT, OUTPUT_PATH)} (rules version ${payload.data.version}, ${args.entries} entries per collection).`);
  console.log(`Full entry counts in the bundled data: ${JSON.stringify(fullCounts)}`);
}

main().catch((error) => {
  console.error("Sample payload generation failed:", error);
  process.exitCode = 1;
});
