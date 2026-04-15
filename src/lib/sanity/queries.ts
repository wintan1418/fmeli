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

/** Messages archive — newest first, last 60 shipped at build time. */
export const MESSAGES_LIST_QUERY = groq`
  *[_type == "message"] | order(date desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    date,
    scripture,
    excerpt,
    excerptUrl,
    "excerptFileUrl": excerptFile.asset->url,
    durationMinutes,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    thumbnail,
    "category": category->{ title, "slug": slug.current },
    "preacher": preacher->{ name, "image": image.asset->url },
    "series": series->{ title, "slug": slug.current }
  }
`;

/** Every message category (for filter chips on the archive). */
export const MESSAGE_CATEGORIES_QUERY = groq`
  *[_type == "messageCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description
  }
`;

/** Single message by slug. */
export const MESSAGE_BY_SLUG_QUERY = groq`
  *[_type == "message" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    date,
    scripture,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    "videoFileUrl": videoFile.asset->url,
    excerpt,
    excerptUrl,
    "excerptFileUrl": excerptFile.asset->url,
    notes,
    transcript,
    durationMinutes,
    "category": category->{ title, "slug": slug.current },
    "preacher": preacher->{ name, role, bio, image },
    "series": series->{ title, "slug": slug.current, artwork },
    "assembly": assembly->{ "slug": slug.current, city }
  }
`;

/** Every published message slug — for generateStaticParams. */
export const ALL_MESSAGE_SLUGS_QUERY = groq`
  *[_type == "message" && defined(slug.current)]{ "slug": slug.current }
`;

/** Upcoming events (future only). */
export const EVENTS_UPCOMING_QUERY = groq`
  *[_type == "event" && startsAt >= now()] | order(startsAt asc){
    _id,
    title,
    "slug": slug.current,
    tagline,
    startsAt,
    endsAt,
    location,
    heroImage,
    isSpecial,
    registrationEnabled,
    "assembly": assembly->{ "slug": slug.current, city }
  }
`;

/** All events (past + upcoming). */
export const EVENTS_ALL_QUERY = groq`
  *[_type == "event"] | order(startsAt desc){
    _id,
    title,
    "slug": slug.current,
    tagline,
    startsAt,
    endsAt,
    location,
    heroImage,
    isSpecial,
    registrationEnabled,
    "assembly": assembly->{ "slug": slug.current, city }
  }
`;

/** Every published event slug — for generateStaticParams. */
export const ALL_EVENT_SLUGS_QUERY = groq`
  *[_type == "event" && defined(slug.current)]{ "slug": slug.current }
`;

/** Single event by slug (full detail). */
export const EVENT_BY_SLUG_QUERY = groq`
  *[_type == "event" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    tagline,
    isSpecial,
    startsAt,
    endsAt,
    location,
    heroImage,
    description,
    registrationEnabled,
    registrationDeadline,
    capacity,
    registrationMode,
    externalRegistrationUrl,
    payment{
      enabled,
      amount,
      currency,
      allowPaystack,
      allowTransfer
    },
    registrationFields[]{
      label,
      name,
      kind,
      required,
      options,
      placeholder
    },
    "assembly": assembly->{
      _id,
      "slug": slug.current,
      city,
      state,
      address
    },
    "parentMeeting": parentMeeting->{
      "slug": slug.current,
      title
    },
    "registeredCount": count(*[_type == "registration" && event._ref == ^._id && status == "confirmed"])
  }
`;

/** Assemblies for dropdowns. */
export const ASSEMBLIES_QUERY = groq`
  *[_type == "assembly"] | order(order asc, city asc){
    _id,
    "slug": slug.current,
    city,
    state
  }
`;

/** Full assembly listing for the /assemblies page. */
export const ASSEMBLIES_FULL_QUERY = groq`
  *[_type == "assembly"] | order(order asc, city asc){
    _id,
    "slug": slug.current,
    city,
    state,
    tagline,
    address,
    phone,
    email,
    heroImage,
    serviceTimes,
    "leadPastor": leadPastor->{
      _id,
      name,
      role,
      image
    }
  }
`;

/** Single assembly by slug. */
export const ASSEMBLY_BY_SLUG_QUERY = groq`
  *[_type == "assembly" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    city,
    state,
    tagline,
    address,
    phone,
    email,
    mapUrl,
    mapEmbed,
    heroImage,
    serviceTimes,
    about,
    "leadPastor": leadPastor->{
      _id,
      name,
      role,
      image,
      bio
    },
    "leaders": leaders[]->{ _id, name, role, image, department }
  }
`;

export const ALL_ASSEMBLY_SLUGS_QUERY = groq`
  *[_type == "assembly" && defined(slug.current)]{ "slug": slug.current }
`;

/** All meetings. */
export const MEETINGS_QUERY = groq`
  *[_type == "meeting"] | order(order asc){
    _id,
    title,
    "slug": slug.current,
    kind,
    cadenceLabel,
    defaultDay,
    defaultTime,
    summary,
    image,
    featured
  }
`;

/** Single meeting by slug. */
export const MEETING_BY_SLUG_QUERY = groq`
  *[_type == "meeting" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    kind,
    cadenceLabel,
    defaultDay,
    defaultTime,
    summary,
    description,
    image,
    "assemblies": assemblies[]->{ "slug": slug.current, city }
  }
`;

export const ALL_MEETING_SLUGS_QUERY = groq`
  *[_type == "meeting" && defined(slug.current)]{ "slug": slug.current }
`;

/** Blog posts list. */
export const POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    coverImage,
    tags,
    "author": author->{ name, image }
  }
`;

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage,
    excerpt,
    body,
    tags,
    "author": author->{ name, role, image, bio }
  }
`;

export const ALL_POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`;

/** Site settings singleton — used in layouts. */
export const SITE_SETTINGS_WITH_BANK_QUERY = groq`
  *[_id == "siteSettings"][0]{
    title,
    tagline,
    liveStreamUrl,
    bankTransferDetails
  }
`;
