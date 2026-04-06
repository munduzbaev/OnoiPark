import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  User,
  Car,
  Phone,
  Bell,
  CreditCard,
  Shield,
  MessageCircle,
  LogOut,
  ChevronRight,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId } from "../utils/supabase/info";
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
import { useTheme } from "../utils/theme-context";

interface ProfileScreenProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
  onUpdateSettings: (settings: any) => void;
}

export function ProfileScreen({
  user,
  accessToken,
  onLogout,
  onUpdateSettings,
}: ProfileScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState(
    user.notificationSettings || {
      bookingConfirmation: true,
      freeTimeExpiring: true,
      paidTimeExpiring: true,
      paymentConfirmation: true,
    }
  );
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationChange = async (key: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/user/update-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ notificationSettings: newSettings }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onUpdateSettings(data.user);
        toast.success("Настройки сохранены");
      } else {
        toast.error("Ошибка сохранения настроек");
      }
    } catch (error) {
      console.error("Ошибка обновления настроек:", error);
      toast.error("Не удалось сохранить настройки");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupport = () => {
    toast.info("Открытие чата с оператором...", {
      description: "Функция будет доступна в ближайшее время",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/user/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Аккаунт успешно удален");
        onLogout();
      } else {
        const data = await response.json();
        toast.error(data.error || "Ошибка удаления аккаунта");
      }
    } catch (error) {
      console.error("Ошибка удаления аккаунта:", error);
      toast.error("Не удалось удалить аккаунт");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-2">Профиль</h1>
        <p className="text-muted-foreground">
          Управление настройками и персональными данными
        </p>
      </div>

      {/* Информация о пользователе */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">{user.name}</h3>
            <p className="text-sm text-muted-foreground">
              Участник с {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Госномер (логин)</p>
              <p>{user.plateNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Номер телефона</p>
              <p>{user.phoneNumber}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Настройки приложения */}
      <Card className="p-6 mb-6 bg-card/50">
        <h3 className="mb-4">Настройки приложения</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <Label htmlFor="theme-toggle" className="cursor-pointer">
                Темная тема
              </Label>
              <p className="text-sm text-muted-foreground">
                Переключение между светлой и темной темой
              </p>
            </div>
          </div>
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </div>
      </Card>

      {/* Настройки уведомлений */}
      <Card className="p-6 mb-6 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3>Уведомления</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="booking-notif" className="cursor-pointer">
                Подтверждение бронирования
              </Label>
              <p className="text-sm text-muted-foreground">
                Уведомление при бронировании места
              </p>
            </div>
            <Switch
              id="booking-notif"
              checked={notificationSettings.bookingConfirmation}
              onCheckedChange={(checked) =>
                handleNotificationChange("bookingConfirmation", checked)
              }
              disabled={isSaving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="free-time-notif" className="cursor-pointer">
                Истечение бесплатного времени
              </Label>
              <p className="text-sm text-muted-foreground">
                За 10-15 минут до окончания бесплатного часа
              </p>
            </div>
            <Switch
              id="free-time-notif"
              checked={notificationSettings.freeTimeExpiring}
              onCheckedChange={(checked) =>
                handleNotificationChange("freeTimeExpiring", checked)
              }
              disabled={isSaving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="paid-time-notif" className="cursor-pointer">
                Окончание оплаченного времени
              </Label>
              <p className="text-sm text-muted-foreground">
                За 5-10 минут до истечения оплаченного времени
              </p>
            </div>
            <Switch
              id="paid-time-notif"
              checked={notificationSettings.paidTimeExpiring}
              onCheckedChange={(checked) =>
                handleNotificationChange("paidTimeExpiring", checked)
              }
              disabled={isSaving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="payment-notif" className="cursor-pointer">
                Подтверждение оплаты
              </Label>
              <p className="text-sm text-muted-foreground">
                Уведомление о списании средств
              </p>
            </div>
            <Switch
              id="payment-notif"
              checked={notificationSettings.paymentConfirmation}
              onCheckedChange={(checked) =>
                handleNotificationChange("paymentConfirmation", checked)
              }
              disabled={isSaving}
            />
          </div>
        </div>
      </Card>

      {/* Способы оплаты */}
      <Card className="p-6 mb-6 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3>Способы оплаты</h3>
        </div>

        {user.paymentMethods && user.paymentMethods.length > 0 ? (
          <div className="space-y-2">
            {user.paymentMethods.map((method: any) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  <span>{method.last4}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Способы оплаты не добавлены
            </p>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Добавить карту
            </Button>
          </div>
        )}
      </Card>

      {/* Дополнительные опции */}
      <Card className="p-4 mb-6">
        <button
          onClick={() => setShowPrivacyPolicy(true)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span>Политика конфиденциальности</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <Separator className="my-2" />

        <button
          onClick={handleSupport}
          className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span>Техническая поддержка</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </Card>

      {/* Выход */}
      <Button
        variant="destructive"
        className="w-full mb-4"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Выйти из аккаунта
      </Button>

      {/* Удаление аккаунта */}
      <Button
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Удалить аккаунт
      </Button>

      {/* Диалог политики конфиденциальности */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Политика конфиденциальности</DialogTitle>
            <DialogDescription>
              Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h4 className="mb-2">1. Сбор информации</h4>
              <p className="text-muted-foreground">
                Мы собираем информацию, которую вы предоставляете при регистрации
                (госномер, номер телефона, имя), а также данные о ваших
                парковочных сессиях.
              </p>
            </section>

            <section>
              <h4 className="mb-2">2. Использование данных</h4>
              <p className="text-muted-foreground">
                Ваши данные используются для предоставления услуг парковки,
                обработки платежей и отправки уведомлений о статусе парковки.
              </p>
            </section>

            <section>
              <h4 className="mb-2">3. Безопасность</h4>
              <p className="text-muted-foreground">
                Мы применяем современные методы шифрования и защиты данных для
                обеспечения безопасности вашей личной информации.
              </p>
            </section>

            <section>
              <h4 className="mb-2">4. Ваши права</h4>
              <p className="text-muted-foreground">
                Вы имеете право запросить доступ, исправление или удаление ваших
                персональных данных в любое время.
              </p>
            </section>

            <section>
              <h4 className="mb-2">5. Контакты</h4>
              <p className="text-muted-foreground">
                По вопросам конфиденциальности обращайтес�� в службу поддержки
                через раздел "Техническая поддержка".
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления аккаунта */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Все ваши данные, включая историю парковок
              и способы оплаты, будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить аккаунт"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}