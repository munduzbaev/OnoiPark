import { useEffect, useState } from "react";
import logoFull from "figma:asset/5dca0b1b5508e3c095a58f0a9447698aa99a27a8.png";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img 
              src={logoFull} 
              alt="OnoiPark" 
              className="w-32 h-32 object-contain drop-shadow-2xl animate-in zoom-in duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl -z-10 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700 delay-100">
            OnoiPark
          </h1>
          <p className="text-muted-foreground animate-in slide-in-from-bottom-4 duration-700 delay-200">
            Умная парковка нового поколения
          </p>
        </div>

        <div className="flex justify-center animate-in fade-in duration-700 delay-300">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
