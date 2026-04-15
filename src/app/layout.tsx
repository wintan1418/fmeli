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

/**
 * Resolve the public origin of the site for metadataBase + canonical URLs.
 *
 * Priority: NEXT_PUBLIC_SITE_URL (set explicitly in production) →
 * VERCEL_URL (auto-set by Vercel for previews + branch deploys) →
 * localhost (dev fallback). NEXT_PUBLIC_SITE_URL wins so when we get
 * the real fmeli.org domain we set it once and everything follows.
 */
function resolveSiteUrl(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return new URL(fromEnv);
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return new URL(`https://${vercelUrl}`);
  return new URL("http://localhost:3000");
}

const SITE_URL = resolveSiteUrl();
const SITE_NAME = "Full Manifestation of Eternal Life";
const SITE_DESCRIPTION =
  "Full Manifestation of Eternal Life (FMELi) — Eternal Life Embassy. Messages, meetings, and assemblies across Nigeria. The entrance of Your word gives light.";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_NAME,
    template: "%s · FMELi",
  },
  description: SITE_DESCRIPTION,
  applicationName: "FMELi",
  keywords: [
    "FMELi",
    "Full Manifestation of Eternal Life",
    "Eternal Life Embassy",
    "Nigerian church",
    "sermons",
    "messages",
    "Bible teaching",
    "Christian church",
  ],
  authors: [{ name: "Full Manifestation of Eternal Life" }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
    images: [
      {
        url: "/images/fmeli/word-preaching.jpg",
        width: 1200,
        height: 630,
        alt: "Preaching the unveiled Word at FMELi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/images/fmeli/word-preaching.jpg"],
  },
  // Favicon + apple-touch-icon are handled by the file-based
  // convention: src/app/icon.png and src/app/apple-icon.png are
  // picked up automatically by Next.js without needing to be
  // declared here.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
