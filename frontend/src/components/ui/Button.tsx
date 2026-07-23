import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md";
}

const v = {
  primary: "ph-btn-primary",
  danger: "ph-btn-danger",
  ghost: "ph-btn-ghost",
  outline: "ph-btn-outline",
};
const s = { sm: "ph-btn-sm", md: "" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button ref={ref} className={`${v[variant]} ${s[size]} ${className}`} {...props}>
      {children}
    </button>
  )
);
Button.displayName = "Button";
