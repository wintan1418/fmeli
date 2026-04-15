import { NextResponse, type NextRequest } from "next/server";
import { groq } from "next-sanity";
import { client as readClient } from "@/lib/sanity/client";

/**
 * Site-wide resource search.
 *
 * GET /api/search?q=<term>
 *
 * Runs a single GROQ query that returns a flat result list across
 * messages, worship sessions, lively-music tracks, tips, and books.
 * Each row carries a `kind` discriminator so the client can group
 * them in the dropdown.
 *
 * Why one combined query instead of N parallel fetches?
 *  - Cuts the round-trip cost (the search dialog runs on every
 *    keystroke, debounced).
 *  - Sanity's GROQ supports `union` via the array spread inside
 *    object projections, so this is idiomatic.
 *
 * Match strategy: we append `*` to every word so prefix matches
 * count ("the en" finds "the entrance of the word"). GROQ's
 * `match` is case-insensitive by default.
 */

const SEARCH_QUERY = groq`{
  "results": [
    ...*[_type == "message"
      && (title match $q || coalesce(excerpt, "") match $q)
    ] | order(date desc)[0...8]{
      "kind": "message",
      _id,
      title,
      "slug": slug.current,
      "href": "/resources/messages/" + slug.current,
      "subtitle": coalesce(category->title, scripture, ""),
      "summary": excerpt,
      "thumbnail": thumbnail.asset->url,
      "date": date
    },
    ...*[_type == "worshipSession"
      && (title match $q || coalesce(summary, "") match $q)
    ] | order(date desc)[0...4]{
      "kind": "worship",
      _id,
      title,
      "slug": slug.current,
      "href": "/resources/worship/" + slug.current,
      "subtitle": leader,
      "summary": summary,
      "thumbnail": thumbnail.asset->url,
      "date": date
    },
    ...*[_type == "track"
      && (title match $q || artist match $q)
    ] | order(releasedAt desc)[0...4]{
      "kind": "music",
      _id,
      title,
      "slug": slug.current,
      "href": "/resources/music/" + slug.current,
      "subtitle": artist,
      "summary": null,
      "thumbnail": cover.asset->url,
      "date": releasedAt
    },
    ...*[_type == "tip"
      && (title match $q || coalesce(summary, "") match $q)
    ] | order(publishedAt desc)[0...4]{
      "kind": "tip",
      _id,
      title,
      "slug": slug.current,
      "href": "/resources/tips/" + slug.current,
      "subtitle": category->title,
      "summary": summary,
      "thumbnail": coverImage.asset->url,
      "date": publishedAt
    },
    ...*[_type == "book"
      && (title match $q || coalesce(subtitle, "") match $q || coalesce(author, "") match $q)
    ] | order(featured desc, publishedAt desc)[0...4]{
      "kind": "book",
      _id,
      title,
      "slug": slug.current,
      "href": "/shop/" + slug.current,
      "subtitle": author,
      "summary": summary,
      "thumbnail": cover.asset->url,
      "date": publishedAt
    }
  ]
}`;

type ResultRow = {
  kind: "message" | "worship" | "music" | "tip" | "book";
  _id: string;
  title: string;
  slug: string;
  href: string;
  subtitle?: string | null;
  summary?: string | null;
  thumbnail?: string | null;
  date?: string | null;
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (raw.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Sanitise: GROQ `match` chokes on stray special characters.
  // Strip anything that isn't a word char or whitespace, then
  // append `*` to every term for prefix matching.
  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}*`)
    .join(" ");

  if (!cleaned) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await readClient.fetch<{ results: ResultRow[] }>(
      SEARCH_QUERY,
      { q: cleaned },
    );
    return NextResponse.json({ results: data?.results ?? [] });
  } catch (err) {
    console.error("[api/search] GROQ failed", err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
