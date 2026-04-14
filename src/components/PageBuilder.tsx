import { HeroBanner } from "@/components/blocks/HeroBanner";
import { TextBlock } from "@/components/blocks/TextBlock";
import { CallToAction } from "@/components/blocks/CallToAction";
import { QuoteBlock } from "@/components/blocks/QuoteBlock";

/**
 * PageBuilder renders an array of Sanity section blocks by looking up each
 * block's _type in the sectionMap below.
 *
 * Registration rule — every new section type must be added:
 *   1. as a schema in sanity/schemas/sections/
 *   2. to the sections[] array in sanity/schemas/documents/page.ts
 *   3. to the sectionMap entry below
 *
 * Missing any one of these silently drops the block from either Studio or the
 * rendered page. See CLAUDE.md §"Page Builder — how it works".
 */

type SectionBlock = {
  _key: string;
  _type: string;
  [key: string]: unknown;
};

type SectionComponent = React.ComponentType<SectionBlock>;

const sectionMap: Record<string, SectionComponent> = {
  heroBanner: HeroBanner as SectionComponent,
  textBlock: TextBlock as SectionComponent,
  callToAction: CallToAction as SectionComponent,
  quoteBlock: QuoteBlock as SectionComponent,
};

export function PageBuilder({ sections }: { sections?: SectionBlock[] | null }) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section) => {
        const Component = sectionMap[section._type];
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[PageBuilder] No component registered for section type "${section._type}". ` +
                `Add it to src/components/PageBuilder.tsx sectionMap.`,
            );
          }
          return null;
        }
        return <Component key={section._key} {...section} />;
      })}
    </>
  );
}
