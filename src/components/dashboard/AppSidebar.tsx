
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Settings, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboards", icon: Bot, route: "/dashboard" },
  { title: "Agentes", icon: Bot, route: "/agents" },
  { title: "Chat", icon: MessageSquare, route: "/chat" },
  { title: "Equipe", icon: Users, route: "/team" },
  { title: "Configurações", icon: Settings, route: "/settings" },
];

type AppSidebarProps = {
  workspace: string;
};

export const AppSidebar = ({ workspace }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <Button variant="outline" className="w-full justify-between">
            {workspace}
            <span className="text-xs">▼</span>
          </Button>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={location.pathname === item.route ? "bg-purple-50 text-purple-600" : ""}
                    onClick={() => navigate(item.route)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
