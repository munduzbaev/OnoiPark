import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { MapPin, Check, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ParkingSpot {
  id: string;
  number: number;
  status: "available" | "occupied" | "booked";
  parkingId: string;
  bookedBy?: string;
}

interface SpotSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingId: string;
  parkingName: string;
  spots: ParkingSpot[];
  onConfirmSpot: (spotNumber: number, location: { lat: number; lng: number } | null) => void;
}

export function SpotSelection({
  open,
  onOpenChange,
  parkingId,
  parkingName,
  spots,
  onConfirmSpot,
}: SpotSelectionProps) {
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationWarning, setShowLocationWarning] = useState(false);

  // Генерация кода места (A1, A2, B1, B2 и т.д.)
  const getSpotCode = (spotNumber: number) => {
    const row = Math.floor((spotNumber - 1) / 2);
    const position = ((spotNumber - 1) % 2) + 1;
    const rowLetter = String.fromCharCode(65 + row);
    return `${rowLetter}${position}`;
  };

  const availableSpots = spots.filter(s => s.status === "available");

  const handleRequestLocation = () => {
    setIsRequestingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setIsRequestingLocation(false);
          toast.success("Местоположение получено");
        },
        (error) => {
          setIsRequestingLocation(false);
          console.error("Ошибка получения местоположения:", error);
          toast.error("Не удалось получить местоположение", {
            description: "Проверьте настройки разрешений браузера",
          });
        }
      );
    } else {
      setIsRequestingLocation(false);
      toast.error("Геолокация не поддерживается вашим браузером");
    }
  };

  const handleConfirm = () => {
    if (!selectedSpot) {
      toast.error("Выберите место для парковки");
      return;
    }
    
    if (userLocation) {
      // Симулируем проверку GPS (в реальном приложении здесь была бы проверка координат)
      // Для демо: случайным образом определяем, совпадает ли место
      const isCorrectLocation = Math.random() > 0.3; // 70% шанс, что место правильное
      
      if (!isCorrectLocation) {
        // GPS показывает другое место - показываем предупреждение
        setShowLocationWarning(true);
        return;
      }
    }
    
    onConfirmSpot(selectedSpot, userLocation);
  };

  const handleConfirmWithWarning = () => {
    if (selectedSpot) {
      setShowLocationWarning(false);
      onConfirmSpot(selectedSpot, userLocation);
    }
  };

  // SVG компонент машины
  const CarSVG = ({ color, isSelected }: { color: string; isSelected: boolean }) => (
    <svg width="32" height="48" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="56" rx="14" ry="3" fill="black" opacity="0.2"/>
      <path
        d="M12 10 L28 10 L32 50 L8 50 Z"
        fill={color}
        stroke={isSelected ? "#ffffff" : "rgba(0, 0, 0, 0.1)"}
        strokeWidth={isSelected ? "2" : "1"}
      />
      <rect x="13" y="12" width="14" height="8" rx="1" fill="rgba(0, 0, 0, 0.3)"/>
      <rect x="10" y="40" width="20" height="8" rx="1" fill="rgba(0, 0, 0, 0.3)"/>
      <rect x="6" y="16" width="3" height="8" rx="1.5" fill="#1f2937"/>
      <rect x="31" y="16" width="3" height="8" rx="1.5" fill="#1f2937"/>
      <rect x="6" y="36" width="3" height="8" rx="1.5" fill="#1f2937"/>
      <rect x="31" y="36" width="3" height="8" rx="1.5" fill="#1f2937"/>
      <circle cx="15" cy="8" r="1.5" fill="#fbbf24" opacity="0.8"/>
      <circle cx="25" cy="8" r="1.5" fill="#fbbf24" opacity="0.8"/>
    </svg>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выберите свободное место</DialogTitle>
          <DialogDescription>
            {parkingName} - {availableSpots.length} мест доступно
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Сетка свободных мест */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSpots.map((spot) => {
                const spotCode = getSpotCode(spot.number);
                const isSelected = selectedSpot === spot.number;
                
                return (
                  <Card
                    key={spot.id}
                    className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-lg"
                        : "bg-card hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedSpot(spot.number)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CarSVG 
                        color={isSelected ? "#7c3aed" : "#10b981"} 
                        isSelected={isSelected}
                      />
                      <Badge 
                        variant={isSelected ? "default" : "outline"}
                        className="text-xs"
                      >
                        {spotCode}
                      </Badge>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Запрос геолокации */}
            {selectedSpot && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="mb-1">Подтверждение местоположения</h4>
                      <p className="text-sm text-muted-foreground">
                        Разрешите доступ к геолокации для подтверждения, что вы припарковались на правильном месте
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleRequestLocation}
                    disabled={isRequestingLocation || !!userLocation}
                    variant={userLocation ? "outline" : "default"}
                    className="w-full"
                    size="sm"
                  >
                    {isRequestingLocation && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {userLocation && <Check className="w-4 h-4 mr-2" />}
                    {userLocation
                      ? "Местоположение получено"
                      : isRequestingLocation
                      ? "Получение местоположения..."
                      : "Разрешить доступ к местоположению"}
                  </Button>

                  {!userLocation && (
                    <p className="text-xs text-muted-foreground">
                      Вы можете продолжить без геолокации, но рекомендуется включить для точного подтверждения парковки
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Кнопки действий */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSpot}
            className="flex-1"
          >
            {selectedSpot 
              ? `Подтвердить место ${getSpotCode(selectedSpot)}`
              : "Выберите место"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Предупреждение о несовпадении GPS */}
    <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <AlertDialogTitle>Проверьте местоположение</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            GPS показывает, что вы можете находиться не на месте{" "}
            <strong>{selectedSpot ? getSpotCode(selectedSpot) : ""}</strong>.
            <br /><br />
            Вы действительно припарковались на этом месте?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setShowLocationWarning(false);
            toast.info("Выберите правильное место парковки");
          }}>
            Нет, выбрать другое
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmWithWarning}>
            Да, это правильное место
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
