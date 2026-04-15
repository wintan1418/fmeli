import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FMELi · Pastor Dashboard",
  description: "Internal dashboard for FMELi assembly leads and office staff.",
  robots: { index: false, follow: false },
};

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
