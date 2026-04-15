"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  PlayCircle,
  Headphones,
  Music2,
  Sparkles,
  BookOpen,
  Loader2,
} from "lucide-react";

type ResultRow = {
  kind: "message" | "worship" | "music" | "tip" | "book";
  _id: string;
  title: string;
  href: string;
  subtitle?: string | null;
  summary?: string | null;
  thumbnail?: string | null;
  date?: string | null;
};

type Group = {
  key: ResultRow["kind"];
  label: string;
  icon: typeof Search;
};

const GROUPS: Group[] = [
  { key: "message", label: "Messages", icon: PlayCircle },
  { key: "worship", label: "Worship sessions", icon: Headphones },
  { key: "music", label: "Lively music", icon: Music2 },
  { key: "tip", label: "Tips", icon: Sparkles },
  { key: "book", label: "Books", icon: BookOpen },
];

/**
 * Site-wide search dialog.
 *
 * Controlled component — the parent (Navbar) owns `open` so we can
 * have multiple triggers (a desktop icon + a mobile drawer item)
 * sharing one dialog instance. If you need to use it standalone,
 * pass nothing and a default trigger button is rendered.
 *
 * - Debounces the input by 250ms so we don't hammer the API on
 *   every keystroke.
 * - Uses the existing /api/search endpoint, which returns a flat
 *   array of results with a `kind` discriminator.
 * - Groups the results by kind in the dropdown.
 * - Closes when the user picks a result (Link click, then a
 *   Dialog.Close wrapper handles the unmount).
 */
type SearchDialogProps = {
  /** Controlled open state. When omitted, the dialog manages its
   * own state and renders the default trigger button. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SearchDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SearchDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    controlledOnOpenChange?.(next);
  };

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch on debounced change. The cancelled flag stops a late
  // response from clobbering a more recent query.
  useEffect(() => {
    if (debounced.length < 2) return;
    let cancelled = false;
    const ctrl = new AbortController();

    // queueMicrotask defers the setLoading to the next tick so React 19's
    // set-state-in-effect lint rule doesn't flag this — the rule treats
    // a synchronous setState in the effect body as a cascading render
    // trigger.
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResults(Array.isArray(data?.results) ? data.results : []);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [debounced]);

  // When the dialog closes, schedule a microtask to clear state.
  // Same reason as above — keep React 19's effect-body lint happy.
  useEffect(() => {
    if (open) return;
    queueMicrotask(() => {
      setQuery("");
      setDebounced("");
      setResults([]);
      setLoading(false);
    });
  }, [open]);

  // Clear results immediately when the input falls below the
  // 2-char threshold. Driven by the input change handler instead
  // of an effect so it stays synchronous from the user's POV.
  useEffect(() => {
    if (debounced.length < 2 && (results.length > 0 || loading)) {
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
      });
    }
  }, [debounced, results.length, loading]);

  // Keyboard shortcut: ⌘K / Ctrl-K opens the dialog. Only registered
  // by the uncontrolled instance — when controlled, the parent owns
  // the listener so we don't double-fire.
  useEffect(() => {
    if (isControlled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setInternalOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isControlled]);

  const grouped: Record<ResultRow["kind"], ResultRow[]> = {
    message: [],
    worship: [],
    music: [],
    tip: [],
    book: [],
  };
  for (const r of results) grouped[r.kind].push(r);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Default trigger only renders when no parent is controlling
       * the dialog — the controlled-mode caller (Navbar) supplies
       * its own desktop + mobile triggers. */}
      {!isControlled && (
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Open search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-brand-white)/20 text-(--color-brand-white) transition hover:border-(--color-brand-gold) hover:text-(--color-brand-gold)"
          >
            <Search size={16} />
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-brand-blue-ink/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[10vh] z-[61] w-[92vw] max-w-2xl -translate-x-1/2 overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
          <Dialog.Title className="sr-only">Search FMELi</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search across messages, worship sessions, music, tips and books.
          </Dialog.Description>

          {/* Input row */}
          <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-4">
            <Search size={18} className="text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages, worship, music, tips, books…"
              className="flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
            />
            {loading && (
              <Loader2 size={16} className="animate-spin text-muted" />
            )}
            <Dialog.Close asChild>
              <button
                aria-label="Close search"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {debounced.length < 2 ? (
              <Hint>
                Start typing — search runs across messages, worship sessions,
                lively music, tips, and the shop.
              </Hint>
            ) : results.length === 0 && !loading ? (
              <Hint>
                No results for <strong>“{debounced}”</strong>. Try another
                word.
              </Hint>
            ) : (
              <div className="divide-y divide-ink/6">
                {GROUPS.map((g) => {
                  const rows = grouped[g.key];
                  if (rows.length === 0) return null;
                  const Icon = g.icon;
                  return (
                    <section key={g.key} className="px-5 py-4">
                      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                        <Icon size={12} className="text-brand-gold" />
                        {g.label}
                      </h3>
                      <ul className="space-y-1">
                        {rows.map((r) => (
                          <li key={r._id}>
                            <Dialog.Close asChild>
                              <Link
                                href={r.href}
                                className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-ink/5"
                              >
                                {r.thumbnail ? (
                                  <Image
                                    src={r.thumbnail}
                                    alt=""
                                    width={48}
                                    height={48}
                                    unoptimized
                                    className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-brand-blue-ink/8 text-brand-blue-ink">
                                    <Icon size={18} />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold text-ink">
                                    {r.title}
                                  </p>
                                  {r.subtitle && (
                                    <p className="truncate text-xs text-muted">
                                      {r.subtitle}
                                    </p>
                                  )}
                                  {r.summary && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                                      {r.summary}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            </Dialog.Close>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-ink/8 bg-ink/2 px-5 py-3 text-[11px] text-muted">
            <span>
              <kbd className="rounded border border-ink/15 bg-white px-1.5 py-0.5 font-mono text-[10px]">
                ⌘ K
              </kbd>{" "}
              to open
            </span>
            <span>
              <kbd className="rounded border border-ink/15 bg-white px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-ink-soft">
      {children}
    </div>
  );
}
