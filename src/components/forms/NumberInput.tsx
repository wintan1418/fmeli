import { inputClass } from ".";
import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function NumberInput({ className, ...props }: Props) {
  return (
    <input
      {...props}
      type="number"
      min={props.min ?? 0}
      placeholder={props.placeholder ?? "0"}
      className={cn(inputClass, className)}
    />
  );
}
