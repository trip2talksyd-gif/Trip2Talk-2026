type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`}
      aria-hidden
    />
  )
}

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-editorial">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 bg-teal-900 p-4">
        <Skeleton className="h-8 w-28 bg-white/10" />
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-4/5 bg-white/10" />
        <Skeleton className="h-10 w-full rounded-editorial bg-white/10" />
      </div>
    </div>
  )
}

export function ListRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl bg-neutral-800" />
      ))}
    </div>
  )
}

export function HomeFeaturedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}
