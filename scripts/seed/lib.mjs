/**
 * Shared helpers used by every seed module.
 *
 * Keep this file dependency-free except for the Sanity client and Node
 * built-ins so each section file can import freely.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projectRoot = join(__dirname, "..", "..");

export function getClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !token) {
    console.error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in env.",
    );
    process.exit(1);
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

// ────────────────────────────────────────────────────────────
// PortableText helpers
// ────────────────────────────────────────────────────────────

const randKey = () => Math.random().toString(36).slice(2, 10);

export const ptBlock = (text) => ({
  _type: "block",
  _key: randKey(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: randKey(), text, marks: [] }],
});

export const ptH3 = (text) => ({ ...ptBlock(text), style: "h3" });

// ────────────────────────────────────────────────────────────
// Image asset upload + reference helpers
// ────────────────────────────────────────────────────────────

/**
 * Build a Sanity image-reference object from an asset id, or return
 * undefined when no asset was provided. Used by every doc that has an
 * optional image field.
 */
export function imageRef(assetId) {
  return assetId
    ? {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      }
    : undefined;
}

/**
 * Upload an image asset to Sanity. Sanity dedupes by content hash, so
 * re-running is cheap. Logs and returns null on failure so a missing
 * file doesn't crash the whole seed.
 */
export async function uploadImageAsset(client, relativePath, filename) {
  try {
    const buffer = readFileSync(join(projectRoot, relativePath));
    const asset = await client.assets.upload("image", buffer, { filename });
    return asset._id;
  } catch (err) {
    console.warn(`! Could not upload ${relativePath}: ${err.message}`);
    return null;
  }
}

/** Upload every FMELi photo and return a name->assetId map. */
export async function uploadFmeliPhotos(client) {
  const FMELI_PHOTOS = [
    "set-man.jpg",
    "word-preaching.jpg",
    "worship-hands-up.jpg",
    "pray-woman.jpg",
    "prayers-overlay.jpg",
    "fellowship-women.jpg",
    "brothers-embrace.jpg",
    "joy-laughter.jpg",
    "overcomer-youth.jpg",
  ];
  const assetByName = {};
  for (const file of FMELI_PHOTOS) {
    const id = await uploadImageAsset(client, `public/images/fmeli/${file}`, file);
    if (id) assetByName[file] = id;
  }
  console.log(`  ✓ uploaded ${Object.keys(assetByName).length} fmeli photos`);
  return assetByName;
}

// ────────────────────────────────────────────────────────────
// Static rows used by multiple section files
// ────────────────────────────────────────────────────────────

export const ASSEMBLY_ROWS = [
  { slug: "lagos",    city: "Lagos",    state: "Lagos", tagline: "The city assembly", order: 1 },
  { slug: "abeokuta", city: "Abeokuta", state: "Ogun",  tagline: "The rock",          order: 2 },
  { slug: "ibadan",   city: "Ibadan",   state: "Oyo",   tagline: "Coming soon",       order: 3 },
  { slug: "akure",    city: "Akure",    state: "Ondo",  tagline: "The ancient city",  order: 4 },
  { slug: "osogbo",   city: "Osogbo",   state: "Osun",  tagline: "The grove",         order: 5 },
  { slug: "ife",      city: "Ife",      state: "Osun",  tagline: "The source",        order: 6 },
  { slug: "ondo",     city: "Ondo",     state: "Ondo",  tagline: "The kingdom",       order: 7 },
  { slug: "benin",    city: "Benin",    state: "Edo",   tagline: "The heritage",      order: 8 },
  { slug: "ado",      city: "Ado",      state: "Ekiti", tagline: "The hills",         order: 9 },
];
