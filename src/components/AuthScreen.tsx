import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Car, Phone, User } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ForgotPassword } from "./ForgotPassword";
import { ThemeToggle } from "./ThemeToggle";
import logoFull from "figma:asset/5dca0b1b5508e3c095a58f0a9447698aa99a27a8.png";

interface AuthScreenProps {
  onAuthSuccess: (accessToken: string, user: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Форма входа
  const [loginPlate, setLoginPlate] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  // Форма регистрации
  const [signupName, setSignupName] = useState("");
  const [signupPlate, setSignupPlate] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            plateNumber: loginPlate,
            phoneNumber: loginPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка входа");
        return;
      }

      toast.success("Вход выполнен успешно!");
      onAuthSuccess(data.access_token, data.user);

    } catch (error) {
      console.error("Ошибка входа:", error);
      toast.error("Не удалось войти в систему");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8d1a5612/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: signupName,
            plateNumber: signupPlate,
            phoneNumber: signupPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Ошибка регистрации");
        return;
      }

      toast.success("Регистрация прошла успешно! Войдите в систему.");
      // Автоматически переключаемся на вкладку входа
      setLoginPlate(signupPlate);
      setLoginPhone(signupPhone);

    } catch (error) {
      console.error("Ошибка регистрации:", error);
      toast.error("Не удалось зарегистрироваться");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlateNumber = (value: string) => {
    // Автоматическое форматирование госномера (например, А123БВ)
    return value.toUpperCase().replace(/[^A-ZА-Я0-9]/g, "").slice(0, 12);
  };

  const formatPhoneNumber = (value: string) => {
    // Оставляем только цифры
    return value.replace(/\D/g, "").slice(0, 10);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoFull} alt="OnoiPark" className="h-16" />
          </div>
          <CardTitle>OnoiPark</CardTitle>
          <CardDescription>Умная система управления парковкой</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-plate">Государственный номер</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-plate"
                      placeholder="02KG222ABC"
                      value={loginPlate}
                      onChange={(e) => setLoginPlate(formatPlateNumber(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ваш госномер используется как логин
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-phone">Номер телефона</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="0990123456"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(formatPhoneNumber(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </Button>

                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Забыли пароль?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="Асан Асанов"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-plate">Государственный номер</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-plate"
                      placeholder="02KG222ABC"
                      value={signupPlate}
                      onChange={(e) => setSignupPlate(formatPlateNumber(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Будет использоваться как логин
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Номер телефона</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="0990123456"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(formatPhoneNumber(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Будет использоваться как пароль
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ForgotPassword 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
}