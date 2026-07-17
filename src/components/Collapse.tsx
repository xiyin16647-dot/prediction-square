"use client";

import { useState, type ReactNode } from "react";

interface CollapseProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapse({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapseProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mx-[18px] mb-3 bg-surface border border-line rounded-2xl overflow-hidden font-sans">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-text font-semibold text-[14px] hover:bg-surface-alt transition-colors"
      >
        <span>
          {icon && <span className="mr-1.5">{icon}</span>}
          {title}
        </span>
        <span
          className={`text-sub text-[12px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-line text-[13px] text-text leading-[1.65]">
          {children}
        </div>
      )}
    </div>
  );
}
