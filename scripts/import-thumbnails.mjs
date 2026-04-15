#!/usr/bin/env node
/**
 * Thumbnail matcher: walk the `New WORK/upload` folder in pCloud,
 * fuzzy-match each image's filename to a Sanity message title,
 * upload the matched image as a Sanity asset, and patch the message
 * with thumbnail = the new asset reference.
 *
 * Run:
 *   # Dry run — shows matches without touching Sanity
 *   node --env-file=.env.local scripts/import-thumbnails.mjs --dry-run
 *
 *   # Real run
 *   node --env-file=.env.local scripts/import-thumbnails.mjs
 *
 * How matching works
 * ------------------
 * Both sides (image filename, message title) are normalised by:
 *   1. Removing the file extension (images only)
 *   2. Lowercasing
 *   3. Replacing any non-letter / non-digit char with a single space
 *   4. Collapsing multiple spaces
 *   5. Trimming
 *
 * Then we compute a normalised key for every message and every image,
 * and match exactly. No Levenshtein, no fancy fuzz — the church's
 * filenames are already very close to the message titles, so an
 * exact normalised match is enough to catch most cases. Anything
 * that doesn't match prints a warning and is skipped.
 *
 * Idempotency
 * -----------
 * - Skips messages that already have a thumbnail (so re-runs only fill
 *   gaps; pass --replace to overwrite existing thumbnails).
 * - Sanity dedupes asset uploads by content hash, so the same image
 *   uploaded twice only stores once.
 */

import { createClient } from "@sanity/client";
import { Buffer } from "node:buffer";

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────

const PCLOUD_API = "https://api.pcloud.com";
// "My Documents → Church Office → Church Office → New WORK → upload"
// — the folder full of message-title-named JPGs.
const UPLOAD_FOLDER_ID = 17970874168;

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = { dryRun: false, replace: false };
  for (const a of argv) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--replace") out.replace = true;
  }
  return out;
}

// ────────────────────────────────────────────────────────────
// pCloud helpers
// ────────────────────────────────────────────────────────────

function pcloudCall(path, params = {}) {
  const token = process.env.PCLOUD_ACCESS_TOKEN;
  if (!token) throw new Error("PCLOUD_ACCESS_TOKEN is not set");
  const qs = new URLSearchParams({ ...params, auth: token }).toString();
  return fetch(`${PCLOUD_API}${path}?${qs}`).then((r) => r.json());
}

async function listFolder(folderid) {
  const resp = await pcloudCall("/listfolder", { folderid });
  if (resp.result !== 0) {
    throw new Error(`pCloud listfolder ${folderid} failed: ${resp.error}`);
  }
  return resp.metadata?.contents ?? [];
}

async function downloadFile(fileid) {
  // Get a temporary direct URL from /getfilelink, then fetch the bytes.
  // The URL expires in 24h but we use it within seconds, so that's fine.
  const link = await pcloudCall("/getfilelink", { fileid });
  if (link.result !== 0) {
    throw new Error(`getfilelink ${fileid} failed: ${link.error}`);
  }
  const host = link.hosts?.[0];
  if (!host) throw new Error(`no host returned for fileid ${fileid}`);
  const url = `https://${host}${link.path}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download failed: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

// ────────────────────────────────────────────────────────────
// Normalisation + matching
// ────────────────────────────────────────────────────────────

function normalise(input) {
  if (!input) return "";
  // Strip extension if present
  const dotIdx = input.lastIndexOf(".");
  const stem = dotIdx > 0 && dotIdx > input.length - 6 ? input.slice(0, dotIdx) : input;
  return stem
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ────────────────────────────────────────────────────────────
// Sanity helpers
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

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `Thumbnail importer · dry-run=${args.dryRun} replace=${args.replace}`,
  );

  // 1. Pull the image filenames from pCloud
  console.log("→ listing pCloud upload folder…");
  const images = (await listFolder(UPLOAD_FOLDER_ID)).filter((c) => {
    if (c.isfolder) return false;
    const ext = (c.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    return IMAGE_EXTS.has(ext);
  });
  console.log(`  found ${images.length} image files`);

  // 2. Build the lookup table: normalised filename → image metadata
  const imagesByKey = new Map();
  for (const img of images) {
    const key = normalise(img.name);
    if (!key) continue;
    // If two images normalise to the same key, the first one wins.
    // Happens with "2.jpg" / "ABK.jpg" / etc — non-message filenames
    // that we won't match against anyway.
    if (!imagesByKey.has(key)) {
      imagesByKey.set(key, img);
    }
  }
  console.log(`  ${imagesByKey.size} unique normalised keys`);

  // 3. Fetch all message titles from Sanity
  console.log("→ pulling messages from Sanity…");
  const client = getSanityClient();
  const messages = await client.fetch(`
    *[_type == "message"]{
      _id,
      title,
      "hasThumbnail": defined(thumbnail)
    }
  `);
  console.log(`  ${messages.length} messages total`);

  const candidates = args.replace
    ? messages
    : messages.filter((m) => !m.hasThumbnail);
  console.log(
    `  ${candidates.length} messages need thumbnails ` +
      `(${messages.length - candidates.length} already have one)`,
  );
  console.log();

  // 4. Match
  //
  // Two-pass strategy:
  //   Pass A — exact normalised key. Best signal, no ambiguity.
  //   Pass B — word-set containment. Tokenise both sides, drop the
  //            stop-words ("the", "of", "in", "and", "a", "to") and
  //            require every remaining token from the shorter side
  //            to appear in the longer side. Both sides must have at
  //            least 3 content tokens — otherwise "marriage" or
  //            "1 sts" would shotgun-match anything containing those
  //            words. The longest content match wins, so a message
  //            whose title fully matches an image key beats one that
  //            only partially overlaps.
  const STOP_WORDS = new Set([
    "the", "of", "in", "and", "a", "to", "is", "for", "on", "by", "at",
  ]);
  const tokensFor = (k) =>
    k.split(" ").filter((t) => t.length > 0 && !STOP_WORDS.has(t));

  // Pre-compute content tokens for every image key, and only keep
  // images with ≥3 content tokens — short keys can't safely match.
  const imageEntries = [];
  for (const [imgKey, img] of imagesByKey) {
    const toks = tokensFor(imgKey);
    if (toks.length >= 3) imageEntries.push({ imgKey, img, tokens: toks });
  }

  let matched = 0;
  let unmatched = 0;
  let uploaded = 0;
  let failed = 0;
  const matches = [];

  for (const msg of candidates) {
    const key = normalise(msg.title);
    let img = imagesByKey.get(key);
    if (!img) {
      const msgTokens = tokensFor(key);
      if (msgTokens.length >= 3) {
        const msgSet = new Set(msgTokens);
        let bestScore = 0;
        for (const entry of imageEntries) {
          // Whichever side is shorter must be a subset of the other.
          const [shortToks, longSet] =
            entry.tokens.length <= msgTokens.length
              ? [entry.tokens, msgSet]
              : [msgTokens, new Set(entry.tokens)];
          if (shortToks.every((t) => longSet.has(t))) {
            // Score = size of the smaller side. Longer wins ties.
            const score = shortToks.length;
            if (score > bestScore) {
              bestScore = score;
              img = entry.img;
            }
          }
        }
      }
    }
    if (img) {
      matched += 1;
      matches.push({ msg, img });
    } else {
      unmatched += 1;
    }
  }

  console.log(`✓ matched:   ${matched} / ${candidates.length}`);
  console.log(`✗ unmatched: ${unmatched}`);
  console.log();

  if (args.dryRun) {
    console.log("Dry run — sample of first 20 matches:");
    for (const { msg, img } of matches.slice(0, 20)) {
      console.log(`  "${msg.title}"`);
      console.log(`    ↪ ${img.name}`);
    }
    console.log();
    console.log("Dry run — sample of first 10 unmatched message titles:");
    let n = 0;
    for (const msg of candidates) {
      if (n >= 10) break;
      const key = normalise(msg.title);
      if (imagesByKey.has(key)) continue;
      console.log(`  ?  ${msg.title}`);
      n += 1;
    }
    return;
  }

  // 5. Real run: download each matched image, upload to Sanity,
  //    patch the message. Print one line per message.
  console.log("→ uploading matched thumbnails…");
  for (const { msg, img } of matches) {
    process.stdout.write(`  ${msg.title.slice(0, 60).padEnd(60)} … `);
    try {
      const bytes = await downloadFile(img.fileid);
      const asset = await client.assets.upload("image", bytes, {
        filename: img.name,
        contentType: "image/jpeg",
      });
      await client
        .patch(msg._id)
        .set({
          thumbnail: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
          },
        })
        .commit();
      console.log("✓");
      uploaded += 1;
    } catch (err) {
      console.log(`✗ ${err.message ?? err}`);
      failed += 1;
    }
  }

  console.log();
  console.log("──────────────────────────────");
  console.log(`Uploaded:  ${uploaded}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Skipped:   ${candidates.length - matched} (no matching image)`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Thumbnail import failed:", err);
  process.exit(1);
});
