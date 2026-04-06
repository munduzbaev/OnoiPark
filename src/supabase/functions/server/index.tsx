import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Регистрация пользователя (госномер + телефон)
app.post('/make-server-8d1a5612/auth/signup', async (c) => {
  try {
    const { plateNumber, phoneNumber, name } = await c.req.json();

    // Проверяем, существует ли уже пользователь с таким номером
    const existingUser = await kv.get(`user:${plateNumber}`);
    if (existingUser) {
      return c.json({ error: 'Пользователь с таким госномером уже зарегистрирован' }, 400);
    }

    // Создаём пользователя через Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${plateNumber}@onoipark.app`, // Используем госномер как email
      password: phoneNumber,
      user_metadata: { 
        name,
        plateNumber,
        phoneNumber,
      },
      // Автоматически подтверждаем email, так как email сервер не настроен
      email_confirm: true
    });

    if (error) {
      console.error('Ошибка создания пользователя:', error);
      return c.json({ error: error.message }, 400);
    }

    // Сохраняем данные пользователя в KV
    const userData = {
      id: data.user.id,
      plateNumber,
      phoneNumber,
      name,
      createdAt: new Date().toISOString(),
      paymentMethods: [],
      notificationSettings: {
        bookingConfirmation: true,
        freeTimeExpiring: true,
        paidTimeExpiring: true,
        paymentConfirmation: true,
      }
    };

    await kv.set(`user:${plateNumber}`, userData);
    await kv.set(`user:id:${data.user.id}`, plateNumber);

    return c.json({ 
      success: true,
      user: userData,
      message: 'Регистрация прошла успешно'
    });

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return c.json({ error: 'Внутренняя ошибка сервера при регистрации' }, 500);
  }
});

// Вход пользователя
app.post('/make-server-8d1a5612/auth/signin', async (c) => {
  try {
    const { plateNumber, phoneNumber } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${plateNumber}@onoipark.app`,
      password: phoneNumber,
    });

    if (error) {
      console.error('Ошибка входа:', error);
      return c.json({ error: 'Неверный госномер или номер телефона' }, 401);
    }

    const userData = await kv.get(`user:${plateNumber}`);

    return c.json({
      success: true,
      access_token: data.session.access_token,
      user: userData,
    });

  } catch (error) {
    console.error('Ошибка при входе:', error);
    return c.json({ error: 'Внутренняя ошибка сервера при входе' }, 500);
  }
});

// Проверка пользователя (для восстановления пароля)
app.post('/make-server-8d1a5612/auth/verify-user', async (c) => {
  try {
    const { plateNumber, phoneNumber } = await c.req.json();

    // Проверяем, существует ли пользователь
    const userData = await kv.get(`user:${plateNumber}`);
    
    if (!userData) {
      return c.json({ error: 'Пользователь не найден' }, 404);
    }

    // Проверяем совпадение номера телефона
    if (userData.phoneNumber !== phoneNumber) {
      return c.json({ error: 'Неверный номер телефона' }, 401);
    }

    return c.json({ 
      success: true,
      message: 'Пользователь подтвержден'
    });

  } catch (error) {
    console.error('Ошибка верификации пользователя:', error);
    return c.json({ error: 'Внутренняя ошибка сервера при проверке' }, 500);
  }
});

// Сброс пароля (обновление номера телефона)
app.post('/make-server-8d1a5612/auth/reset-password', async (c) => {
  try {
    const { plateNumber, oldPhoneNumber, newPhoneNumber } = await c.req.json();

    // Проверяем, существует ли пользователь
    const userData = await kv.get(`user:${plateNumber}`);
    
    if (!userData) {
      return c.json({ error: 'Пользователь не найден' }, 404);
    }

    // Проверяем совпадение старого номера телефона
    if (userData.phoneNumber !== oldPhoneNumber) {
      return c.json({ error: 'Неверный текущий номер телефона' }, 401);
    }

    // Обновляем пароль в Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: newPhoneNumber }
    );

    if (error) {
      console.error('Ошибка обновления пароля в Supabase:', error);
      return c.json({ error: 'Не удалось обновить пароль' }, 500);
    }

    // Обновляем номер телефона в KV
    userData.phoneNumber = newPhoneNumber;
    await kv.set(`user:${plateNumber}`, userData);

    return c.json({ 
      success: true,
      message: 'Пароль успешно обновлен'
    });

  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    return c.json({ error: 'Внутренняя ошибка сервера при сбросе пароля' }, 500);
  }
});

// Получить данные пользователя
app.get('/make-server-8d1a5612/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const plateNumber = await kv.get(`user:id:${user.id}`);
    const userData = await kv.get(`user:${plateNumber}`);

    return c.json({ user: userData });

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return c.json({ error: 'Ошибка получения профиля' }, 500);
  }
});

// Обновить настройки уведомлений
app.post('/make-server-8d1a5612/user/update-settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const { notificationSettings } = await c.req.json();
    const plateNumber = await kv.get(`user:id:${user.id}`);
    const userData = await kv.get(`user:${plateNumber}`);

    userData.notificationSettings = notificationSettings;
    await kv.set(`user:${plateNumber}`, userData);

    return c.json({ success: true, user: userData });

  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    return c.json({ error: 'Ошибка обновления настроек' }, 500);
  }
});

// Удалить аккаунт
app.delete('/make-server-8d1a5612/user/delete-account', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const plateNumber = await kv.get(`user:id:${user.id}`);

    // Проверяем, нет ли активной сессии
    const sessionId = await kv.get(`user-session:${user.id}`);
    if (sessionId) {
      return c.json({ error: 'Завершите активную парковочную сессию перед удалением аккаунта' }, 400);
    }

    // Удаляем пользователя из Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Ошибка удаления пользователя из Auth:', deleteError);
      return c.json({ error: 'Не удалось удалить аккаунт' }, 500);
    }

    // Удаляем все данные пользователя из KV
    await kv.del(`user:${plateNumber}`);
    await kv.del(`user:id:${user.id}`);
    
    // Удаляем историю (опционально, можно оставить для аналитики)
    const historyItems = await kv.getByPrefix(`history:${user.id}:`);
    for (const item of historyItems) {
      const key = `history:${user.id}:${item.id}`;
      await kv.del(key);
    }

    // Удаляем бронирования
    const bookingId = await kv.get(`user-booking:${user.id}`);
    if (bookingId) {
      await kv.del(`booking:${bookingId}`);
      await kv.del(`user-booking:${user.id}`);
    }

    return c.json({ 
      success: true,
      message: 'Аккаунт успешно удален'
    });

  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error);
    return c.json({ error: 'Внутренняя ошибка при удалении аккаунта' }, 500);
  }
});

// Получить список всех парковок
app.get('/make-server-8d1a5612/parkings', async (c) => {
  try {
    const parkings = await kv.getByPrefix('parking:');
    
    // Если парковки еще не созданы, создаём их
    if (!parkings || parkings.length === 0) {
      const defaultParkings = [
        {
          id: 'parking-1',
          name: 'Университетская парковка',
          address: 'ул. Ленина, 1, Ош',
          lat: 40.5283,
          lng: 72.7985,
          totalSpots: 120,
          availableSpots: 87,
          price: 100,
          features: ['Охрана', 'Видеонаблюдение', 'Освещение'],
        },
        {
          id: 'parking-2',
          name: 'Парковка у ресторана "Звезда"',
          address: 'пр. Масалиева, 15, Ош',
          lat: 40.5310,
          lng: 72.8020,
          totalSpots: 60,
          availableSpots: 23,
          price: 100,
          features: ['Крытая', 'Охрана'],
        },
        {
          id: 'parking-3',
          name: 'ТЦ "Центральный"',
          address: 'ул. Кыргызстан, 45, Ош',
          lat: 40.5250,
          lng: 72.7950,
          totalSpots: 200,
          availableSpots: 145,
          price: 100,
          features: ['Крытая', 'Охрана', 'Зарядка EV'],
        },
      ];

      for (const parking of defaultParkings) {
        await kv.set(`parking:${parking.id}`, parking);
        
        // Создаём места для парковки
        const spots = [];
        for (let i = 1; i <= parking.totalSpots; i++) {
          spots.push({
            id: `${parking.id}-spot-${i}`,
            number: i,
            status: i <= parking.availableSpots ? 'available' : 'occupied',
            parkingId: parking.id,
          });
        }
        await kv.set(`spots:${parking.id}`, spots);
      }

      return c.json({ parkings: defaultParkings });
    }

    return c.json({ parkings });

  } catch (error) {
    console.error('Ошибка получения парковок:', error);
    return c.json({ error: 'Ошибка получения парковок' }, 500);
  }
});

// Получить места конкретной парковки
app.get('/make-server-8d1a5612/parkings/:id/spots', async (c) => {
  try {
    const parkingId = c.req.param('id');
    const spots = await kv.get(`spots:${parkingId}`);

    if (!spots) {
      return c.json({ error: 'Парковка не найдена' }, 404);
    }

    return c.json({ spots });

  } catch (error) {
    console.error('Ошибка получения мест парковки:', error);
    return c.json({ error: 'Ошибка получения мест парковки' }, 500);
  }
});

// Получить список бронирований пользователя
app.get('/make-server-8d1a5612/bookings/list', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const allBookings = await kv.getByPrefix(`booking:`);
    const userBookings = allBookings.filter((b: any) => b.userId === user.id);

    return c.json({ bookings: userBookings || [] });

  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    return c.json({ error: 'Ошибка получения бронирований' }, 500);
  }
});

// Отменить бронирование
app.post('/make-server-8d1a5612/bookings/cancel', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const { bookingId } = await c.req.json();
    const booking = await kv.get(`booking:${bookingId}`);

    if (!booking) {
      return c.json({ error: 'Бронирование не найдено' }, 404);
    }

    if (booking.userId !== user.id) {
      return c.json({ error: 'Нет доступа к этому бронированию' }, 403);
    }

    // Освобождаем место
    const spots = await kv.get(`spots:${booking.parkingId}`);
    const spot = spots.find((s: any) => s.number === booking.spotNumber);
    if (spot) {
      spot.status = 'available';
      delete spot.bookedBy;
      await kv.set(`spots:${booking.parkingId}`, spots);

      // Обновляем количество доступных мест
      const parking = await kv.get(`parking:${booking.parkingId}`);
      parking.availableSpots += 1;
      await kv.set(`parking:${booking.parkingId}`, parking);
    }

    // Удаляем бронирование
    await kv.del(`booking:${bookingId}`);
    await kv.del(`user-booking:${user.id}`);

    return c.json({ success: true, message: 'Бронирование отменено' });

  } catch (error) {
    console.error('Ошибка отмены бронирования:', error);
    return c.json({ error: 'Ошибка отмены бронирования' }, 500);
  }
});

// Забронировать место
app.post('/make-server-8d1a5612/bookings/create', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const { parkingId, spotNumber } = await c.req.json();
    const plateNumber = await kv.get(`user:id:${user.id}`);
    const userData = await kv.get(`user:${plateNumber}`);

    // Получаем места парковки
    const spots = await kv.get(`spots:${parkingId}`);
    const spot = spots.find((s: any) => s.number === spotNumber);

    if (!spot || spot.status !== 'available') {
      return c.json({ error: 'Место недоступно для бронирования' }, 400);
    }

    // Создаём бронирование на 15 минут
    const booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      plateNumber: userData.plateNumber,
      parkingId,
      spotNumber,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'active',
    };

    // Обновляем статус места
    spot.status = 'booked';
    spot.bookedBy = user.id;
    await kv.set(`spots:${parkingId}`, spots);

    // Сохраняем бронирование
    await kv.set(`booking:${booking.id}`, booking);
    await kv.set(`user-booking:${user.id}`, booking.id);

    // Обновляем количество доступных мест
    const parking = await kv.get(`parking:${parkingId}`);
    parking.availableSpots -= 1;
    await kv.set(`parking:${parkingId}`, parking);

    return c.json({ success: true, booking });

  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    return c.json({ error: 'Ошибка создания бронирования' }, 500);
  }
});

// Начать парковочную сессию (сканирование QR)
app.post('/make-server-8d1a5612/sessions/start', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const { parkingId, qrCode, spotNumber: selectedSpot, location } = await c.req.json();
    const plateNumber = await kv.get(`user:id:${user.id}`);

    // Проверяем активное бронирование
    const bookingId = await kv.get(`user-booking:${user.id}`);
    let spotNumber = selectedSpot || null;

    if (bookingId) {
      const booking = await kv.get(`booking:${bookingId}`);
      if (booking && booking.parkingId === parkingId) {
        spotNumber = booking.spotNumber;
      }
    }

    // Если указано место и локация, проверяем (для демо просто логируем)
    if (selectedSpot && location) {
      console.log(`Пользователь выбрал место ${selectedSpot}, локация:`, location);
      // В реальном приложении здесь можно проверить, соответствует ли GPS-координата выбранному месту
    }

    // Обновляем статус места
    if (spotNumber) {
      const spots = await kv.get(`spots:${parkingId}`);
      const spot = spots.find((s: any) => s.number === spotNumber);
      if (spot) {
        spot.status = 'occupied';
        spot.bookedBy = user.id;
        await kv.set(`spots:${parkingId}`, spots);
      }
    }

    // Создаём парковочную сессию
    const session = {
      id: `session-${Date.now()}`,
      userId: user.id,
      plateNumber,
      parkingId,
      spotNumber,
      startTime: new Date().toISOString(),
      freeUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 час бесплатно
      status: 'active',
      cost: 0,
      location: location || null,
    };

    await kv.set(`session:${session.id}`, session);
    await kv.set(`user-session:${user.id}`, session.id);

    // Удаляем бронирование если было
    if (bookingId) {
      await kv.del(`booking:${bookingId}`);
      await kv.del(`user-booking:${user.id}`);
    }

    return c.json({ success: true, session });

  } catch (error) {
    console.error('Ошибка начала сессии:', error);
    return c.json({ error: 'Ошибка начала парковочной сессии' }, 500);
  }
});

// Получить активную сессию
app.get('/make-server-8d1a5612/sessions/active', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const sessionId = await kv.get(`user-session:${user.id}`);
    if (!sessionId) {
      return c.json({ session: null });
    }

    const session = await kv.get(`session:${sessionId}`);
    const parking = await kv.get(`parking:${session.parkingId}`);

    return c.json({ session, parking });

  } catch (error) {
    console.error('Ошибка получения активной сессии:', error);
    return c.json({ error: 'Ошибка получения активной сессии' }, 500);
  }
});

// Завершить сессию и оплатить
app.post('/make-server-8d1a5612/sessions/end', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const sessionId = await kv.get(`user-session:${user.id}`);
    const session = await kv.get(`session:${sessionId}`);

    if (!session) {
      return c.json({ error: 'Активная сессия не найдена' }, 404);
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const freeUntil = new Date(session.freeUntil);

    let cost = 0;
    if (endTime > freeUntil) {
      // Рассчитываем стоимость после бесплатного периода
      const paidMilliseconds = endTime.getTime() - freeUntil.getTime();
      const paidHours = Math.ceil(paidMilliseconds / (1000 * 60 * 60));
      cost = paidHours * 100; // 100 сомов за час
    }

    // Обновляем сессию
    session.endTime = endTime.toISOString();
    session.cost = cost;
    session.status = 'completed';

    await kv.set(`session:${sessionId}`, session);
    await kv.del(`user-session:${user.id}`);

    // Освобождаем место
    if (session.spotNumber) {
      const spots = await kv.get(`spots:${session.parkingId}`);
      const spot = spots.find((s: any) => s.number === session.spotNumber);
      if (spot) {
        spot.status = 'available';
        delete spot.bookedBy;
        await kv.set(`spots:${session.parkingId}`, spots);

        // Обновляем количество доступных мест
        const parking = await kv.get(`parking:${session.parkingId}`);
        parking.availableSpots += 1;
        await kv.set(`parking:${session.parkingId}`, parking);
      }
    }

    // Сохраняем в историю
    const historyKey = `history:${user.id}:${sessionId}`;
    await kv.set(historyKey, session);

    return c.json({ 
      success: true, 
      session,
      cost,
      message: cost > 0 ? `Оплачено: ${cost} с` : 'Парковка была бесплатной'
    });

  } catch (error) {
    console.error('Ошибка завершения сессии:', error);
    return c.json({ error: 'Ошибка завершения парковочной сессии' }, 500);
  }
});

// Получить историю парковок
app.get('/make-server-8d1a5612/history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Не авторизован' }, 401);
    }

    const historyItems = await kv.getByPrefix(`history:${user.id}:`);
    
    return c.json({ history: historyItems || [] });

  } catch (error) {
    console.error('Ошибка получения истории:', error);
    return c.json({ error: 'Ошибка получения истории' }, 500);
  }
});

Deno.serve(app.fetch);