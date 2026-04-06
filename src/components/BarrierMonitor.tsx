import { useEffect, useState } from 'react';
import { supabase } from "@/supabase"; // Проверь, чтобы этот путь вел к твоему файлу инициализации supabase

export function BarrierMonitor() {
  const [activeCar, setActiveCar] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);

  useEffect(() => {
    // Подписываемся на изменения в таблице bookings в реальном времени
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        async (payload) => {
          // Если статус изменился на completed (машина отсканировала QR)
          if (payload.new.status === 'completed') {
            setActiveCar(payload.new.car_number);
            
            // Быстро запрашиваем имя водителя
            const { data } = await supabase
              .from('bookings')
              .select('users(full_name)')
              .eq('id', payload.new.id)
              .single() as any; // as any убирает придирки TypeScript к вложенным типам
              
            setDriverName(data?.users?.full_name || "Зарегистрированный гость");

            // Через 7 секунд гасим экран (имитируем, что машина проехала)
            setTimeout(() => {
              setActiveCar(null);
              setDriverName(null);
            }, 7000);
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className={`w-full max-w-2xl p-8 rounded-2xl text-center border-4 transition-all duration-500 ${
        activeCar ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800'
      }`}>
        <h1 className="text-xl uppercase tracking-widest text-gray-400">Монитор КПП</h1>
        
        {activeCar ? (
          <div className="mt-6 space-y-4 animate-pulse">
            <div className="text-7xl font-black text-white bg-black/30 py-4 rounded-lg">
              {activeCar}
            </div>
            <p className="text-3xl font-semibold text-green-400">ДОСТУП РАЗРЕШЕН</p>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-sm text-gray-400">Водитель:</p>
              <p className="text-2xl font-bold text-white">{driverName}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 py-12">
            <p className="text-2xl text-gray-500">Ожидание подъезда авто...</p>
            <div className="mt-4 w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}