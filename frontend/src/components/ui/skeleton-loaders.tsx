import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome section skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
          </Card>
        ))}
      </div>

      {/* Two column layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity section */}
        <Card className="lg:col-span-2 p-6 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-6 backdrop-blur-md bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-slate-700 dark:border-slate-800 shadow-2xl">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-6 w-40 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
          <div className="space-y-3 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg bg-white/10" />
            ))}
          </div>
          <div className="pt-6 border-t border-white/10 space-y-3">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
            <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
          </div>
        </Card>
      </div>

      {/* Bottom card skeleton */}
      <Card className="p-8 backdrop-blur-md bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200/50 dark:border-blue-800/50 shadow-xl">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ClienteListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}

export function NegocioKanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Card key={j}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
