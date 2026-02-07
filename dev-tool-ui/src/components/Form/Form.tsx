import type { FormHTMLAttributes } from "react";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  children: React.ReactNode;
}

export function Form({ className = "", children, ...rest }: FormProps) {
  return (
    <form className={className} {...rest}>
      {children}
    </form>
  );
}

export default Form;
