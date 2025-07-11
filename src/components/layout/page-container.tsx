
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  const [isReady, setIsReady] = useState(false);

  // Use requestAnimationFrame for smooth content appearance
  useEffect(() => {
    // Use requestAnimationFrame to delay content appearance until browser is ready to paint
    // This helps prevent layout shifts and jank during initial render
    const raf = requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main
      className={cn(
        "flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </main>
  );
}
