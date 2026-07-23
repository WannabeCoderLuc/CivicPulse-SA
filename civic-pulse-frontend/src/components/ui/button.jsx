import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-civic-blue text-white hover:bg-blue-800 shadow",
        destructive: "bg-red-900/60 text-red-300 border border-red-800 hover:bg-red-900",
        outline: "border border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white",
        secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700",
        ghost: "text-gray-400 hover:text-white hover:bg-gray-800",
        link: "text-civic-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
