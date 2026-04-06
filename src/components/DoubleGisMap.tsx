import { useEffect, useRef } from 'react';

interface DoubleGisMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    onClick?: () => void;
  }>;
  className?: string;
}

declare global {
  interface Window {
    DG?: any;
  }
}

export function DoubleGisMap({ 
  center = [40.5283, 72.7985], // Ош, Кыргызстан по умолчанию
  zoom = 13,
  markers = [],
  className = "w-full h-96"
}: DoubleGisMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Загружаем скрипт 2ГИС если еще не загружен
    if (!window.DG) {
      const script = document.createElement('script');
      script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);

      // Добавляем стили для карты
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://maps.api.2gis.ru/2.0/pkg/full/maps.css';
      document.head.appendChild(link);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Инициализируем карту 2ГИС
      window.DG.then(() => {
        if (!mapRef.current) return;
        
        const map = window.DG.map(mapRef.current, {
          center,
          zoom,
        });

        mapInstanceRef.current = map;

        // Добавляем маркеры
        markers.forEach(marker => {
          const dgMarker = window.DG.marker([marker.lat, marker.lng])
            .addTo(map)
            .bindPopup(marker.title);

          if (marker.onClick) {
            dgMarker.on('click', marker.onClick);
          }
        });
      });
    }

    return () => {
      // Очищаем карту при размонтировании
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Обновляем маркеры когда они меняются
  useEffect(() => {
    if (!mapInstanceRef.current || !window.DG) return;

    // Удаляем все существующие маркеры
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.DG.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Добавляем новые маркеры
    markers.forEach(marker => {
      const dgMarker = window.DG.marker([marker.lat, marker.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(marker.title);

      if (marker.onClick) {
        dgMarker.on('click', marker.onClick);
      }
    });
  }, [markers]);

  return <div ref={mapRef} className={className} />;
}
