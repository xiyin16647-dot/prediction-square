"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  toggleClassName?: string;
};

export function PasswordInput({
  className,
  toggleClassName,
  style,
  ...rest
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...rest}
        type={show ? "text" : "password"}
        className={className}
        style={{ ...style, paddingRight: 56 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] hover:opacity-80 select-none font-semibold ${
          toggleClassName ?? "text-sub"
        }`}
        aria-label={show ? "隐藏密码" : "显示密码"}
      >
        {show ? "隐藏" : "显示"}
      </button>
    </div>
  );
}
