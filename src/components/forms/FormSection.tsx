/**
 * One bordered card containing related form fields. Most multi-section
 * forms (weekly report, assembly profile) stack three or four of these.
 */
export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[color:rgb(11_20_27/0.08)] bg-white p-7">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--color-ink)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-[color:var(--color-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
