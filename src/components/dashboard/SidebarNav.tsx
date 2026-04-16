"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ScrollText,
  UsersRound,
  Building2,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: Home, exact: true },
  { href: "/dashboard/reports", label: "Weekly reports", icon: ScrollText },
  { href: "/dashboard/members", label: "Members", icon: UsersRound },
  { href: "/dashboard/assembly", label: "Assembly profile", icon: Building2, exact: true },
  { href: "/dashboard/assembly/announcements", label: "Announcements", icon: Megaphone },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition",
              active
                ? "bg-[color:color-mix(in_srgb,var(--color-brand-blue-ink)_8%,white)] text-[color:var(--color-brand-blue-ink)]"
                : "text-[color:var(--color-ink-soft)] hover:bg-[color:rgb(11_20_27/0.04)] hover:text-[color:var(--color-ink)]",
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
