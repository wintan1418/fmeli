"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Play, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Meetings", href: "/meetings" },
  { label: "Resources", href: "/resources" },
  { label: "Shop", href: "/shop" },
  { label: "Assemblies", href: "/assemblies" },
  { label: "Blog", href: "/blog" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Search state lifted to the navbar so the desktop icon and the
  // mobile drawer item can share one SearchDialog instance.
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global ⌘K / Ctrl-K shortcut. Lives in the navbar (instead of
  // inside SearchDialog) because the dialog now runs in controlled
  // mode and shouldn't double-register the listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-(--color-brand-blue-ink)/95 shadow-[0_1px_0_0_color-mix(in_srgb,white_8%,transparent)] backdrop-blur"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Full Manifestation of Eternal Life"
        >
          <span className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-(--color-brand-white) p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_10px_30px_-10px_rgba(232,160,42,0.5)]">
            <Image
              src="/images/logo.png"
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="hidden flex-col leading-tight text-(--color-brand-white) sm:flex">
            <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
              FMELi
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-(--color-brand-white)/60">
              Eternal Life Embassy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-(--color-brand-white)/85 transition-colors hover:text-(--color-brand-gold)"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Desktop search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-brand-white)/20 text-(--color-brand-white) transition hover:border-(--color-brand-gold) hover:text-(--color-brand-gold)"
          >
            <Search size={16} />
          </button>
          <Link
            href="/live"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-(--color-brand-gold) px-6 text-sm font-semibold text-(--color-brand-blue-ink) transition-all hover:bg-(--color-brand-gold-soft) hover:shadow-[var(--shadow-glow-gold)]"
          >
            <Play size={14} className="fill-current" />
            Watch Live
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-brand-white)/20 text-(--color-brand-white) lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-500 ease-out bg-(--color-brand-blue-ink)/98 backdrop-blur",
          open ? "max-h-[500px]" : "max-h-0",
        )}
      >
        <Container className="flex flex-col gap-1 pb-6 pt-4">
          {/* Mobile search trigger — lives at the top of the drawer */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSearchOpen(true);
            }}
            className="mb-2 flex items-center gap-3 rounded-lg border border-(--color-brand-white)/15 px-3 py-3 text-base font-medium text-(--color-brand-white)/90 transition-colors hover:bg-(--color-brand-white)/5 hover:text-(--color-brand-gold)"
          >
            <Search size={16} className="text-(--color-brand-gold)" />
            Search FMELi
          </button>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-base font-medium text-(--color-brand-white)/90 transition-colors hover:bg-(--color-brand-white)/5 hover:text-(--color-brand-gold)"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/live"
            className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--color-brand-gold) font-semibold text-(--color-brand-blue-ink)"
            onClick={() => setOpen(false)}
          >
            <Play size={14} className="fill-current" />
            Watch Live
          </Link>
        </Container>
      </div>

      {/* Single controlled SearchDialog instance, opened by either
       * the desktop icon or the mobile drawer item. */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
