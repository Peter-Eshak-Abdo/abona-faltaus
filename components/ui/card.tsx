import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-lg shadow p-4 border border-gray-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
