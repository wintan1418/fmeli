import { inputClass } from ".";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: Props) {
  return <input {...props} className={cn(inputClass, className)} />;
}
