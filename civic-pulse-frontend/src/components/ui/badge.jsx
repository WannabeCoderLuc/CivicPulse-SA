import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-900/40 text-blue-400 border-blue-800",
        urgent: "bg-red-900/40 text-red-400 border-red-800",
        completed: "bg-green-900/40 text-green-400 border-green-800",
        inProgress: "bg-amber-900/40 text-amber-400 border-amber-800",
        verified: "bg-purple-900/40 text-purple-400 border-purple-800",
        assigned: "bg-cyan-900/40 text-cyan-400 border-cyan-800",
        outline: "border-gray-700 text-gray-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
