import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-lg border border-[#E5E2DC] bg-white px-3 py-1 text-sm text-[#111318] transition-colors placeholder:text-[#8A909B] caret-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:placeholder:text-[#6B7280] dark:caret-[#3B82F6] dark:focus-visible:ring-[#3B82F6]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[70px] w-full rounded-lg border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#111318] transition-colors placeholder:text-[#8A909B] caret-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:placeholder:text-[#6B7280] dark:caret-[#3B82F6] dark:focus-visible:ring-[#3B82F6]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full appearance-none rounded-lg border border-[#E5E2DC] bg-white px-3 py-1 text-sm text-[#111318] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:focus-visible:ring-[#3B82F6] [&>option]:bg-white [&>option]:text-[#111318] dark:[&>option]:bg-[#14161B] dark:[&>option]:text-[#F4F4F6]",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-[#111318] dark:text-[#F4F4F6]",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";
