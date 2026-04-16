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

/**
 * Messages archive — newest first, last 120 shipped at build time.
 *
 * Optional filters (both nullable, both AND-ed):
 *   $category — slug string. Matches the message's direct category OR
 *               any sub-category whose parent's slug is $category. So
 *               picking "Special Meetings" pulls in every message under
 *               every Special-Meetings sub-category.
 *   $year     — 4-digit string (e.g. "2025"). Filters on the YEAR
 *               portion of the message's `date` field. Pass null to
 *               skip year filtering entirely.
 *
 * Limit raised to 120 because we now have ~1,500 imported messages
 * and the chip filters narrow them down quickly — a per-category
 * page commonly has 50-200 entries.
 */
export const MESSAGES_LIST_QUERY = groq`
  *[_type == "message"
      && ($category == null
          || category->slug.current == $category
          || category->parent->slug.current == $category)
      && ($year == null || string::split(date, "-")[0] == $year)
    ] | order(date desc)[$offset...$end]{
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
      "category": category->{
        title,
        "slug": slug.current,
        defaultThumbnail,
        "parent": parent->{
          title,
          "slug": slug.current,
          defaultThumbnail
        }
      },
      "preacher": preacher->{ name, "image": image.asset->url },
      "series": series->{ title, "slug": slug.current }
    }
`;

/**
 * Total count of messages matching the same $category / $year filter
 * combo as MESSAGES_LIST_QUERY — used by the page to render the
 * pagination bar. Same filter logic, no projection.
 */
export const MESSAGES_COUNT_QUERY = groq`
  count(*[_type == "message"
      && ($category == null
          || category->slug.current == $category
          || category->parent->slug.current == $category)
      && ($year == null || string::split(date, "-")[0] == $year)
    ])
`;

/**
 * Distinct years that have at least one message — for the year filter
 * pills on /resources/messages. Returned as a sorted descending list
 * of 4-digit strings.
 */
export const MESSAGE_YEARS_QUERY = groq`
  array::unique(
    *[_type == "message" && defined(date)] {
      "year": string::split(date, "-")[0]
    }.year
  )[@ >= "1980" && @ <= "2035"] | order(@ desc)
`;

/**
 * Message categories — returned as a flat list with parent metadata
 * inlined. The page component groups them client-side: roots first
 * (those with no parent), then children grouped by parent.
 */
export const MESSAGE_CATEGORIES_QUERY = groq`
  *[_type == "messageCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    defaultThumbnail,
    "parent": parent->{ "slug": slug.current, title, defaultThumbnail }
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

/**
 * The 3 messages used by the homepage featured grid.
 *
 * Ordering: featured docs first (so the office can pin a message
 * to the homepage by toggling the boolean in Studio), then by date
 * descending. Limit 3. Trimmed projection — only the fields the
 * card needs.
 */
export const FEATURED_MESSAGES_QUERY = groq`
  *[_type == "message"] | order(featured desc, date desc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    date,
    scripture,
    excerpt,
    durationMinutes,
    featured,
    thumbnail,
    "category": category->{ title, "slug": slug.current },
    "preacher": preacher->{ name }
  }
`;

// ────────────────────────────────────────────────────────────
// Worship sessions
// ────────────────────────────────────────────────────────────

export const WORSHIP_SESSIONS_LIST_QUERY = groq`
  *[_type == "worshipSession"] | order(date desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    date,
    leader,
    summary,
    durationMinutes,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    thumbnail,
    "assembly": assembly->{ "slug": slug.current, city }
  }
`;

export const WORSHIP_SESSION_BY_SLUG_QUERY = groq`
  *[_type == "worshipSession" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    date,
    leader,
    summary,
    durationMinutes,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    thumbnail,
    songList,
    "assembly": assembly->{ "slug": slug.current, city }
  }
`;

export const ALL_WORSHIP_SESSION_SLUGS_QUERY = groq`
  *[_type == "worshipSession" && defined(slug.current)]{ "slug": slug.current }
`;

// ────────────────────────────────────────────────────────────
// Lively music tracks
// ────────────────────────────────────────────────────────────

export const TRACKS_LIST_QUERY = groq`
  *[_type == "track"] | order(releasedAt desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    artist,
    releasedAt,
    durationSeconds,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    cover
  }
`;

export const TRACK_BY_SLUG_QUERY = groq`
  *[_type == "track" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    artist,
    releasedAt,
    durationSeconds,
    youtubeId,
    audioUrl,
    "audioFileUrl": audioFile.asset->url,
    cover,
    lyrics,
    writers
  }
`;

export const ALL_TRACK_SLUGS_QUERY = groq`
  *[_type == "track" && defined(slug.current)]{ "slug": slug.current }
`;

// ────────────────────────────────────────────────────────────
// Tips
// ────────────────────────────────────────────────────────────

export const TIPS_LIST_QUERY = groq`
  *[_type == "tip"
      && ($category == null || category->slug.current == $category)
    ] | order(publishedAt desc)[0...60]{
      _id,
      title,
      "slug": slug.current,
      summary,
      publishedAt,
      coverImage,
      "category": category->{ title, "slug": slug.current },
      "author": author->{ name, "image": image.asset->url }
    }
`;

export const TIP_CATEGORIES_QUERY = groq`
  *[_type == "tipCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description
  }
`;

export const TIP_BY_SLUG_QUERY = groq`
  *[_type == "tip" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    publishedAt,
    coverImage,
    body,
    "category": category->{ title, "slug": slug.current },
    "author": author->{ name, role, image, bio }
  }
`;

export const ALL_TIP_SLUGS_QUERY = groq`
  *[_type == "tip" && defined(slug.current)]{ "slug": slug.current }
`;

// ────────────────────────────────────────────────────────────
// Shop · Books
// ────────────────────────────────────────────────────────────

export const BOOKS_LIST_QUERY = groq`
  *[_type == "book"] | order(featured desc, publishedAt desc)[0...60]{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    author,
    cover,
    price,
    compareAtPrice,
    summary,
    outOfStock,
    featured
  }
`;

export const BOOK_BY_SLUG_QUERY = groq`
  *[_type == "book" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    author,
    cover,
    price,
    compareAtPrice,
    buyUrl,
    summary,
    description,
    pages,
    language,
    publishedAt,
    outOfStock
  }
`;

export const ALL_BOOK_SLUGS_QUERY = groq`
  *[_type == "book" && defined(slug.current)]{ "slug": slug.current }
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
    welcomeVideo{
      url,
      poster,
      caption
    },
    serviceTimes,
    about,
    "leadPastor": leadPastor->{
      _id,
      name,
      role,
      image,
      bio
    },
    "leaders": leaders[]->{ _id, name, role, image, department },
    "announcements": *[
        _type == "assemblyAnnouncement"
        && assembly._ref == ^._id
        && !(isArchived == true)
        && (!defined(startsAt) || startsAt <= now())
        && (!defined(endsAt) || endsAt >= now())
      ] | order(isPinned desc, coalesce(startsAt, _createdAt) desc){
        _id,
        title,
        "slug": slug.current,
        kind,
        body,
        heroImage,
        startsAt,
        endsAt,
        streamUrl,
        ctaLabel,
        isPinned
      }
  }
`;

/**
 * Every active announcement for a single assembly — same filter as
 * the nested projection above, but standalone so dashboard/preview
 * code can call it without pulling the whole assembly doc.
 */
export const ACTIVE_ANNOUNCEMENTS_FOR_ASSEMBLY = groq`
  *[_type == "assemblyAnnouncement"
      && assembly._ref == $assemblyId
      && !(isArchived == true)
      && (!defined(startsAt) || startsAt <= now())
      && (!defined(endsAt) || endsAt >= now())
    ] | order(isPinned desc, coalesce(startsAt, _createdAt) desc){
      _id,
      title,
      "slug": slug.current,
      kind,
      body,
      heroImage,
      startsAt,
      endsAt,
      streamUrl,
      ctaLabel,
      isPinned
    }
`;

/**
 * Every announcement (active + archived + upcoming) for one
 * assembly — for the pastor dashboard list view.
 */
export const ALL_ANNOUNCEMENTS_FOR_ASSEMBLY = groq`
  *[_type == "assemblyAnnouncement" && assembly._ref == $assemblyId]
    | order(isPinned desc, _createdAt desc){
      _id,
      title,
      "slug": slug.current,
      kind,
      startsAt,
      endsAt,
      streamUrl,
      isPinned,
      isArchived,
      _createdAt,
      _updatedAt
    }
`;

/** One announcement by _id — for the dashboard edit form. */
export const ANNOUNCEMENT_BY_ID = groq`
  *[_type == "assemblyAnnouncement" && _id == $id][0]{
    _id,
    title,
    "slug": slug.current,
    kind,
    body,
    heroImage,
    startsAt,
    endsAt,
    streamUrl,
    ctaLabel,
    isPinned,
    isArchived,
    "assembly": assembly->{ _id, "slug": slug.current, city }
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
