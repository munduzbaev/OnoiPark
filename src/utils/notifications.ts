import { toast } from "sonner@2.0.3";

export interface NotificationSettings {
  bookingConfirmation: boolean;
  freeTimeExpiring: boolean;
  paidTimeExpiring: boolean;
  paymentConfirmation: boolean;
}

/**
 * Отправка уведомления о подтверждении бронирования
 */
export function notifyBookingConfirmation(spotNumber: number, parkingName: string) {
  toast.success("Место забронировано!", {
    description: `Место #${spotNumber} в "${parkingName}" зарезервировано на 15 минут.`,
    duration: 5000,
  });
}

/**
 * Отправка уведомления об истечении времени брони
 */
export function notifyBookingExpiring(minutesLeft: number) {
  toast.warning("Бронь истекает!", {
    description: `У вас осталось ${minutesLeft} минут, чтобы приехать на парковку.`,
    duration: 7000,
  });
}

/**
 * Отправка уведомления об окончании бесплатного периода
 */
export function notifyFreeTimeExpiring(minutesLeft: number) {
  toast.info("Бесплатное время заканчивается", {
    description: `Через ${minutesLeft} минут начнётся почасовая тарификация по 100 ₽/час.`,
    duration: 7000,
  });
}

/**
 * Отправка уведомления об окончании оплаченного времени
 */
export function notifyPaidTimeExpiring(minutesLeft: number) {
  toast.warning("Оплаченное время заканчивается", {
    description: `Через ${minutesLeft} минут потребуется продлить парковку.`,
    duration: 7000,
  });
}

/**
 * Отправка уведомления о подтверждении оплаты
 */
export function notifyPaymentConfirmation(amount: number) {
  toast.success("Оплата прошла успешно", {
    description: `С вашей карты списано ${amount} ₽. Спасибо за использование ParkEasy!`,
    duration: 5000,
  });
}

/**
 * Отправка уведомления о начале парковочной сессии
 */
export function notifySessionStarted(parkingName: string) {
  toast.success("Парковочная сессия начата", {
    description: `Добро пожаловать на "${parkingName}". Первый час парковки бесплатный!`,
    duration: 5000,
  });
}

/**
 * Отправка уведомления при выезде с парковки
 */
export function notifyExitReminder() {
  toast.info("Напоминание", {
    description: "Не забудьте завершить парковочную сессию перед выездом!",
    duration: 7000,
  });
}

/**
 * Проверка и отправка уведомлений в зависимости от настроек
 */
export function checkAndNotify(
  type: keyof NotificationSettings,
  settings: NotificationSettings,
  notifyFn: () => void
) {
  if (settings[type]) {
    notifyFn();
  }
}
