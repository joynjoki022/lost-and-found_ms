"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  showDots?: boolean;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  title,
  showDots = true,
  children,
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "border border-gold/20 bg-bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50",
        className
      )}
    >
      {(showDots || title) && (
        <div className="flex items-center gap-2 border-b border-gold/20 px-4 py-2.5">
          {showDots && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            </div>
          )}
          {title && (
            <span className="ml-2 font-mono text-xs text-text-dim">
              {title}
            </span>
          )}
        </div>
      )}

      <div className={paddingMap[padding]}>{children}</div>
    </div>
  );
}
