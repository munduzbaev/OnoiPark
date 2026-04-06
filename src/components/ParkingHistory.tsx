import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Download,
  Car,
} from "lucide-react";

interface HistoryItem {
  id: string;
  spotName: string;
  address: string;
  date: Date;
  duration: number;
  cost: number;
  vehiclePlate: string;
}

interface ParkingHistoryProps {
  history: HistoryItem[];
}

export function ParkingHistory({ history }: ParkingHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2">Нет истории парковок</h3>
        <p className="text-muted-foreground">
          Ваши прошлые парковочные сессии появятся здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2>История парковок</h2>
          <p className="text-sm text-muted-foreground">
            {history.length} {history.length === 1 ? "сессия" : history.length < 5 ? "сессии" : "сессий"}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Экспорт
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="p-4 bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="mb-1">{item.spotName}</h4>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item.address}</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Завершено
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {item.date.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{item.duration}ч</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="w-4 h-4" />
                  <span>{item.vehiclePlate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-primary">{item.cost === 0 ? "Бесплатно" : `${item.cost} с`}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
