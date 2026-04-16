import { labelClass } from ".";

/**
 * Label + slot pair. Pair this with the input primitives to keep
 * spacing and label style consistent.
 *
 *   <FormField label="Email" htmlFor="email">
 *     <TextInput id="email" name="email" type="email" />
 *   </FormField>
 */
export function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-[color:var(--color-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}
