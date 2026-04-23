
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  id: number;
  phone: string;
  name: string | null;
  bonus_points: number;
  level: string;
  is_new: boolean;
}

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("flora_token");
    const savedUser = localStorage.getItem("flora_user");
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setChecked(true);
  }, []);

  const handleAuth = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("flora_token", t);
    localStorage.setItem("flora_user", JSON.stringify(u));
  };

  if (!checked) return null;

  if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index user={user} token={token} onLogout={() => { setUser(null); setToken(""); localStorage.removeItem("flora_token"); localStorage.removeItem("flora_user"); }} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;