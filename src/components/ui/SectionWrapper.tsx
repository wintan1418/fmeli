import { cn } from "@/lib/utils";
import { Container } from "./Container";

type Tone = "default" | "blue" | "blue-deep" | "white";

type Props = {
  as?: "section" | "div" | "header" | "footer";
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
};

const toneClass: Record<Tone, string> = {
  default: "bg-(--color-off-white) text-(--color-ink-soft)",
  blue: "bg-(--color-brand-blue) text-(--color-brand-white)",
  "blue-deep": "bg-(--color-brand-blue-deep) text-(--color-brand-white)",
  white: "bg-(--color-brand-white) text-(--color-ink-soft)",
};

export function SectionWrapper({
  as: Tag = "section",
  tone = "default",
  className,
  containerClassName,
  children,
  id,
}: Props) {
  return (
    <Tag
      id={id}
      className={cn("py-20 md:py-28", toneClass[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}
