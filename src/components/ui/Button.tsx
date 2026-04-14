import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

const variantClass: Record<Variant, string> = {
  primary:
    "bg-(--color-brand-red) text-(--color-brand-white) hover:bg-[color-mix(in_srgb,var(--color-brand-red)_88%,black)] focus-visible:ring-(--color-brand-red-soft)",
  secondary:
    "bg-(--color-brand-white) text-(--color-brand-blue-deep) border border-(--color-brand-blue-soft) hover:bg-(--color-brand-blue-soft) focus-visible:ring-(--color-brand-blue-soft)",
  ghost:
    "bg-transparent text-(--color-brand-white) border border-(--color-brand-white)/40 hover:bg-(--color-brand-white)/10 focus-visible:ring-(--color-brand-white)/40",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-off-white) disabled:opacity-50 disabled:cursor-not-allowed";

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;
  const classes = cn(base, variantClass[variant], sizeClass[size], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
