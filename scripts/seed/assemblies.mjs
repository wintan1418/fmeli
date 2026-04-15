import { ptBlock, ASSEMBLY_ROWS } from "./lib.mjs";

/** Build the nine FMELi assembly documents. */
export function buildAssemblyDocs() {
  return ASSEMBLY_ROWS.map((a) => ({
    _id: `assembly.${a.slug}`,
    _type: "assembly",
    city: a.city,
    state: a.state,
    slug: { _type: "slug", current: a.slug },
    tagline: a.tagline,
    order: a.order,
    address: `To be filled in Studio — Assembly office, ${a.city}.`,
    phone: "+234 000 000 0000",
    email: `${a.slug}@fmeli.org`,
    leadPastor: {
      _type: "reference",
      _ref: `pastor.${a.slug}-lead`,
    },
    about: [
      ptBlock(
        `The FMELi ${a.city} assembly gathers weekly for the Lord's table, the unveiled Word, and the fellowship of the saints. Our doors are open — come as you are.`,
      ),
    ],
    serviceTimes: [
      {
        _type: "object",
        _key: `t-${a.slug}-sun`,
        label: "Sunday Service",
        day: "Every Sunday",
        time: "8:00 AM",
      },
      {
        _type: "object",
        _key: `t-${a.slug}-wed`,
        label: "Wednesday Teaching",
        day: "Every Wednesday",
        time: "6:30 PM",
      },
      {
        _type: "object",
        _key: `t-${a.slug}-vigil`,
        label: "Monthly Vigil",
        day: "First Friday",
        time: "10:00 PM",
      },
    ],
  }));
}
