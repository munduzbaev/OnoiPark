import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ActiveParkingSession } from "./ActiveParkingSession";
import { Clock, Calendar, Car, MapPin, Timer } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface Booking {
  id: string;
  userId: string;
  plateNumber: string;
  parkingId: string;
  spotNumber: number;
  createdAt: string;
  expiresAt: string;
  status: string;
}

interface ActiveSessionManagerProps {
  session: any | null;
  parking: any | null;
  onEndSession: () => void;
  accessToken: string;
}

export function ActiveSessionManager({
  session,
  parking,
  onEndSession,
  accessToken,
}: ActiveSessionManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadBookings();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      loadBookings(); // Обновляем бронирования каждую секунду
    }, 1000);

    return () => clearInterval(timer);
  }, [accessToken]);

  const loadBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/bookings/list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.bookings) {
        // Фильтруем только активные бронирования
        const activeBookings = data.bookings.filter((b: Booking) => {
          const expiresAt = new Date(b.expiresAt);
          return expiresAt > currentTime && b.status === 'active';
        });
        setBookings(activeBookings);
      }
    } catch (error) {
      console.error("Ошибка загрузки бронирований:", error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/bookings/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка отмены бронирования");
        return;
      }

      toast.success("Бронирование отменено");
      loadBookings();
    } catch (error) {
      console.error("Ошибка отмены бронирования:", error);
      toast.error("Не удалось отменить бронирование");
    }
  };

  // Генерация кода места
  const getSpotCode = (spotNumber: number) => {
    const row = Math.floor((spotNumber - 1) / 2);
    const position = ((spotNumber - 1) % 2) + 1;
    const rowLetter = String.fromCharCode(65 + row);
    return `${rowLetter}${position}`;
  };

  // Форматирование оставшегося времени
  const formatTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const remaining = expires.getTime() - currentTime.getTime();
    
    if (remaining <= 0) return "Истекло";
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}м ${seconds}с`;
  };

  const hasActiveSession = session && parking;
  const hasBookings = bookings.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue={hasActiveSession ? "active" : "bookings"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="relative">
            <Clock className="w-4 h-4 mr-2" />
            Активная
            {hasActiveSession && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="relative">
            <Calendar className="w-4 h-4 mr-2" />
            Бронирования
            {hasBookings && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                {bookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {hasActiveSession ? (
            <ActiveParkingSession
              session={session}
              parking={parking}
              onEndSession={onEndSession}
            />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">Нет активной парковки</h3>
              <p className="text-muted-foreground mb-6">
                У вас нет активных парковочных сессий
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const expiresAt = new Date(booking.expiresAt);
                const timeRemaining = formatTimeRemaining(booking.expiresAt);
                const isExpiringSoon = expiresAt.getTime() - currentTime.getTime() < 5 * 60 * 1000;
                const spotCode = getSpotCode(booking.spotNumber);

                return (
                  <Card
                    key={booking.id}
                    className={`p-4 ${
                      isExpiringSoon ? "border-orange-500 bg-orange-500/5" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={isExpiringSoon ? "destructive" : "default"}>
                            Место {spotCode}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Timer className="w-3 h-3 mr-1" />
                            {timeRemaining}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>ID парковки: {booking.parkingId}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Забронировано: {new Date(booking.createdAt).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {isExpiringSoon && (
                      <div className="mb-3 p-2 bg-orange-500/10 rounded text-xs text-orange-600">
                        ⚠️ Бронирование скоро истечёт! Поторопитесь на парковку.
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Отменить
                      </Button>
                      <Button size="sm" className="flex-1">
                        Сканировать QR
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2">Нет забронированных мест</h3>
                <p className="text-muted-foreground mb-6">
                  У вас нет активных бронирований. Забронируйте место на парковке!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
