import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

export function ParkingMapSkeleton() {
  return (
    <div className="space-y-4">
      {/* Карта */}
      <Card className="relative overflow-hidden">
        <Skeleton className="w-full h-96" />
      </Card>

      {/* Список парковок */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ParkingLayoutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          {/* Сетка мест */}
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 120 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ActiveSessionSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>

      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 mb-6" />
      
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Информация о пользователе */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="my-4 h-px bg-border" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>
      </Card>

      {/* Настройки */}
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="w-11 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Способы оплаты */}
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-20 w-full" />
      </Card>

      {/* Кнопки */}
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}
