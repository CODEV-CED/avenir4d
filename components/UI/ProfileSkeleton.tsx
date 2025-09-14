export function ProfileBadgesSkeleton({ className = '' }: { className?: string }) {
  return (
    <section className={`animate-pulse space-y-4 ${className}`}>
      {/* Badges skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-gray-200"
            style={{ width: `${80 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Keywords skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-6 rounded bg-gray-100"
              style={{ width: `${40 + Math.random() * 60}px` }}
            />
          ))}
        </div>
      </div>

      {/* Quality indicator skeleton */}
      <div className="border-t border-gray-100 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-3 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}

export function ProfileCompactSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex animate-pulse items-center gap-2 ${className}`}>
      <div className="h-4 w-16 rounded bg-gray-200" />
      <div className="h-1 w-1 rounded-full bg-gray-300" />
      <div className="h-4 w-12 rounded bg-gray-200" />
      <div className="h-1 w-1 rounded-full bg-gray-300" />
      <div className="h-4 w-8 rounded bg-gray-200" />
    </div>
  );
}
