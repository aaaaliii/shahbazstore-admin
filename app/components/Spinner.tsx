"use client";

import { useId } from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const gradientId = `spinner-${useId().replace(/:/g, "-")}`;

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
          gradientTransform="rotate(126)"
        >
          <stop offset="0%" stopColor="#ffa8a8" />
          <stop offset="36%" stopColor="#700e77" />
          <stop offset="70%" stopColor="#700e77" />
        </linearGradient>
      </defs>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={`url(#${gradientId})`}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface PageSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function PageSpinner({
  message,
  fullScreen = false,
  className = "",
}: PageSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      } ${className}`}
    >
      <Spinner size="lg" className={className} />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
