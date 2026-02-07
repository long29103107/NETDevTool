import type { InputHTMLAttributes } from "react";

export type InputBorder = "default" | "none" | "subtle" | "strong";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  border?: InputBorder;
}

const baseClass =
  "bg-[#1a1a1a] rounded text-sm font-mono text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed";

const borderClasses: Record<InputBorder, string> = {
  default: "border border-[rgba(255,255,255,0.15)]",
  none: "border-0",
  subtle: "border border-[rgba(255,255,255,0.08)]",
  strong: "border border-[rgba(255,255,255,0.25)]",
};

const typeClasses: Partial<Record<string, string>> = {
  checkbox: "mt-1.5 rounded",
  "number": "px-2 py-1.5 w-full",
  "text": "px-2 py-1.5 w-full",
  "url": "px-3 py-1.5 flex-1",
};

export function Input({
  className = "",
  type = "text",
  border = "default",
  ...rest
}: InputProps) {
  const typeClass = typeClasses[type] ?? "px-2 py-1.5 w-full";
  const combinedClassName = [
    baseClass,
    borderClasses[border],
    typeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input type={type} className={combinedClassName} {...rest} />;
}

export default Input;
