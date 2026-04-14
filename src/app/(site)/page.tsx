import { HeroSlider } from "@/components/sections/HeroSlider";
import { AnnouncementTicker } from "@/components/sections/AnnouncementTicker";
import { NextServiceBanner } from "@/components/sections/NextServiceBanner";
import { WelcomeNote } from "@/components/sections/WelcomeNote";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { LiveStats } from "@/components/sections/LiveStats";
import { MeetingsGrid } from "@/components/sections/MeetingsGrid";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { FeaturedSermons } from "@/components/sections/FeaturedSermons";
import { ScripturePullquote } from "@/components/sections/ScripturePullquote";
import { AssembliesBand } from "@/components/sections/AssembliesBand";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <AnnouncementTicker />
      <NextServiceBanner />
      <WelcomeNote />
      <PillarsSection />
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
