interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "red" | "orange" | "default";
  className?: string;
}

const m: Record<string, string> = {
  green: "ph-badge-green",
  yellow: "ph-badge-yellow",
  red: "ph-badge-red",
  orange: "ph-badge-orange",
  default: "ph-badge-default",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return <span className={`${m[variant]} ${className}`}>{children}</span>;
}
