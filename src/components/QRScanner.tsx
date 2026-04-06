import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { QrCode, Camera, Check } from "lucide-react";
import { supabase } from "@/supabase";



interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parkingId: string;
  onScanSuccess: (qrCode: string) => void;
}

export function QRScanner({
  open,
  onOpenChange,
  parkingId,
  onScanSuccess,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
const handleSimulateScan = async () => {
    setIsScanning(true);
    
    // Имитируем процесс сканирования на 2 секунды
    setTimeout(async () => {
      // 1. Тестовый номер машины из базы
      const mockScannedCarNumber = "01KG123ABC"; 

      // 2. Ищем бронь и запрашиваем имя через связь
      // as any отключает строгую типизацию, чтобы TS не ругался на users(full_name)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          car_number,
          has_reservation,
          users (
            full_name
          )
        `)
        .eq('car_number', mockScannedCarNumber)
        .eq('status', 'active')
        .single() as any; 

      setIsScanning(false);

      // 3. Если бронь не найдена или неактивна
      if (error || !data || data.has_reservation !== true) {
        alert("❌ Доступ запрещен! Бронь не найдена.");
        setScanned(false);
        onOpenChange(false);
        return;
      }

      // 4. Если бронь успешна — включаем зеленую галочку
      setScanned(true);
      
      // Вытягиваем имя юзера
      const driverName = data.users?.full_name || "Зарегистрированный гость";
      console.log("Заехал водитель:", driverName);

      // 5. Помечаем бронь как завершенную (чтобы монитор на КПП среагировал)
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', data.id);

      // 6. Закрываем модалку через секунду
      setTimeout(() => {
        onScanSuccess(`ONOIPARK-${parkingId}-${Date.now()}`);
        setScanned(false);
        onOpenChange(false);
      }, 1000);

    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Сканирование QR-кода</DialogTitle>
          <DialogDescription>
            Наведите камеру на QR-код на шлагбауме для подтверждения въезда
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Область сканирования */}
          <Card className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {/* Симуляция камеры */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isScanning && !scanned && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
                    <QrCode className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Нажмите кнопку ниже для сканирования
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="relative">
                  {/* Анимация сканирования */}
                  <div className="w-64 h-64 border-4 border-primary rounded-lg relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-scan" />
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white" />
                  </div>
                  <p className="text-sm text-white mt-4 text-center">
                    Сканирование...
                  </p>
                </div>
              )}

              {scanned && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-sm text-green-500">
                    QR-код успешно отсканирован!
                  </p>
                </div>
              )}
            </div>

            {/* Сетка для визуального эффекта */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="border border-white" />
                ))}
              </div>
            </div>
          </Card>

          {/* Кнопки управления */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isScanning}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSimulateScan}
              className="flex-1"
              disabled={isScanning || scanned}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isScanning ? "Сканирование..." : scanned ? "Готово" : "Сканировать"}
            </Button>
          </div>

          {/* Инструкция */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p>
              <strong>Инструкция:</strong> Найдите QR-код на въезде на парковку.
              Наведите камеру на код, чтобы автоматически начать парковочную сессию.
            </p>
          </div>
        </div>
      </DialogContent>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </Dialog>
  );
}
