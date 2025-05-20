import { useEffect, useState } from "react";
import { useIsMobile } from "./use-mobile";

export const useIsChromeDesktop = () => {
  const [isChromeDesktop, setIsChromeDesktop] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isDesktop = !/mobile|android|iphone|ipad|ipod/.test(userAgent);
    const isSupportedBrowser = isChrome && isDesktop && !isMobile;

    setIsChromeDesktop(isSupportedBrowser);
  }, [isMobile]);

  return { isChromeDesktop, isMobile };
};
