import type { LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: React.ReactNode;
}

export function Label({ className = "", children, ...rest }: LabelProps) {
  return (
    <label className={className} {...rest}>
      {children}
    </label>
  );
}

export default Label;
