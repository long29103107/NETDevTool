import type { InputHTMLAttributes } from "react";

export type InputBorder = "default" | "none" | "subtle" | "strong";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  border?: InputBorder;
  error?: string | boolean;
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
  error,
  ...rest
}: InputProps) {
  const typeClass = typeClasses[type] ?? "px-2 py-1.5 w-full";
  
  const borderClass = error 
    ? "border border-red-500/50 focus:border-red-500" 
    : borderClasses[border];

  const combinedClassName = [
    baseClass,
    borderClass,
    typeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
        <input type={type} className={combinedClassName} {...rest} />
        {typeof error === 'string' && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
    </div>
  );
}

export default Input;
