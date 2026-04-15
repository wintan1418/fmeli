#!/usr/bin/env node
/**
 * pCloud → Sanity message importer.
 *
 * Walks the FMELi pCloud "Public Folder", parses filenames into
 * structured message metadata, maps each pCloud folder to a Sanity
 * messageCategory, and creates `message` documents idempotently.
 *
 * Run:
 *   # Dry run — print what would be created without touching Sanity
 *   node --env-file=.env.local scripts/import-pcloud.mjs --dry-run
 *
 *   # Real import (with the default 2024+ year filter)
 *   node --env-file=.env.local scripts/import-pcloud.mjs
 *
 *   # Override the year cutoff (for backfilling older content later)
 *   node --env-file=.env.local scripts/import-pcloud.mjs --since=2020
 *
 *   # Limit to one specific category for testing
 *   node --env-file=.env.local scripts/import-pcloud.mjs --only="Cross Over Service"
 *
 * Environment variables required:
 *   PCLOUD_ACCESS_TOKEN          - obtained via the /login digest flow
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to production)
 *   NEXT_PUBLIC_SANITY_API_VERSION
 *   SANITY_API_WRITE_TOKEN       - same one the dashboard uses
 *
 * Idempotency
 * -----------
 * Each message gets a deterministic _id derived from the SHA-1 hash of
 * its pCloud fileid, so re-running the script only inserts files that
 * weren't there last time. Existing docs are left alone (we use
 * createIfNotExists, not createOrReplace) so manual edits in Studio
 * survive a re-import. Pass --replace to override and re-import.
 */

import crypto from "node:crypto";
import { createClient } from "@sanity/client";

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────

const PCLOUD_API = "https://api.pcloud.com";
const PUBLIC_FOLDER_NAME = "Public Folder";
const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".aac", ".ogg", ".flac"]);

/**
 * Map pCloud folder names → category slug in Sanity.
 *
 * Folders not in this map are skipped with a warning. To add a new
 * mapping, create the matching messageCategory in Studio (or in
 * scripts/seed/messages.mjs), then add the row here.
 */
const PCLOUD_FOLDER_TO_CATEGORY = {
  // Sunday
  "The School of Life": "school-of-life",
  "Morning Teaching": "morning-teaching",
  "Sunday-Service": "sunday-message",
  "Sunday Service": "sunday-message",

  // Wednesday
  "STS Review": "wednesday-teaching",
  "Special-Mid-Week": "wednesday-teaching",
  "Special-Mid-Wee": "wednesday-teaching",

  // Special Meetings — explicit (church told us about these)
  "Life-Campaign": "life-campaign",
  "Life Campaign Prayer Meeting": "life-campaign",
  "Singles Rendezvous": "singles-rendezvous",
  "Real Men": "real-men-conference",
  "Real-Men-Summit": "real-men-conference",
  "Feminine Expression": "feminine-meeting",
  "Zoe Conference": "zoe-conference",
  "Christmas Service": "christmas-service",
  "Youth Convergence": "youth-convergence",
  "Couple's Garden": "couples-garden",
  "Cross Over Service": "cross-over-service",
  "Vigil": "vigil",
  "Corn-Feast": "corn-feast",

  // Special Meetings — best-guess folders we'll grab and refine in Studio
  "April Special Daily Teaching": "special-meetings",
  "Special Daily Teaching": "special-meetings",
  "EDENIC LIFE - Rev Busuyi Olabode": "special-meetings",
  "Pastor Dickson Discipleship series": "special-meetings",
  "Family Meeting": "special-meetings",
  "Marriageable Singles": "special-meetings",
  "Marriageable Single": "special-meetings",
  "Purposeful Singles": "special-meetings",
  "Purposeful Singleness": "special-meetings",
  "Singles-Summit": "special-meetings",
  "LFP": "special-meetings",
  "SOM": "special-meetings",
  "Outreaches-Special Meetings": "special-meetings",
  "Questions-and-Answers": "special-meetings",
  "Valentine Messages": "special-meetings",
  "Valentine Message -2016": "special-meetings",
  "Yoruba Messages": "special-meetings",
  "The-Vision-&-Programs": "special-meetings",
  "The-Vision-&-Prophecy": "special-meetings",
  "Zoe Conference Prayer Meeting": "zoe-conference",
  "Special-Mid-Week-Teaching": "wednesday-teaching",
  "The School of Life Edited Sep. 2011": "school-of-life",

  // BECON — church said skip
  // "BECON": null,
};

const SKIP_FOLDER_NAMES = new Set([
  "BECON",
  "Documents",
  "Dump Files",
  "Gallery",
  "to be sorted",
  "Church Worship", // worship sessions, different schema
  "Radio Program",  // radio shows, not messages
]);

// ────────────────────────────────────────────────────────────
// CLI args
// ────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = { dryRun: false, since: 2024, only: null, replace: false };
  for (const a of argv) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--replace") out.replace = true;
    else if (a.startsWith("--since=")) out.since = parseInt(a.split("=")[1], 10);
    else if (a.startsWith("--only=")) out.only = a.split("=")[1];
  }
  return out;
}

// ────────────────────────────────────────────────────────────
// pCloud client (minimal — just the calls we need)
// ────────────────────────────────────────────────────────────

function pcloudCall(path, params = {}) {
  const token = process.env.PCLOUD_ACCESS_TOKEN;
  if (!token) {
    throw new Error("PCLOUD_ACCESS_TOKEN is not set");
  }
  const qs = new URLSearchParams({ ...params, auth: token }).toString();
  return fetch(`${PCLOUD_API}${path}?${qs}`).then((r) => r.json());
}

async function listFolder(folderid) {
  const resp = await pcloudCall("/listfolder", { folderid });
  if (resp.result !== 0) {
    throw new Error(`pCloud listfolder ${folderid} failed: ${resp.error ?? resp.result}`);
  }
  return resp.metadata?.contents ?? [];
}

async function getPublicLink(fileid) {
  // Returns a long-lived public download URL for a file. We use this
  // as the message's `audioUrl` field — the same shape the existing
  // pCloud-link sermon cards already render.
  const resp = await pcloudCall("/getfilepublink", { fileid });
  if (resp.result !== 0) return null;
  return resp.link ?? null;
}

// ────────────────────────────────────────────────────────────
// Filename parsing
// ────────────────────────────────────────────────────────────

/**
 * Parse a pCloud filename into title / preacher / date / extension.
 *
 * Real-world examples seen in the FMELi library:
 *   "Crossover - Receiving the True Light - Rev. Busuyi Olabode.2023_12_31.mp3"
 *   "Morning Teaching - The Spirit of Wisdom - Pastor X.2024_03_17.mp3"
 *   "11. Yeshua.mp3"   (lively music — handled separately, not here)
 *
 * Convention:
 *   <Series/Category> - <Title> - <Preacher>.<YYYY_MM_DD>.<ext>
 *
 * The parser is forgiving: a missing preacher or missing date both
 * produce a partial result rather than a hard failure. The fileid is
 * always available as a fallback identifier.
 */
function parseFilename(name) {
  const out = { title: null, preacher: null, date: null, raw: name };

  // Strip extension
  const dot = name.lastIndexOf(".");
  if (dot < 0) return out;
  const ext = name.slice(dot).toLowerCase();
  out.ext = ext;
  let stem = name.slice(0, dot);

  // Date: trailing ".YYYY_MM_DD" before the extension. Some files use
  // "_YYYY_MM_DD" or " YYYY-MM-DD" — handle the common shapes.
  const dateMatch = stem.match(/[._\-\s](\d{4})[._\-](\d{1,2})[._\-](\d{1,2})$/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    out.date = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    stem = stem.slice(0, dateMatch.index).trim();
  }

  // Split on " - " (the church's separator). Last part is preacher,
  // first part is series, middle is title.
  const parts = stem.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    out.title = stem || null;
  } else if (parts.length === 1) {
    out.title = parts[0];
  } else if (parts.length === 2) {
    out.title = parts[0];
    out.preacher = parts[1];
  } else {
    // 3+ parts: drop the first (series, redundant with folder name),
    // join the middle as title, last is preacher
    out.preacher = parts[parts.length - 1];
    out.title = parts.slice(1, -1).join(" - ");
  }

  // Strip common preacher prefixes for cleaner display
  if (out.preacher) {
    out.preacher = out.preacher
      .replace(/^by\s+/i, "")
      .replace(/^pst\.?\s+/i, "Pastor ")
      .trim();
  }

  return out;
}

/**
 * Extract a year from a folder name like "2024", "LC-22", "2024-2025".
 * Used to filter sub-folders when applying --since.
 */
function yearFromFolderName(name) {
  const m = name.match(/(?:^|\D)(20\d{2})/);
  return m ? parseInt(m[1], 10) : null;
}

// ────────────────────────────────────────────────────────────
// Walker
// ────────────────────────────────────────────────────────────

/**
 * Recursively walk a folder, collecting every audio file plus the
 * trail of folder names that led to it. The trail lets us figure out
 * the year (for --since filtering) and the category (top-level folder
 * name).
 */
async function walkAudio(folderid, trail = []) {
  const entries = await listFolder(folderid);
  const files = [];
  for (const entry of entries) {
    if (entry.isfolder) {
      // Year filter: if any folder in the trail is a year folder
      // older than --since, skip it. We only check the IMMEDIATE
      // folder name (the deepest year-shaped folder) — categories
      // organize by year, not by month inside year, so this is enough.
      const yr = yearFromFolderName(entry.name);
      if (yr !== null && yr < args.since) continue;

      const subFiles = await walkAudio(entry.folderid, [...trail, entry.name]);
      files.push(...subFiles);
    } else {
      const ext = (entry.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
      if (!AUDIO_EXTENSIONS.has(ext)) continue;
      files.push({
        fileid: entry.fileid,
        name: entry.name,
        size: entry.size,
        contenttype: entry.contenttype,
        trail,
      });
    }
  }
  return files;
}

// ────────────────────────────────────────────────────────────
// Sanity write
// ────────────────────────────────────────────────────────────

function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required",
    );
  }
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false });
}

function deterministicId(fileid) {
  // Stable id derived from the pCloud fileid so re-runs are idempotent.
  return (
    "message.pcloud-" +
    crypto.createHash("sha1").update(String(fileid)).digest("hex").slice(0, 16)
  );
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `pCloud importer · dry-run=${args.dryRun} since=${args.since} only=${args.only ?? "(all)"}`,
  );

  // 1. Find the Public Folder
  console.log("→ locating Public Folder…");
  const root = await listFolder("0");
  const publicFolder = root.find(
    (e) => e.isfolder && e.name === PUBLIC_FOLDER_NAME,
  );
  if (!publicFolder) {
    throw new Error(`Could not find "${PUBLIC_FOLDER_NAME}" at the pCloud root`);
  }

  // 2. Walk each top-level category
  const categoryFolders = await listFolder(publicFolder.folderid);
  const knownCats = Object.keys(PCLOUD_FOLDER_TO_CATEGORY);

  let totalFiles = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalUnknownCat = 0;

  for (const cat of categoryFolders) {
    if (!cat.isfolder) continue;
    if (SKIP_FOLDER_NAMES.has(cat.name)) {
      console.log(`  skip "${cat.name}" (in skip list)`);
      continue;
    }
    if (args.only && cat.name !== args.only) continue;

    const categorySlug = PCLOUD_FOLDER_TO_CATEGORY[cat.name];
    if (!categorySlug) {
      console.warn(
        `  ⚠ "${cat.name}" — no mapping in PCLOUD_FOLDER_TO_CATEGORY; skipping. ` +
          `Add it to the map to import.`,
      );
      totalUnknownCat += 1;
      continue;
    }

    console.log(`\n→ ${cat.name}  (→ ${categorySlug})`);
    const files = await walkAudio(cat.folderid, [cat.name]);
    console.log(`  found ${files.length} audio file(s) since ${args.since}`);
    totalFiles += files.length;

    for (const file of files) {
      const parsed = parseFilename(file.name);
      const docId = deterministicId(file.fileid);

      // Build slug from the parsed title; fall back to the bare
      // filename if title parsing failed entirely.
      const titleForSlug = parsed.title || file.name;
      const slug =
        slugify(titleForSlug) +
        // Append a 4-char fileid suffix so two messages with the same
        // title don't collide.
        "-" +
        crypto.createHash("sha1").update(String(file.fileid)).digest("hex").slice(0, 4);

      const summary =
        `[${cat.name}] ${parsed.title ?? "(?)"} — ` +
        `${parsed.preacher ?? "?"}, ${parsed.date ?? "?"}`;

      if (args.dryRun) {
        console.log(`    DRY ${summary}`);
        totalSkipped += 1;
        continue;
      }

      try {
        const client = getSanityClient();
        const audioUrl = await getPublicLink(file.fileid);

        const doc = {
          _id: docId,
          _type: "message",
          title: parsed.title ?? file.name.replace(/\.[^.]+$/, ""),
          slug: { _type: "slug", current: slug },
          date: parsed.date ?? null,
          excerpt: null,
          audioUrl,
          category: {
            _type: "reference",
            _ref: `messageCategory.${categorySlug}`,
          },
          // Preacher kept as plain text in the title block — we don't
          // try to match against the pastor docs because pCloud names
          // ("Rev. Busuyi Olabode") don't reliably match Sanity slugs.
          // The office can attach a real preacher ref in Studio later.
          tags: parsed.preacher ? [parsed.preacher] : undefined,
        };

        const op = args.replace
          ? client.createOrReplace.bind(client)
          : client.createIfNotExists.bind(client);
        await op(doc);
        console.log(`    ✓ ${summary}`);
        totalCreated += 1;
      } catch (err) {
        console.error(`    ✗ ${summary}`);
        console.error(`      ${err.message ?? err}`);
      }
    }
  }

  console.log("\n────────────────────────────────");
  console.log(`Categories with no mapping: ${totalUnknownCat}`);
  console.log(`Files matched (since ${args.since}): ${totalFiles}`);
  if (args.dryRun) {
    console.log(`Would have created/updated: ${totalSkipped}`);
  } else {
    console.log(`Created or kept (idempotent): ${totalCreated}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
