import { useEffect, useState } from "react";
import { PATH_ROUTER } from "@/config/router";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Icon from "@/components/icon";

const rawPageRoutes = [
  {
    icon: "Vault",
    label: "Vaults",
    path: PATH_ROUTER.VAULTS,
  },
  {
    icon: "Leaderboards",
    label: "Leaderboards",
    path: PATH_ROUTER.LEADERBOARDS,
  },
] as const;
const pageRoutes = rawPageRoutes.filter((i) => i.path);

export function MobileNavigation() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = useLocation()?.pathname;

  useEffect(() => {
    const container = document.getElementById("main-layout-content");
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (pageRoutes.length == 1 && pathname == pageRoutes[0].path) {
    return;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full pt-2 px-3 pb-5 bg-[#1D1F24] z-50 transition-all duration-500",
        show ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex">
        {pageRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `w-full flex flex-col items-center gap-1 p-0 rounded-lg transition-colors duration-200 text-white ${
                isActive || pageRoutes.length == 1
                  ? "opacity-100  "
                  : "opacity-50 "
              }`
            }
          >
            <Icon name={route.icon} className="h-4 w-4" color="currentColor" />
            <span className="font-sans text-xs">{route.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
