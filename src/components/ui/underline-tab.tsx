import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface UnderlineTabsProps {
  activeTab: number;
  labels: (string | React.ReactNode)[];
  labelClassName?: string;
  underlineWidth?: number;
  duration?: number;
  tabClassName?: string;
  onActiveTabChange?: (tab: number) => void;
}

const UnderlineTabs = ({
  activeTab,
  labels: tabsLabel,
  onActiveTabChange,
  underlineWidth = 50,
  labelClassName,
  tabClassName,
  duration = 300,
}: UnderlineTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);

  const handleTabClick = (index: number) => {
    if (index === selectedTab) return;
    setSelectedTab(index);
    setTimeout(() => {
      // animation takes 300ms
      onActiveTabChange?.(index);
    }, duration);
  };

  useEffect(() => {
    const updateUnderline = () => {
      const activeTabElement = tabRefs.current[activeTab];
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
        const centerOffset = (offsetWidth - underlineWidth) / 2; // Center the underline

        setUnderlineStyle({
          left: offsetLeft + centerOffset,
          width: underlineWidth,
        });
      }
    };
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [activeTab, underlineWidth]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="relative">
        <nav className={cn("flex space-x-8", tabClassName)}>
          {tabsLabel.map((tab, index) => {
            if (typeof tab === "string") {
              return (
                <button
                  key={index}
                  ref={(el) => (tabRefs.current[index] = el)}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    `pb-3 px-1 text-lg font-bold transition-colors duration-200 ${
                      activeTab !== index ? "opacity-50" : ""
                    }`,
                    labelClassName
                  )}
                >
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {tab}
                  </span>
                </button>
              );
            }
            return (
              <div
                key={index}
                ref={(el) => (tabRefs.current[index] = el)}
                onClick={() => handleTabClick(index)}
              >
                {tab}
              </div>
            );
          })}
        </nav>

        {/* Animated Underline */}
        <div
          className={`absolute bottom-0 h-0.5 bg-[linear-gradient(90deg,#FFE8C9_0%,#F9F4E9_25%,#E3F6FF_60%,#C9D4FF_100%)] transition-all duration-${duration} ease-out`}
          style={underlineStyle}
        />
      </div>
    </div>
  );
};

export default UnderlineTabs;
