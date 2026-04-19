import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "dark",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "dark" | "light" | "line" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm transition disabled:opacity-50",
        variant === "dark" && "bg-ink text-paper hover:bg-ink/88",
        variant === "light" && "bg-paper text-ink hover:bg-bone",
        variant === "line" && "border border-ink/15 bg-transparent text-ink hover:bg-ink/5",
        className
      )}
      {...props}
    />
  );
}
