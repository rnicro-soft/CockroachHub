import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="ph-label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`ph-input ${error ? "border-ph-red focus:border-ph-red focus:ring-ph-red" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-ph-red">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
