/** Build the homepage ticker announcements. */
export function buildAnnouncementDocs() {
  return [
    {
      _id: "announcement.sunday",
      _type: "announcement",
      title: "Sunday Service · 8:00 AM across all assemblies",
      placement: "ticker",
      priority: 10,
    },
    {
      _id: "announcement.wednesday",
      _type: "announcement",
      title: "Wednesday Teaching Series · 6:30 PM",
      placement: "ticker",
      priority: 9,
    },
    {
      _id: "announcement.life-campaign",
      _type: "announcement",
      title: "Life Campaign · The Overcomers · 9-15 March 2026",
      placement: "ticker",
      priority: 8,
    },
    {
      _id: "announcement.live",
      _type: "announcement",
      title: "Watch FMELi live · Sundays 8am WAT",
      placement: "ticker",
      priority: 7,
    },
    {
      _id: "announcement.vigil",
      _type: "announcement",
      title: "Monthly Vigil · First Friday, 10:00 PM",
      placement: "ticker",
      priority: 6,
    },
  ];
}
