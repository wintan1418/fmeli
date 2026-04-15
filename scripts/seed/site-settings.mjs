/**
 * The siteSettings singleton. Created with createIfNotExists so manual
 * tweaks in Studio aren't blown away on re-seed.
 */
export function buildSiteSettingsDoc() {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    title: "Full Manifestation of Eternal Life",
    tagline: "The entrance of Your word gives light",
    footer: {
      blurb:
        "Full Manifestation of Eternal Life — unveiling the mysteries of the Word across nine assemblies in Nigeria and everywhere online.",
    },
    homepageStats: [
      { _key: "s-assemblies", value: 9, label: "Assemblies in Nigeria" },
      { _key: "s-messages", value: 6000, suffix: "+", label: "Messages in the archive" },
      { _key: "s-years", value: 52, label: "Years of ministry" },
      { _key: "s-live", value: 24, suffix: "×7", label: "Live stream" },
    ],
    bankTransferDetails: {
      bankName: "GTBank",
      accountName: "Full Manifestation of Eternal Life",
      accountNumber: "0000000000",
      instructions:
        "After transfer, come back to the site and click 'I have transferred'. Your registration will be confirmed once we verify the payment.",
    },
  };
}
