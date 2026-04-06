import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ParkingSpot {
  id: string;
  number: number;
  status: "available" | "occupied" | "booked";
  parkingId: string;
  bookedBy?: string;
}

interface ParkingLayoutProps {
  parking: {
    id: string;
    name: string;
    totalSpots: number;
    availableSpots: number;
  };
  spots: ParkingSpot[];
  onSelectSpot: (spotNumber: number) => void;
  selectedSpot: number | null;
}

export function ParkingLayout({
  parking,
  spots,
  onSelectSpot,
  selectedSpot,
}: ParkingLayoutProps) {
  const [currentFloor, setCurrentFloor] = useState(1);
  const totalFloors = 3;
  
  // Разделяем места по этажам (40 мест на этаж)
  const spotsPerFloor = 40;
  const floorSpots = spots.slice(
    (currentFloor - 1) * spotsPerFloor,
    currentFloor * spotsPerFloor
  );

  const availableCount = floorSpots.filter(s => s.status === "available").length;
  const occupiedCount = floorSpots.filter(s => s.status === "occupied").length;
  const bookedCount = floorSpots.filter(s => s.status === "booked").length;

  const getCarColor = (spot: ParkingSpot, isSelected: boolean) => {
    if (isSelected) return "#7c3aed"; // фиолетовый для выбранного
    
    switch (spot.status) {
      case "available":
        return "#10b981"; // зеленый
      case "booked":
        return "#f59e0b"; // желтый
      case "occupied":
        return "#ef4444"; // красный
      default:
        return "#6b7280";
    }
  };

  // Генерация кода места (A1, A2, B1, B2 и т.д.)
  const getSpotCode = (spotNumber: number) => {
    const row = Math.floor((spotNumber - 1) / 2);
    const position = ((spotNumber - 1) % 2) + 1;
    const rowLetter = String.fromCharCode(65 + row); // A, B, C, D...
    return `${rowLetter}${position}`;
  };

  // SVG компонент машины (вид сверху под углом) - как на картинке
  const CarSVG = ({ color, onClick, disabled }: { color: string; onClick?: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'}`}
    >
      <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Тень */}
        <ellipse cx="20" cy="56" rx="14" ry="3" fill="black" opacity="0.2"/>
        
        {/* Основной кузов - простая трапеция */}
        <path
          d="M12 10 L28 10 L32 50 L8 50 Z"
          fill={color}
          stroke={color === "#7c3aed" ? "#ffffff" : "rgba(0, 0, 0, 0.1)"}
          strokeWidth={color === "#7c3aed" ? "2" : "1"}
        />
        
        {/* Лобовое стекло */}
        <rect x="13" y="12" width="14" height="8" rx="1" fill="rgba(0, 0, 0, 0.3)"/>
        
        {/* Заднее стекло */}
        <rect x="10" y="40" width="20" height="8" rx="1" fill="rgba(0, 0, 0, 0.3)"/>
        
        {/* Левое колесо переднее */}
        <rect x="6" y="16" width="3" height="8" rx="1.5" fill="#1f2937"/>
        {/* Правое колесо переднее */}
        <rect x="31" y="16" width="3" height="8" rx="1.5" fill="#1f2937"/>
        
        {/* Левое колесо заднее */}
        <rect x="6" y="36" width="3" height="8" rx="1.5" fill="#1f2937"/>
        {/* Правое колесо заднее */}
        <rect x="31" y="36" width="3" height="8" rx="1.5" fill="#1f2937"/>
        
        {/* Фары */}
        <circle cx="15" cy="8" r="1.5" fill="#fbbf24" opacity="0.8"/>
        <circle cx="25" cy="8" r="1.5" fill="#fbbf24" opacity="0.8"/>
      </svg>
    </button>
  );

  // Расположение машин в 2 ряда с проездом посередине
  const leftRow = floorSpots.filter((_, idx) => idx < 20);
  const rightRow = floorSpots.filter((_, idx) => idx >= 20);

  return (
    <div className="space-y-4">
      {/* Навигация по этажам */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentFloor(Math.max(1, currentFloor - 1))}
            disabled={currentFloor === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Этаж {currentFloor - 1}
          </Button>
          
          <div className="text-center">
            <h3 className="mb-1">{currentFloor} Этаж</h3>
            <p className="text-sm text-muted-foreground">
              {availableCount} доступно
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentFloor(Math.min(totalFloors, currentFloor + 1))}
            disabled={currentFloor === totalFloors}
          >
            Этаж {currentFloor + 1}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-green-500/10 border-green-500/20">
          <div className="text-2xl text-center mb-1 text-green-500">{availableCount}</div>
          <div className="text-xs text-center text-muted-foreground">Свободно</div>
        </Card>
        <Card className="p-3 bg-orange-500/10 border-orange-500/20">
          <div className="text-2xl text-center mb-1 text-orange-500">{bookedCount}</div>
          <div className="text-xs text-center text-muted-foreground">Забронировано</div>
        </Card>
        <Card className="p-3 bg-red-500/10 border-red-500/20">
          <div className="text-2xl text-center mb-1 text-red-500">{occupiedCount}</div>
          <div className="text-xs text-center text-muted-foreground">Занято</div>
        </Card>
      </div>

      {/* Схема парковки */}
      <Card className="p-6 bg-gradient-to-b from-primary/20 to-primary/5">
        <ScrollArea className="h-[600px]">
          <div className="relative">
            {/* Указатель въезда */}
            <div className="text-center mb-4">
              <Badge variant="outline" className="bg-background/50">
                ⬇️ ВЪЕЗД
              </Badge>
            </div>

            <div className="flex gap-8 justify-center">
              {/* Левый ряд */}
              <div className="flex flex-col gap-3">
                {leftRow.map((spot, idx) => {
                  const isSelected = selectedSpot === spot.number;
                  const isClickable = spot.status === "available";
                  const spotCode = getSpotCode(spot.number);
                  
                  return (
                    <div key={spot.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-14 text-center bg-background/80 text-xs">
                        {spotCode}
                      </Badge>
                      <CarSVG
                        color={getCarColor(spot, isSelected)}
                        onClick={() => isClickable && onSelectSpot(spot.number)}
                        disabled={!isClickable}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Проезд посередине */}
              <div className="w-20 bg-muted/30 rounded-lg relative border-2 border-dashed border-muted-foreground/20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-xs text-muted-foreground opacity-50">
                  ПРОЕЗД
                </div>
              </div>

              {/* Правый ряд */}
              <div className="flex flex-col gap-3">
                {rightRow.map((spot, idx) => {
                  const isSelected = selectedSpot === spot.number;
                  const isClickable = spot.status === "available";
                  const spotCode = getSpotCode(spot.number);
                  
                  return (
                    <div key={spot.id} className="flex items-center gap-2">
                      <CarSVG
                        color={getCarColor(spot, isSelected)}
                        onClick={() => isClickable && onSelectSpot(spot.number)}
                        disabled={!isClickable}
                      />
                      <Badge variant="outline" className="w-14 text-center bg-background/80 text-xs">
                        {spotCode}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Указатель выезда */}
            <div className="text-center mt-4">
              <Badge variant="outline" className="bg-background/50">
                ⬆️ ВЫЕЗД
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Информация о выбранном месте */}
      {selectedSpot && (
        <Card className="p-4 bg-primary/10 border-primary">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="mb-1">Место {getSpotCode(selectedSpot)}</h4>
              <p className="text-sm text-muted-foreground">
                Готово к бронированию. Место будет зарезервировано на 15 минут.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Тариф</div>
              <div className="text-xl">100 с/час</div>
              <div className="text-xs text-muted-foreground">
                Первый час бесплатно
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
