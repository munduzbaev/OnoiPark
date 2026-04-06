import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Navigation, Car, Clock } from "lucide-react";
import { DoubleGisMap } from "./DoubleGisMap";

interface Parking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalSpots: number;
  availableSpots: number;
  price: number;
  features: string[];
}

interface ParkingMapProps {
  parkings: Parking[];
  onSelectParking: (parking: Parking) => void;
}

export function ParkingMap({ parkings, onSelectParking }: ParkingMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Координаты центра карты (Ош, Кыргызстан)
  const centerLat = 40.5283;
  const centerLng = 72.7985;

  const handleSelect = (parking: Parking) => {
    setSelectedId(parking.id);
    onSelectParking(parking);
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percent = (available / total) * 100;
    if (percent > 50) return "bg-green-500";
    if (percent > 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Конвертируем парковки в маркеры для 2ГИС
  const mapMarkers = parkings.map(parking => ({
    lat: parking.lat,
    lng: parking.lng,
    title: `${parking.name} (${parking.availableSpots}/${parking.totalSpots} мест)`,
    onClick: () => handleSelect(parking),
  }));

  return (
    <div className="space-y-4">
      {/* Карта 2ГИС */}
      <Card className="relative overflow-hidden">
        <DoubleGisMap
          center={[centerLat, centerLng]}
          zoom={13}
          markers={mapMarkers}
          className="w-full h-96"
        />
        
        {/* Легенда */}
        <div className="absolute top-0 left-4 bg-card/90 backdrop-blur rounded-lg p-3 shadow-lg border border-primary/20 z-10 safe-area-top pt-4">
          <p className="text-xs mb-2">Доступность мест:</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>&gt;50% свободно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>20-50% свободно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>&lt;20% свободно</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Список парковок */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {parkings.map((parking) => {
          const isSelected = selectedId === parking.id;
          
          return (
            <Card
              key={parking.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => handleSelect(parking)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="flex-1">{parking.name}</h4>
                <Badge
                  variant={
                    parking.availableSpots > parking.totalSpots * 0.5
                      ? "default"
                      : parking.availableSpots > parking.totalSpots * 0.2
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {parking.availableSpots}/{parking.totalSpots}
                </Badge>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{parking.address}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>100 с/час</span>
                </div>
                <Button size="sm" variant={isSelected ? "default" : "outline"}>
                  {isSelected ? "Выбрано" : "Выбрать"}
                </Button>
              </div>

              {parking.features && parking.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {parking.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}