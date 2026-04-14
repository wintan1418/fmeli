import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Full Manifestation of Eternal Life",
    template: "%s · FMELi",
  },
  description:
    "Full Manifestation of Eternal Life (FMELi) — Eternal Life Embassy. Sermons, meetings, and assemblies across Nigeria. The entrance of Your word gives light.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--color-off-white) text-(--color-ink-soft)">
        {children}
      </body>
    </html>
  );
}
