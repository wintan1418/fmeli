import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FMELi · Pastor Dashboard",
  description: "Internal dashboard for FMELi assembly leads and office staff.",
  robots: { index: false, follow: false },
};

/**
 * The dashboard reads the session cookie on every request via auth().
 * That's incompatible with static rendering, so opt the entire route
 * group out of the build-time prerender. Individual pages no longer
 * need their own `export const dynamic = "force-dynamic"`.
 */
export const dynamic = "force-dynamic";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-off-white)",
        color: "var(--color-ink)",
      }}
    >
      {children}
    </div>
  );
}
