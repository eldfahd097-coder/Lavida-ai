import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Phone,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Calls", path: "/calls", icon: Phone },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Settings", path: "/settings", icon: Settings },
];

type SidebarPanelProps = {
  pathname: string;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
};

function SidebarPanel({ pathname, userName, userEmail, onLogout }: SidebarPanelProps) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#faf6ef]/90 via-[#f8f3ea]/90 to-[#f5efe4]/90">
      <div className="border-b border-[#e7dfd2] px-5 py-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#d2b48c] via-[#c6a77a] to-[#b28d62] shadow-md">
            <Waves className="h-5 w-5 text-[#fff7ea]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-[#5c4732]">La Vida Resort & Beach Club</h1>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7a63]">Concierge Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5">
        <div className="space-y-1.5 rounded-2xl bg-white/60 p-2 shadow-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#e5d1b3] via-[#e9dbc3] to-[#efe5d3] text-[#5b4228] shadow-sm"
                    : "text-[#78624a] hover:bg-[#f4ecdf] hover:text-[#5f4b35]"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 transition-transform duration-300 ${isActive ? "text-[#7b5d3b]" : "text-[#9a8468] group-hover:scale-110"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[#e7dfd2] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/70 p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8d6be] text-xs font-bold text-[#694e30]">
            {userName?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#5f4a32]">{userName ?? "Admin"}</p>
            <p className="truncate text-xs text-[#9c876f]">{userEmail ?? ""}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-lg text-[#7f6a52] hover:bg-[#f3eadc] hover:text-[#5f4a34]"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f7f2ea]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-2xl bg-white/70 p-4 shadow-md backdrop-blur">
            <Waves className="h-10 w-10 animate-pulse text-[#9d7c55]" />
          </div>
          <p className="text-sm text-[#8a745c]">Loading La Vida Resort concierge dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-transparent">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-[#e8dece] bg-white/70 backdrop-blur-xl lg:flex">
        <SidebarPanel
          pathname={location.pathname}
          userName={user?.name ?? undefined}
          userEmail={user?.email ?? undefined}
          onLogout={logout}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 rounded-xl border border-[#e8dece] bg-white/90 text-[#765d40] shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r border-[#e8dece] bg-[#f9f5ee] p-0">
          <SidebarPanel
            pathname={location.pathname}
            userName={user?.name ?? undefined}
            userEmail={user?.email ?? undefined}
            onLogout={logout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_16px_45px_-30px_rgba(110,86,56,0.42)] backdrop-blur-sm transition-all duration-500 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
