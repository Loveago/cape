import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type Size = "default" | "sm" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] focus-visible:ring-[#1D4ED8] dark:focus-visible:ring-[#3B82F6]",
  destructive:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-[#EF4444] dark:hover:bg-[#DC2626] focus-visible:ring-[#DC2626] dark:focus-visible:ring-[#EF4444]",
  outline:
    "border border-[#E5E2DC] bg-white text-[#111318] hover:bg-[#F3F1EC] dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:hover:bg-[#1C1F26] focus-visible:ring-[#1D4ED8] dark:focus-visible:ring-[#3B82F6]",
  secondary:
    "bg-[#F3F1EC] text-[#111318] hover:bg-[#E5E2DC] dark:bg-[#1C1F26] dark:text-[#F4F4F6] dark:hover:bg-[#262A34] focus-visible:ring-[#1D4ED8] dark:focus-visible:ring-[#3B82F6]",
  ghost:
    "text-[#5A606B] hover:bg-[#F3F1EC] hover:text-[#111318] dark:text-[#949AA6] dark:hover:bg-[#1C1F26] dark:hover:text-[#F4F4F6] focus-visible:ring-[#1D4ED8] dark:focus-visible:ring-[#3B82F6]",
  link: "text-[#1D4ED8] underline-offset-4 hover:underline dark:text-[#3B82F6]",
};

const sizes: Record<Size, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-6 text-base",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F6] dark:focus-visible:ring-offset-[#0C0D10] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
