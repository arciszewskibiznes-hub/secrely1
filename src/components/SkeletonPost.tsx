import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonPost() {
  return (
    <div className="card-base overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mx-0 aspect-[4/3]" style={{ borderRadius: 0 }} />
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex gap-1.5 mt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function SkeletonCreatorCard() {
  return (
    <div className="card-base overflow-hidden">
      <Skeleton className="h-28 rounded-none" />
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-6 mb-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-border">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
