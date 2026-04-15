import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

/* Social brand marks — inlined SVGs because lucide-react dropped
 * brand icons for trademark reasons. Paths from Simple Icons (CC0). */
function Instagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.645.07-4.85.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.747 2.163 15.368 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0 1.838c-3.148 0-3.52.012-4.761.068-.98.045-1.513.207-1.867.344-.47.182-.805.4-1.157.752-.352.352-.57.687-.752 1.157-.137.354-.299.887-.344 1.867C3.013 9.48 3 9.85 3 13s.013 3.52.068 4.761c.045.98.207 1.513.344 1.867.182.47.4.805.752 1.157.352.352.687.57 1.157.752.354.137.887.299 1.867.344 1.24.056 1.613.068 4.761.068s3.52-.013 4.761-.068c.98-.045 1.513-.207 1.867-.344.47-.182.805-.4 1.157-.752.352-.352.57-.687.752-1.157.137-.354.299-.887.344-1.867.056-1.24.068-1.613.068-4.761s-.012-3.52-.068-4.761c-.045-.98-.207-1.513-.344-1.867a3.117 3.117 0 00-.752-1.157 3.117 3.117 0 00-1.157-.752c-.354-.137-.887-.299-1.867-.344C15.52 4.013 15.148 4 12 4zm0 3.135a4.865 4.865 0 110 9.73 4.865 4.865 0 010-9.73zm0 8.027a3.162 3.162 0 100-6.324 3.162 3.162 0 000 6.324zm6.202-8.27a1.137 1.137 0 11-2.274 0 1.137 1.137 0 012.274 0z" />
    </svg>
  );
}

function Youtube({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function Facebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const COLUMNS = {
  Ministry: [
    { label: "About Us", href: "/about" },
    { label: "Become a Member", href: "/members/join" },
    { label: "What We Believe", href: "/beliefs" },
    { label: "Contact", href: "/contact" },
  ],
  Media: [
    { label: "Messages", href: "/resources/messages" },
    { label: "Watch Live", href: "/live" },
    { label: "Blog", href: "/blog" },
    { label: "Give", href: "/give" },
  ],
  Meetings: [
    { label: "Sunday Service", href: "/meetings/sunday-service" },
    { label: "Wednesday Teaching", href: "/meetings/wednesday-teaching" },
    { label: "Monthly Vigil", href: "/meetings/monthly-vigil" },
    { label: "All meetings", href: "/meetings" },
  ],
} as const;

const ASSEMBLIES = [
  "Lagos", "Abeokuta", "Akure", "Osogbo",
  "Ife", "Ondo", "Benin", "Ado", "Ibadan",
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-(--color-brand-blue-ink) text-(--color-brand-white)">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-(--color-brand-red)/25 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-0 h-[420px] w-[420px] rounded-full bg-(--color-brand-gold)/10 blur-[160px]"
      />

      <Container className="relative py-20 md:py-24">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand-white) p-2 shadow-[var(--shadow-glow-gold)]">
                <Image
                  src="/images/logo.png"
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                  FMELi
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-(--color-brand-white)/60">
                  Eternal Life Embassy
                </p>
              </div>
            </div>
            <p className="mt-7 max-w-sm text-sm leading-7 text-(--color-brand-white)/65">
              Full Manifestation of Eternal Life — unveiling the mysteries of
              the Word across nine assemblies in Nigeria and everywhere online.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Youtube, href: "#", label: "YouTube" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Mail, href: "/contact", label: "Email" },
              ].map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-brand-white)/15 text-(--color-brand-white)/70 transition-all hover:border-(--color-brand-gold) hover:text-(--color-brand-gold)"
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(COLUMNS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-[family-name:var(--font-display)] text-base font-semibold text-(--color-brand-white)">
                {heading}
              </h4>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-(--color-brand-white)/65 transition-colors hover:text-(--color-brand-gold)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-(--color-brand-white)/10 pt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-(--color-brand-gold)">
            Our assemblies
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--color-brand-white)/75">
            {ASSEMBLIES.map((city) => (
              <Link
                key={city}
                href={`/assemblies/${city.toLowerCase()}`}
                className="transition-colors hover:text-(--color-brand-gold)"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-(--color-brand-white)/10 pt-8 text-xs text-(--color-brand-white)/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Full Manifestation of Eternal Life. All rights reserved.</p>
          <p className="font-[family-name:var(--font-display)] italic text-(--color-brand-gold)">
            To God be the glory.
          </p>
        </div>
      </Container>
    </footer>
  );
}
