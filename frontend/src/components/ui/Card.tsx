import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border ${hover ? "hover:border-ph-border dark:hover:border-ph-border-hover" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
