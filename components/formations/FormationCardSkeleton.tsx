// /components/formations/FormationCardSkeleton.tsx
export default function FormationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mb-3 h-4 w-56 rounded bg-gray-200" />
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="h-6 rounded bg-gray-200" />
        <div className="h-6 rounded bg-gray-200" />
        <div className="h-6 rounded bg-gray-200" />
        <div className="h-6 rounded bg-gray-200" />
      </div>
      <div className="h-9 w-32 rounded bg-gray-200" />
    </div>
  );
}
