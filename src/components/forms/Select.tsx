import { inputClass } from ".";
import { cn } from "@/lib/utils";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: Props) {
  return (
    <select {...props} className={cn(inputClass, className)}>
      {children}
    </select>
  );
}
