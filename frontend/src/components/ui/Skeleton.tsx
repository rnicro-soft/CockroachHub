interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  const base = `animate-pulse bg-gray-200 dark:bg-ph-card-hover ${className}`;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={base} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-ph-dark-2 border border-ph-border-light dark:border-ph-border p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ThumbSkeleton() {
  return (
    <div className="block">
      <div className="relative w-full bg-gray-100 dark:bg-ph-dark" style={{ aspectRatio: "16/9" }}>
        <Skeleton className="absolute inset-0" />
      </div>
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-3 w-1/3 mt-1" />
    </div>
  );
}
