import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  MapPin,
  AlertCircle,
  Navigation,
} from "lucide-react";

interface ActiveParkingSessionProps {
  session: {
    id: string;
    parkingId: string;
    spotNumber: number | null;
    plateNumber: string;
    startTime: string;
    freeUntil: string;
    status: string;
    cost: number;
  };
  parking: {
    name: string;
    address: string;
    price: number;
  };
  onEndSession: () => void;
}

export function ActiveParkingSession({
  session,
  parking,
  onEndSession,
}: ActiveParkingSessionProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Генерация кода места
  const getSpotCode = (spotNumber: number) => {
    const row = Math.floor((spotNumber - 1) / 2);
    const position = ((spotNumber - 1) % 2) + 1;
    const rowLetter = String.fromCharCode(65 + row);
    return `${rowLetter}${position}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startTime = new Date(session.startTime);
  const freeUntil = new Date(session.freeUntil);
  
  const totalFreeTime = freeUntil.getTime() - startTime.getTime();
  const elapsedTime = currentTime.getTime() - startTime.getTime();
  const freeTimeRemaining = Math.max(0, freeUntil.getTime() - currentTime.getTime());
  
  const isFree = currentTime < freeUntil;
  const freeProgress = Math.min((elapsedTime / totalFreeTime) * 100, 100);

  // Расчет текущей стоимости
  let currentCost = 0;
  if (!isFree) {
    const paidMilliseconds = currentTime.getTime() - freeUntil.getTime();
    const paidHours = Math.ceil(paidMilliseconds / (1000 * 60 * 60));
    currentCost = paidHours * parking.price;
  }

  // Форматирование времени для таймера (MM:SS)
  const formatTimer = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}M : ${seconds.toString().padStart(2, '0')}S`;
  };

  // Форматирование полного времени
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    }
    return `${minutes}м ${seconds}с`;
  };

  const isExpiringSoon = freeTimeRemaining < 15 * 60 * 1000 && freeTimeRemaining > 0;

  // SVG компонент машины для круга
  const CarInCircle = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Внешний круг */}
      <circle cx="60" cy="60" r="58" stroke="url(#gradient)" strokeWidth="4" fill="none"/>
      
      {/* Градиент для круга */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      
      {/* Машина в центре */}
      <g transform="translate(35, 25)">
        {/* Кузов */}
        <path
          d="M10 15 L10 10 Q10 5 15 5 L35 5 Q40 5 40 10 L40 15 L45 20 L45 55 Q45 60 40 60 L10 60 Q5 60 5 55 L5 20 Z"
          fill="#ffffff"
        />
        
        {/* Лобовое стекло */}
        <path
          d="M13 13 L13 8 Q13 7 14 7 L36 7 Q37 7 37 8 L37 13 Z"
          fill="rgba(124, 58, 237, 0.3)"
        />
        
        {/* Заднее стекло */}
        <rect x="13" y="50" width="24" height="8" rx="1" fill="rgba(124, 58, 237, 0.3)"/>
        
        {/* Колеса */}
        <rect x="3" y="23" width="6" height="10" rx="3" fill="#1f2937"/>
        <rect x="41" y="23" width="6" height="10" rx="3" fill="#1f2937"/>
        <rect x="3" y="43" width="6" height="10" rx="3" fill="#1f2937"/>
        <rect x="41" y="43" width="6" height="10" rx="3" fill="#1f2937"/>
      </g>
    </svg>
  );

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Круглый дизайн с машиной и таймером */}
      <Card className="p-8 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="flex flex-col items-center">
          {/* Машина в круге */}
          <div className="relative mb-6">
            <CarInCircle />
            
            {/* Анимированный пульсирующий круг */}
            {isFree && (
              <div className="absolute inset-0 animate-ping opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="58" stroke="#7c3aed" strokeWidth="4" fill="none"/>
                </svg>
              </div>
            )}
          </div>

          {/* Таймер */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2 tracking-wider">
              {formatTimer(isFree ? freeTimeRemaining : elapsedTime)}
            </div>
            <Badge variant={isFree ? "default" : "secondary"} className="text-sm">
              {isFree ? "БЕСПЛАТНОЕ ВРЕМЯ" : "ПЛАТНАЯ ЗОНА"}
            </Badge>
          </div>

          {/* Прогресс бар */}
          {isFree && (
            <div className="w-full mb-4">
              <Progress value={freeProgress} className="h-2" />
            </div>
          )}

          {/* Информация о парковке */}
          <div className="text-center mb-4">
            <h3 className="mb-1">{parking.name}</h3>
            {session.spotNumber && (
              <p className="text-muted-foreground">
                Место {getSpotCode(session.spotNumber)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{parking.address}</span>
          </div>
        </div>

        {/* Предупреждение об истечении времени */}
        {isExpiringSoon && (
          <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm mb-1">
                Внимание! Бесплатное время заканчивается
              </p>
              <p className="text-xs text-muted-foreground">
                После истечения бесплатного часа начнётся тарификация по {parking.price} с/час
              </p>
            </div>
          </div>
        )}

        {/* Стоимость для платной зоны */}
        {!isFree && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">Текущая стоимость:</span>
              <span className="text-3xl">{currentCost} с</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Тариф: {parking.price} с/час
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Время парковки: {formatTime(elapsedTime)}
            </p>
          </div>
        )}
      </Card>

      {/* Информация об автомобиле */}
      <Card className="p-4 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Автомобиль</div>
            <div className="text-lg">{session.plateNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Начало</div>
            <div className="text-lg">
              {startTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </Card>

      {/* Кнопки действий */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full">
          <Navigation className="w-4 h-4 mr-2" />
          Навигация
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-primary to-accent">
              Завершить
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Завершить парковочную сессию?</AlertDialogTitle>
              <AlertDialogDescription>
                {isFree ? (
                  <span>
                    Ваша парковка была бесплатной. Вы уверены, что хотите завершить сессию?
                  </span>
                ) : (
                  <span>
                    С вас будет списано <strong>{currentCost} с</strong> за парковку.
                    Время парковки: {formatTime(elapsedTime)}.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={onEndSession}>
                {isFree ? "Завершить" : "Оплатить и завершить"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Информация */}
      <Card className="p-4 bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Важно:</strong> Первый час парковки бесплатный. После этого
            автоматически начинается почасовая тарификация.
          </p>
          <p>
            Оплата производится при завершении парковки или автоматически при выезде.
          </p>
        </div>
      </Card>
    </div>
  );
}
