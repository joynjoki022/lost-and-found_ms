"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Settings, User, LogOut,
  Menu, X, Sun, Moon, ChevronDown,
  LayoutDashboard, Users, Calendar,
  TrendingUp, Activity, MessageSquare,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    setIsLoading(true);

    const isLoginPage = pathname === "/admin/login";

    // Check for custom admin token in localStorage
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    console.log("Auth check - Token exists:", !!token);
    console.log("Auth check - User:", userStr);

    // If on login page and already authenticated, redirect to dashboard
    if (isLoginPage && token && userStr) {
      console.log("Already authenticated, redirecting to dashboard");
      router.push("/admin/dashboard");
      setIsLoading(false);
      return;
    }

    // If not on login page and not authenticated, redirect to login
    if (!isLoginPage && (!token || !userStr)) {
      console.log("No valid token, redirecting to login");
      router.push("/admin/login");
      setIsLoading(false);
      return;
    }

    // If authenticated, set user data
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminUser(user);
        setIsAuthenticated(true);
        console.log("User authenticated:", user.email);
      } catch (error) {
        console.error("Error parsing user:", error);
        router.push("/admin/login");
      }
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    // Clear all admin-related localStorage items
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_role");

    // Redirect to login
    router.push("/admin/login");
  };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading spinner while checking auth
  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark via-bg-dark to-bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-dim">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <div className="min-h-screen">{children}</div>;
  }

  // If not authenticated and not on login page, show nothing (redirecting)
  if (!isAuthenticated && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark via-bg-dark to-bg-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-dim">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, color: "text-gold" },
    { name: "Supporters", path: "/admin/supporters", icon: Users, color: "text-blue-400" },
    { name: "Events", path: "/admin/events", icon: Calendar, color: "text-green-400" },
    { name: "Volunteers", path: "/admin/volunteers", icon: Activity, color: "text-purple-400" },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare, color: "text-yellow-400" },
    { name: "Analytics", path: "/admin/analytics", icon: TrendingUp, color: "text-orange-400" },
    { name: "Settings", path: "/admin/settings", icon: Settings, color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-bg-dark to-bg-card">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-bg-card/80 backdrop-blur-xl border border-gold/20 text-gold"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-64 bg-bg-card/95 backdrop-blur-xl border-r border-gold/20`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-4 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gold to-gold-light flex items-center justify-center">
                <Shield className="h-6 w-6 text-bg-dark" />
              </div>
              <div>
                <h1 className="font-montserrat font-bold text-gold text-lg">Team Mulila</h1>
                <p className="text-[10px] text-text-dim">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            <div className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${isActive
                        ? "bg-gold/10 text-gold border-r-2 border-gold"
                        : "text-text-dim hover:bg-gold/5 hover:text-gold"
                      }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-gold" : item.color}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gold/20">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gold/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold to-gold-light flex items-center justify-center">
                  <span className="text-bg-dark text-sm font-bold">
                    {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-text-light">
                    {adminUser?.email?.split("@")[0] || "Admin"}
                  </p>
                  <p className="text-[10px] text-text-dim capitalize">{adminUser?.role || "Administrator"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-text-dim" />
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-card rounded-xl border border-gold/20 shadow-2xl py-2">
                  <button
                    onClick={() => router.push("/admin/profile")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => router.push("/admin/settings")}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <div className="border-t border-gold/20 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0"}`}>
        <header className="sticky top-0 z-30 bg-bg-card/80 backdrop-blur-xl border-b border-gold/20">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="hidden lg:block">
              <h1 className="font-montserrat text-xl font-bold text-gold">
                {navItems.find((item) => item.path === pathname)?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}
    </div>
  );
}
