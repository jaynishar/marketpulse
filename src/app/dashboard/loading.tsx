import { Zap } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Indices Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
      </div>

      {/* Sentiment Skeleton */}
      <Skeleton className="h-32 w-full" />

      {/* Scanner Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-card animate-pulse border border-border rounded-2xl ${className}`} />
  );
}
