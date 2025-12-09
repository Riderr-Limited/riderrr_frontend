import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export const Button = ({ children, className = "", ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium ${className}`}
    >
      {children}
    </button>
  );
};
