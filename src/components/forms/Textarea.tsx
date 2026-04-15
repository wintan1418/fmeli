import { inputClass } from ".";
import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={cn(inputClass, className)}
    />
  );
}
