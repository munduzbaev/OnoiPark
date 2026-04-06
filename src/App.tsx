import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { AuthScreen } from "./components/AuthScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ParkingMap } from "./components/ParkingMap";
import { ParkingLayout } from "./components/ParkingLayout";
import { QRScanner } from "./components/QRScanner";
import { ActiveSessionManager } from "./components/ActiveSessionManager";
import { SpotSelection } from "./components/SpotSelection";
import { ParkingHistory } from "./components/ParkingHistory";
import { ThemeProvider } from "./utils/theme-context";
import {
  ParkingMapSkeleton,
  ParkingLayoutSkeleton,
  ActiveSessionSkeleton,
  HistorySkeleton,
  ProfileSkeleton,
} from "./components/LoadingSkeletons";
import { SplashScreen } from "./components/SplashScreen";
import {
  Map,
  QrCode,
  Clock,
  History,
  User,
  Car,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";
import logoMini from "figma:asset/5dca0b1b5508e3c095a58f0a9447698aa99a27a8.png";

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

interface ParkingSpot {
  id: string;
  number: number;
  status: "available" | "occupied" | "booked";
  parkingId: string;
  bookedBy?: string;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [user, setUser] = useState<any>(null);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParking, setSelectedParking] =
    useState<Parking | null>(null);
  const [parkingSpots, setParkingSpots] = useState<
    ParkingSpot[]
  >([]);
  const [selectedSpot, setSelectedSpot] = useState<
    number | null
  >(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSpotSelection, setShowSpotSelection] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeParkingInfo, setActiveParkingInfo] =
    useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<
    "map" | "layout" | "booking"
  >("map");
  const [activeTab, setActiveTab] = useState("parking");
  
  // Loading states
  const [isLoadingParkings, setIsLoadingParkings] = useState(false);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Splash screen
  const [showSplash, setShowSplash] = useState(true);

  // Загрузка парковок
  useEffect(() => {
    if (accessToken) {
      loadParkings();
      loadActiveSession();
      loadHistory();
    }
  }, [accessToken]);

  // Загрузка активной сессии при старте
  useEffect(() => {
    if (accessToken && activeSession) {
      const interval = setInterval(() => {
        // Проверяем статус сессии каждую минуту
        loadActiveSession();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [accessToken, activeSession]);

  const loadParkings = async () => {
    setIsLoadingParkings(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/parkings`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      const data = await response.json();
      if (data.parkings) {
        setParkings(data.parkings);
      }
    } catch (error) {
      console.error("Ошибка загрузки парковок:", error);
      toast.error("Не удалось загрузить список парковок");
    } finally {
      setIsLoadingParkings(false);
    }
  };

  const loadParkingSpots = async (parkingId: string) => {
    setIsLoadingSpots(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/parkings/${parkingId}/spots`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      const data = await response.json();
      if (data.spots) {
        setParkingSpots(data.spots);
      }
    } catch (error) {
      console.error("Ошибка загрузки мест парковки:", error);
      toast.error("Не удалось загрузить схему парковки");
    } finally {
      setIsLoadingSpots(false);
    }
  };

  const loadActiveSession = async () => {
    setIsLoadingSession(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/sessions/active`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();
      if (data.session) {
        setActiveSession(data.session);
        setActiveParkingInfo(data.parking);
      } else {
        setActiveSession(null);
        setActiveParkingInfo(null);
      }
    } catch (error) {
      console.error("Ошибка загрузки активной сессии:", error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();
      if (data.history) {
        // Преобразуем историю в нужный формат
        const formattedHistory = data.history.map(
          (session: any) => ({
            id: session.id,
            spotName: `Место #${session.spotNumber || "N/A"}`,
            address: session.parkingId,
            date: new Date(session.startTime),
            duration: Math.ceil(
              (new Date(session.endTime).getTime() -
                new Date(session.startTime).getTime()) /
                (1000 * 60 * 60),
            ),
            cost: session.cost,
            vehiclePlate: session.plateNumber,
          }),
        );
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    toast.success(`Добро пожаловать, ${userData.name}!`);
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    setActiveSession(null);
    setParkings([]);
    setHistory([]);
    toast.success("Вы вышли из системы");
  };

  const handleSelectParking = (parking: Parking) => {
    setSelectedParking(parking);
    loadParkingSpots(parking.id);
    setCurrentView("layout");
  };

  const handleSelectSpot = (spotNumber: number) => {
    setSelectedSpot(spotNumber);
  };

  const handleBookSpot = async () => {
    if (!selectedParking || !selectedSpot) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/bookings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            parkingId: selectedParking.id,
            spotNumber: selectedSpot,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка бронирования");
        return;
      }

      toast.success("Место забронировано!", {
        description:
          "У вас есть 15 минут, чтобы приехать и начать парковку",
      });

      setCurrentView("booking");
      setShowQRScanner(true);

      // Обновляем список парковок
      loadParkings();
      loadParkingSpots(selectedParking.id);
    } catch (error) {
      console.error("Ошибка бронирования:", error);
      toast.error("Не удалось забронировать место");
    }
  };

  const handleQRScanSuccess = async (qrCode: string) => {
    setQRCodeData(qrCode);
    setShowQRScanner(false);
    
    // Проверяем, есть ли бронирование
    const bookingId = await checkUserBooking();
    
    if (bookingId && selectedParking) {
      // Есть бронирование - сразу начинаем сессию
      startSessionWithBooking(qrCode);
    } else if (selectedParking) {
      // Нет бронирования - показываем выбор места
      await loadParkingSpots(selectedParking.id);
      setShowSpotSelection(true);
    }
  };

  const checkUserBooking = async () => {
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
      if (data.bookings && data.bookings.length > 0) {
        return data.bookings[0].id;
      }
      return null;
    } catch (error) {
      console.error("Ошибка проверки бронирования:", error);
      return null;
    }
  };

  const startSessionWithBooking = async (qrCode: string) => {
    if (!selectedParking) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/sessions/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            parkingId: selectedParking.id,
            qrCode,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка начала сессии");
        return;
      }

      setActiveSession(data.session);
      setActiveParkingInfo(selectedParking);
      setSelectedSpot(null);
      setCurrentView("map");

      toast.success("Парковочная сессия начата!", {
        description: "Первый час парковки бесплатный",
      });
      
      // Обновляем данные
      loadParkings();
    } catch (error) {
      console.error("Ошибка начала сессии:", error);
      toast.error("Не удалось начать парковочную сессию");
    }
  };

  const handleConfirmSpot = async (spotNumber: number, location: { lat: number; lng: number } | null) => {
    if (!selectedParking || !qrCodeData) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/sessions/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            parkingId: selectedParking.id,
            qrCode: qrCodeData,
            spotNumber,
            location,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка начала сессии");
        return;
      }

      setShowSpotSelection(false);
      setActiveSession(data.session);
      setActiveParkingInfo(selectedParking);
      setSelectedSpot(null);
      setCurrentView("map");

      toast.success("Шлагбаум открыт! Парковочная сессия начата!", {
        description: location 
          ? "Место подтверждено через GPS. Первый час бесплатно."
          : "Первый час парковки бесплатный",
      });

      // Обновляем данные
      loadParkings();
    } catch (error) {
      console.error("Ошибка начала сессии:", error);
      toast.error("Не удалось начать парковочную сессию");
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/sessions/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка завершения сессии");
        return;
      }

      toast.success(data.message);
      setActiveSession(null);
      setActiveParkingInfo(null);
      loadHistory();
      loadParkings();
    } catch (error) {
      console.error("Ошибка завершения сессии:", error);
      toast.error("Не удалось завершить сессию");
    }
  };

  const handleUpdateSettings = (updatedUser: any) => {
    setUser(updatedUser);
  };

  // Показываем splash screen при первой загрузке
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Если не авторизован - показываем экран входа
  if (!accessToken || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b sticky top-0 bg-card/80 backdrop-blur z-10 safe-area-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoMini} alt="OnoiPark" className="w-10 h-10" />
              <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">OnoiPark</h1>
            </div>
            <div className="flex items-center gap-2">
              {activeSession && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm">
                    Активная парковка
                  </span>
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.plateNumber}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 mb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="parking" />
            <TabsTrigger value="active" />
            <TabsTrigger value="qr" />
            <TabsTrigger value="history" />
            <TabsTrigger value="profile" />
          </TabsList>

          <TabsContent value="parking">
            {currentView === "map" && (
              <>
                {isLoadingParkings ? (
                  <ParkingMapSkeleton />
                ) : (
                  <ParkingMap
                    parkings={parkings}
                    onSelectParking={handleSelectParking}
                  />
                )}
              </>
            )}

            {currentView === "layout" && selectedParking && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView("map");
                    setSelectedParking(null);
                    setSelectedSpot(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к карте
                </Button>

                {isLoadingSpots ? (
                  <ParkingLayoutSkeleton />
                ) : (
                  <>
                    <ParkingLayout
                      parking={selectedParking}
                      spots={parkingSpots}
                      onSelectSpot={handleSelectSpot}
                      selectedSpot={selectedSpot}
                    />

                    {selectedSpot && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleBookSpot}
                          className="flex-1"
                          size="lg"
                        >
                          Забронировать место
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {currentView === "booking" && (
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <h2>Место забронировано!</h2>
                <p className="text-muted-foreground">
                  У вас есть 15 минут, чтобы приехать на
                  парковку. Отсканируйте QR-код на въезде для
                  начала парковочной сессии.
                </p>
                <Button
                  onClick={() => setShowQRScanner(true)}
                  size="lg"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Сканировать QR-код
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView("map");
                    setSelectedParking(null);
                    setSelectedSpot(null);
                  }}
                >
                  Вернуться к парковкам
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {isLoadingSession ? (
              <ActiveSessionSkeleton />
            ) : (
              <ActiveSessionManager
                session={activeSession}
                parking={activeParkingInfo}
                onEndSession={handleEndSession}
                accessToken={accessToken || ""}
              />
            )}
          </TabsContent>

          <TabsContent value="qr">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h2>QR-сканер</h2>
              <p className="text-muted-foreground">
                Отсканируйте QR-код на въезде парковки для быстрого доступа
              </p>
              <Button
                onClick={() => {
                  // Устанавливаем парковку по умолчанию для быстрого сканирования
                  if (parkings.length > 0 && !selectedParking) {
                    setSelectedParking(parkings[0]);
                  }
                  setShowQRScanner(true);
                }}
                size="lg"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Сканировать QR-код
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-4xl mx-auto">
              {isLoadingHistory ? (
                <HistorySkeleton />
              ) : (
                <ParkingHistory history={history} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            {isLoadingProfile ? (
              <ProfileSkeleton />
            ) : (
              <ProfileScreen
                user={user}
                accessToken={accessToken}
                onLogout={handleLogout}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Нижняя адаптивная навигация */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-card border-t z-20 safe-area-bottom"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => {
                setCurrentView("map");
                setActiveTab("parking");
              }}
              className={`flex flex-col items-center justify-center py-3 px-2 hover:bg-muted/50 transition-colors rounded-lg ${
                activeTab === "parking" ? "text-primary" : ""
              }`}
            >
              <Map className="w-5 h-5 mb-1" />
              <span className="text-xs hidden sm:inline">Парковки</span>
            </button>
            
            <button
              onClick={() => setActiveTab("active")}
              className={`flex flex-col items-center justify-center py-3 px-2 hover:bg-muted/50 transition-colors rounded-lg relative ${
                activeTab === "active" ? "text-primary" : ""
              }`}
            >
              <Clock className="w-5 h-5 mb-1" />
              <span className="text-xs hidden sm:inline">Активная</span>
              {activeSession && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                if (parkings.length > 0 && !selectedParking) {
                  setSelectedParking(parkings[0]);
                }
                setShowQRScanner(true);
              }}
              className="flex flex-col items-center justify-center py-3 px-2 -mt-6 bg-gradient-to-br from-primary to-accent text-white rounded-full w-16 h-16 mx-auto shadow-lg hover:scale-105 transition-transform"
            >
              <QrCode className="w-7 h-7" />
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center py-3 px-2 hover:bg-muted/50 transition-colors rounded-lg ${
                activeTab === "history" ? "text-primary" : ""
              }`}
            >
              <History className="w-5 h-5 mb-1" />
              <span className="text-xs hidden sm:inline">История</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center py-3 px-2 hover:bg-muted/50 transition-colors rounded-lg ${
                activeTab === "profile" ? "text-primary" : ""
              }`}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs hidden sm:inline">Профиль</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Диалоги */}
      {selectedParking && (
        <QRScanner
          open={showQRScanner}
          onOpenChange={setShowQRScanner}
          parkingId={selectedParking.id}
          onScanSuccess={handleQRScanSuccess}
        />
      )}

      {selectedParking && (
        <SpotSelection
          open={showSpotSelection}
          onOpenChange={setShowSpotSelection}
          parkingId={selectedParking.id}
          parkingName={selectedParking.name}
          spots={parkingSpots}
          onConfirmSpot={handleConfirmSpot}
        />
      )}
    </div>
  );
}