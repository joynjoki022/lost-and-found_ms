"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-sm font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "border-gold text-gold hover:bg-gold hover:text-bg-dark focus-visible:ring-gold",
    secondary:
      "border-gold-dark text-gold-light hover:bg-gold-dark hover:text-bg-dark focus-visible:ring-gold-dark",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="text-current" aria-hidden="true">&gt;</span>
      {loading ? (
        <span className="inline-flex items-center gap-1">
          Processing
          <span className="animate-pulse" aria-hidden="true">▊</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
