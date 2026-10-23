import { Skeleton } from "@/components/ui/skeleton";

/** Panel sayfaları yüklenirken gösterilen iskelet (loading.tsx) */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor" className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-40 w-full rounded-[28px]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-[22px]" />
        <Skeleton className="h-48 rounded-[22px]" />
      </div>
    </div>
  );
}
