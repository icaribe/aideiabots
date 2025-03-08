
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bot,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppSidebar = ({ workspace }: { workspace: string }) => {
  const isMobile = useIsMobile();
  const { open: isSidebarOpen, setOpenMobile: closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      name: "Agentes",
      icon: <Bot className="h-5 w-5" />,
      path: "/agents",
    },
    {
      name: "Chat",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/chat",
    },
    {
      name: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
  ];

  return (
    <aside
      className={`${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : "h-screen w-64 border-r bg-white"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h1 className="text-lg font-bold">{workspace}</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? closeSidebar : undefined}
            >
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isActive(item.path)
                    ? "bg-gray-100 font-medium text-purple-600"
                    : ""
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-600"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Sair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
