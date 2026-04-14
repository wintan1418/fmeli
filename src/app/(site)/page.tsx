import { HeroSlider } from "@/components/sections/HeroSlider";
import { AnnouncementTicker } from "@/components/sections/AnnouncementTicker";
import { NextServiceBanner } from "@/components/sections/NextServiceBanner";
import { WelcomeNote } from "@/components/sections/WelcomeNote";
import { LiveStats } from "@/components/sections/LiveStats";
import { MeetingsGrid } from "@/components/sections/MeetingsGrid";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { FeaturedSermons } from "@/components/sections/FeaturedSermons";
import { ScripturePullquote } from "@/components/sections/ScripturePullquote";
import { AssembliesBand } from "@/components/sections/AssembliesBand";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";

/**
 * Phase 0.75 homepage: dense composition with all the section components
 * the team will edit from the admin panel. In Phase 2 each component here
 * will be wired to a Sanity query — the props stay the same, only the
 * source of the data changes.
 */
export default function Home() {
  return (
    <>
      <HeroSlider />
      <AnnouncementTicker />
      <NextServiceBanner />
      <WelcomeNote />
      <LiveStats />
      <MeetingsGrid />
      <UpcomingEvents />
      <FeaturedSermons />
      <ScripturePullquote />
      <AssembliesBand />
      <NewsletterCTA />
    </>
  );
}
