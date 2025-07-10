import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";
