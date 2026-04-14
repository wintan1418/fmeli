import { groq } from "next-sanity";

/** Site-wide settings — navbar, footer, defaults. */
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    title,
    tagline,
    "logo": logo.asset->url,
    navLinks[]{ label, href },
    footer,
    socials,
    liveStreamUrl,
    seo
  }
`;

/** A CMS Page by slug (Page Builder). */
export const PAGE_BY_SLUG_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    seo,
    sections[]{
      _key,
      _type,
      ...
    }
  }
`;

/** List of all published page slugs, for generateStaticParams. */
export const ALL_PAGE_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current)]{ "slug": slug.current }
`;

/** Sermons archive — newest first, last 60 shipped at build time. */
export const SERMONS_LIST_QUERY = groq`
  *[_type == "sermon"] | order(date desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    date,
    scripture,
    youtubeId,
    thumbnail,
    "preacher": preacher->{ name, "image": image.asset->url },
    "series": series->{ title, "slug": slug.current }
  }
`;

/** Single sermon by slug. */
export const SERMON_BY_SLUG_QUERY = groq`
  *[_type == "sermon" && slug.current == $slug][0]{
    ...,
    "preacher": preacher->{ name, role, bio, image },
    "series": series->{ title, "slug": slug.current, artwork }
  }
`;

/** Upcoming events (future only). */
export const EVENTS_UPCOMING_QUERY = groq`
  *[_type == "event" && startsAt >= now()] | order(startsAt asc){
    _id,
    title,
    "slug": slug.current,
    startsAt,
    endsAt,
    location,
    heroImage,
    description
  }
`;

/** Single event by slug. */
export const EVENT_BY_SLUG_QUERY = groq`
  *[_type == "event" && slug.current == $slug][0]{ ... }
`;
