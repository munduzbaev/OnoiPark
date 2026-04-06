import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Car, Phone } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface ForgotPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPassword({ open, onOpenChange }: ForgotPasswordProps) {
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [plateNumber, setPlateNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatPlateNumber = (value: string) => {
    return value.toUpperCase().replace(/[^A-ZА-Я0-9]/g, "").slice(0, 12);
  };

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/auth/verify-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            plateNumber,
            phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Пользователь не найден");
        return;
      }

      toast.success("Пользователь подтвержден");
      setStep('reset');
    } catch (error) {
      console.error("Ошибка верификации:", error);
      toast.error("Ошибка проверки данных");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            plateNumber,
            oldPhoneNumber: phoneNumber,
            newPhoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка сброса пароля");
        return;
      }

      toast.success("Пароль успешно обновлен! Войдите с новым номером телефона.");
      onOpenChange(false);
      setStep('verify');
      setPlateNumber("");
      setPhoneNumber("");
      setNewPhoneNumber("");
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
      toast.error("Не удалось сбросить пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'verify' ? 'Восстановление доступа' : 'Новый пароль'}
          </DialogTitle>
          <DialogDescription>
            {step === 'verify'
              ? 'Введите ваш госномер и текущий номер телефона для подтверждения'
              : 'Введите новый номер телефона, который будет использоваться как пароль'}
          </DialogDescription>
        </DialogHeader>

        {step === 'verify' ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Государственный номер</Label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="plate"
                  placeholder="02KG222ABC"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(formatPlateNumber(e.target.value))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Текущий номер телефона</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0990123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Проверка..." : "Продолжить"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-phone">Новый номер телефона</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-phone"
                  type="tel"
                  placeholder="0990123456"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Этот номер будет использоваться как новый пароль
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('verify')}
              >
                Назад
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Обновление..." : "Обновить пароль"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
