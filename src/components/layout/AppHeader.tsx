import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Brain,
  Cpu,
  ExternalLink,
  Globe,
  Menu,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "success" | "warning" | "info" | "error" | "ai";
  read: boolean;
  aiAction?: string;
}

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();

  // Reset mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Mock notifications for demo - enhanced with AI notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "AI Strategy Optimization",
      message: "AI has adjusted your portfolio allocation for maximum yield.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "ai",
      read: false,
      aiAction: "View Details",
    },
    {
      id: "2",
      title: "Deposit Successful",
      message: "Your deposit of $500 to DEEP-SUI vault was successful.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "success",
      read: false,
    },
    {
      id: "3",
      title: "Unlock Soon",
      message: "Your CETUS-SUI position will unlock in 2 days.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "info",
      read: false,
    },
    {
      id: "4",
      title: "Performance Alert",
      message: "SUI-USDC vault has gained 3.2% in the last 24 hours.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "info",
      read: true,
    },
    {
      id: "5",
      title: "AI Risk Assessment",
      message: "Market volatility detected. AI has adjusted risk parameters.",
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      type: "ai",
      read: true,
      aiAction: "Review",
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconForType = (type: Notification["type"]) => {
    switch (type) {
      case "ai":
        return (
          <div className="w-8 h-8 rounded-full bg-nova/20 border border-nova/30 flex items-center justify-center text-nova">
            <Brain size={16} />
          </div>
        );
      case "success":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald/20 border border-emerald/30 flex items-center justify-center text-emerald">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 16V16.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 2L21 19H3L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 18L6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-orion/20 border border-orion/30 flex items-center justify-center text-orion">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V16.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 8V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] w-full pt-8 pb-8">
      {/* Main header content */}
      <div className="container flex items-center justify-between px-4">
        <div className="flex items-center gap-6 cursor-pointer">
          <div
            className="relative"
            onClick={() => window.open("https://nodo.xyz", "_blank")}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/nodo-logo.png"
                alt="NODO AI Logo"
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              <div className="h-full w-full rounded-full bg-nova/30 blur-md" />
            </motion.div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Connect Wallet Button */}
          <ConnectWalletButton />

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden focus-ring h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={14} className="text-white/70" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden container backdrop-blur-2xl border-b border-white/10"
          >
            <div className="bg-black/20 rounded-lg my-2 overflow-hidden">
              {/* Mobile AI Status removed */}

              {/* Navigation Links */}
              <nav className="flex flex-col p-2">
                <Link
                  to="/"
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    location.pathname === "/"
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Zap
                    size={16}
                    className={location.pathname === "/" ? "text-nova" : ""}
                  />
                  <span className="font-medium">Vaults</span>
                </Link>
              </nav>

              {/* AI Features section removed */}

              {/* Language switcher in mobile menu */}
              <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-white/70 mb-3 px-3">
                  <Globe size={16} className="text-nova" />
                  <span className="text-sm">Language</span>
                </div>
                <div className="px-3 mb-3">
                  <LanguageSwitcher className="w-full" />
                </div>
              </div>

              {/* Close button */}
              <div className="p-3 border-t border-white/5">
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                >
                  Close Menu
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Drawer */}
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-md bg-[#121620]/95 backdrop-blur-xl border-l border-white/10 p-0 pt-10">
          <SheetHeader className="px-4 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-nova" />
                <SheetTitle className="text-lg font-medium text-white">
                  Notifications
                </SheetTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs font-medium h-8 hover:bg-white/10 text-white/70"
                >
                  Mark all as read
                </Button>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-white/10"
                  >
                    <X size={14} className="text-white/70" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetHeader>

          <div className="py-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-white/60">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Bell size={24} className="text-white/30" />
                </div>
                <p className="text-white/60 font-medium">
                  No notifications yet
                </p>
                <p className="text-white/40 text-sm mt-1">
                  We'll notify you of important updates
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start p-4 transition-all duration-300 hover:bg-white/5 cursor-pointer ${
                      notification.read ? "bg-transparent" : "bg-white/5"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mr-3">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h4
                          className={`font-medium text-sm ${
                            notification.read ? "text-white/70" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-xs text-white/40 ml-2 whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          notification.read ? "text-white/60" : "text-white/80"
                        }`}
                      >
                        {notification.message}
                      </p>

                      {notification.aiAction && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 py-0 text-[11px] font-medium rounded bg-nova/10 text-nova hover:bg-nova/20 hover:text-white"
                          >
                            <div className="flex items-center gap-1">
                              <span>{notification.aiAction}</span>
                              <ExternalLink size={10} />
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-nova ml-2 mt-1 shrink-0"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Actions Footer */}
          <div className="mt-auto border-t border-white/10 p-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-sm font-normal text-white/70 hover:text-white hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} />
                  <span>Notification Settings</span>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-sm font-normal text-white/70 hover:text-white hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <Cpu size={14} />
                  <span>AI Notification Preferences</span>
                </div>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
