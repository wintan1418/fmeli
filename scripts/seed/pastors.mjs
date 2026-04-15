import { ptBlock, imageRef, ASSEMBLY_ROWS } from "./lib.mjs";

/**
 * Build pastor documents — the senior set man + one lead pastor per
 * assembly, with email/dashboardRole set so they can sign in to the
 * pastor dashboard immediately after seeding.
 */
export function buildPastorDocs(assetByName) {
  const pastorAssetId = assetByName["set-man.jpg"];

  const setMan = {
    _id: "pastor.set-man",
    _type: "pastor",
    name: "Set Man of the Ministry",
    role: "Senior Pastor · Full Manifestation of Eternal Life",
    department: "pastoral",
    email: "setman@fmeli.org",
    dashboardRole: "super_admin",
    image: imageRef(pastorAssetId),
    bio: [
      ptBlock(
        "The set man of Full Manifestation of Eternal Life has carried the burden of unveiling the mysteries of the kingdom for decades. Rename this document in Studio to use the real name.",
      ),
      ptBlock(
        "Through the weekly Teaching Series, the Life Campaign, and annual convocations, his ministry has shaped the rhythm of the FMELi family across nine assemblies.",
      ),
    ],
    order: 1,
  };

  const assemblyLeads = ASSEMBLY_ROWS.map((a, i) => ({
    _id: `pastor.${a.slug}-lead`,
    _type: "pastor",
    name: `${a.city} Lead Pastor`,
    role: `Lead Pastor · FMELi ${a.city}`,
    department: "pastoral",
    email: `${a.slug}.lead@fmeli.org`,
    dashboardRole: "assembly_lead",
    assembly: { _type: "reference", _ref: `assembly.${a.slug}` },
    image: imageRef(pastorAssetId),
    bio: [
      ptBlock(
        `Leading the FMELi ${a.city} assembly in the full expression of the unveiled Word — teaching, pastoring, and serving the household of faith.`,
      ),
      ptBlock(
        "Rename this document in Studio and upload the real photo to replace the placeholder.",
      ),
    ],
    order: 10 + i,
  }));

  return { setMan, assemblyLeads };
}
