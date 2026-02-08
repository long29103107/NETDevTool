import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string | boolean;
  border?: "default" | "none" | "subtle" | "strong";
}

const baseClass =
  "bg-[#1a1a1a] rounded text-sm font-mono text-[rgba(255,255,255,0.9)] px-2 py-1.5 w-full disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer";

const borderClasses = {
  default: "border border-[rgba(255,255,255,0.15)]",
  none: "border-0",
  subtle: "border border-[rgba(255,255,255,0.08)]",
  strong: "border border-[rgba(255,255,255,0.25)]",
};

export function Select({
  options,
  className = "",
  error,
  border = "default",
  ...rest
}: SelectProps) {
  const borderClass = error
    ? "border border-red-500/50 focus:border-red-500"
    : borderClasses[border];

  const combinedClassName = [
    baseClass,
    borderClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full relative">
      <select className={combinedClassName} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-[rgba(255,255,255,0.4)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {typeof error === "string" && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default Select;
