import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "lg" | "sm";
  loading?: boolean;
};

export function Button({ className, asChild, variant = "default", size = "default", loading = false, ...props }: ButtonProps) {
  const variantClass =
    variant === "destructive"
      ? "bg-red-500 text-white hover:bg-red-600"
      : variant === "outline"
      ? "bg-transparent border border-gray-300 text-gray-900 hover:bg-gray-100"
      : variant === "ghost"
      ? "bg-transparent text-gray-900 hover:bg-gray-100"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";
  const sizeClass =
    size === "lg"
      ? "px-6 py-3 text-base"
      : size === "sm"
      ? "px-2 py-1 text-xs"
      : "px-4 py-2 text-sm";
  if (asChild) {
    const child = React.Children.only(props.children);
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      return React.cloneElement(element, {
        className: cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50",
          variantClass,
          sizeClass,
          className,
          element.props.className
        ),
        ...props,
        disabled: loading || props.disabled,
        children: (
          <>
            {loading && (
              <span className="mr-2 animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle"></span>
            )}
            {element.props.children}
          </>
        ),
      });
    }
    // fallback: return child as-is if not valid element
    return child;
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50",
        variantClass,
        sizeClass,
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="mr-2 animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle"></span>
      )}
      {props.children}
    </button>
  );
}
