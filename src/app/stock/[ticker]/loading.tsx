export default function StockLoading() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="h-16 border-b border-border bg-card/50 flex items-center px-4 mb-8">
        <Skeleton className="h-8 w-64" />
      </div>
      
      <main className="container max-w-7xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="lg:col-span-2 h-32" />
        </div>
        
        <Skeleton className="h-[500px] w-full" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </main>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-card animate-pulse border border-border rounded-2xl ${className}`} />
  );
}
