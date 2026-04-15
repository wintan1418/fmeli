#!/usr/bin/env node
/**
 * Seed the FMELi Sanity dataset with baseline content.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotent — every doc uses createOrReplace so re-runs are safe.
 * siteSettings uses createIfNotExists so admin tweaks aren't blown
 * away on re-seed.
 *
 * The actual document builders live next door under scripts/seed/:
 *
 *   lib.mjs            - shared client + PortableText + image helpers
 *   pastors.mjs        - set-man + 9 assembly lead pastors (login-ready)
 *   assemblies.mjs     - 9 assembly docs
 *   meetings.mjs       - 6 meeting docs (weekly + special)
 *   messages.mjs       - message categories + series + 8 sample messages
 *   announcements.mjs  - 5 homepage ticker announcements
 *   pages.mjs          - About, Beliefs, Contact, Life Campaign
 *   site-settings.mjs  - the siteSettings singleton
 *
 * To tweak one section's content, edit only its file. To add a new
 * section type, write a new module and call its builder from main().
 */

import { getClient, uploadFmeliPhotos } from "./seed/lib.mjs";
import { buildPastorDocs } from "./seed/pastors.mjs";
import { buildAssemblyDocs } from "./seed/assemblies.mjs";
import { buildMeetingDocs } from "./seed/meetings.mjs";
import {
  buildMessageCategoryDocs,
  buildMessageSeriesDocs,
  buildMessageDocs,
} from "./seed/messages.mjs";
import { buildAnnouncementDocs } from "./seed/announcements.mjs";
import { buildPageDocs } from "./seed/pages.mjs";
import { buildSiteSettingsDoc } from "./seed/site-settings.mjs";

async function main() {
  const client = getClient();
  console.log(
    `Seeding dataset '${client.config().dataset}' on project ${client.config().projectId}…`,
  );

  // 0. One-time migration: blow away any leftover docs from the old
  //    sermon / sermonSeries types. The schema was renamed to
  //    message / messageSeries; without this cleanup Studio would
  //    keep showing orphan unknown-type docs forever.
  const orphans = await client.fetch(
    `*[_type in ["sermon", "sermonSeries"]]._id`,
  );
  if (orphans.length > 0) {
    console.log(`  cleaning up ${orphans.length} legacy sermon/sermonSeries docs…`);
    await client.delete({ query: `*[_type in ["sermon", "sermonSeries"]]` });
  }

  // 1. Upload shared photo assets first — every doc references them
  //    by content-hash id, so this has to happen before any builder runs.
  const assetByName = await uploadFmeliPhotos(client);

  // 2. Build every section's docs. These are pure functions of
  //    assetByName — no Sanity calls happen here.
  const { setMan, assemblyLeads } = buildPastorDocs(assetByName);
  const assemblies = buildAssemblyDocs();
  const meetings = buildMeetingDocs();
  const messageCategories = buildMessageCategoryDocs();
  const messageSeries = buildMessageSeriesDocs(assetByName);
  const messages = buildMessageDocs(assetByName);
  const announcements = buildAnnouncementDocs();
  const pages = buildPageDocs(assetByName);
  const siteSettings = buildSiteSettingsDoc();

  // 3. Commit everything in a single transaction so a partial failure
  //    rolls back cleanly — you never end up with half a seed in the dataset.
  let tx = client.transaction();
  tx = tx.createOrReplace(setMan);
  for (const doc of assemblyLeads) tx = tx.createOrReplace(doc);
  for (const doc of assemblies) tx = tx.createOrReplace(doc);
  for (const doc of meetings) tx = tx.createOrReplace(doc);
  for (const doc of messageCategories) tx = tx.createOrReplace(doc);
  for (const doc of messageSeries) tx = tx.createOrReplace(doc);
  for (const doc of messages) tx = tx.createOrReplace(doc);
  for (const doc of announcements) tx = tx.createOrReplace(doc);
  for (const doc of pages) tx = tx.createOrReplace(doc);
  tx = tx.createIfNotExists(siteSettings);

  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} operations`);
  console.log(
    [
      `  pastors: ${1 + assemblyLeads.length}`,
      `assemblies: ${assemblies.length}`,
      `meetings: ${meetings.length}`,
      `categories: ${messageCategories.length}`,
      `series: ${messageSeries.length}`,
      `messages: ${messages.length}`,
      `announcements: ${announcements.length}`,
      `pages: ${pages.length}`,
    ].join(" · "),
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
