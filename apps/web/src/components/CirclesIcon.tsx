import type { SVGProps } from "react";

/** Custom Circles tab icon: three overlapping circles, drawn like a Lucide icon. */
export function CirclesIcon({ size = 24, strokeWidth = 1.75, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="8.5" r="5" />
      <circle cx="8.5" cy="14.5" r="5" />
      <circle cx="15.5" cy="14.5" r="5" />
    </svg>
  );
}
