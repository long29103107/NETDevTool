import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "listItem";
export type ButtonBorder = "default" | "none" | "subtle" | "strong";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  selected?: boolean;
  border?: ButtonBorder;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "px-4 py-2 bg-[#646cff] text-white rounded font-medium text-sm hover:bg-[#535bf2] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "px-4 py-1.5 bg-[rgba(255,255,255,0.1)] text-white rounded font-medium text-sm hover:bg-[rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
  ghost:
    "px-4 py-2 text-white rounded font-medium text-sm hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed",
  listItem:
    "w-full text-left px-3 py-2 text-sm block hover:bg-[rgba(255,255,255,0.06)]",
};

const borderClasses: Record<ButtonBorder, string> = {
  default: "border border-[rgba(255,255,255,0.15)]",
  none: "border-0",
  subtle: "border border-[rgba(255,255,255,0.08)]",
  strong: "border border-[rgba(255,255,255,0.25)]",
};

const listItemSelectedClass = "bg-[rgba(100,108,255,0.2)] text-[#646cff]";

export function Button({
  variant = "primary",
  selected = false,
  border = "none",
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const baseClass = variantClasses[variant];
  const borderClass = borderClasses[border];
  const selectedClass =
    variant === "listItem" && selected ? listItemSelectedClass : "";
  const combinedClassName = [baseClass, borderClass, selectedClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={combinedClassName} {...rest}>
      {children}
    </button>
  );
}

export default Button;
