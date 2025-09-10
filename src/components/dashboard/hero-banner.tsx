import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { GradientOutlinedButton } from "@/components/ui/gradient-outlined-button";
import useBreakpoint from "@/hooks/use-breakpoint";
import CountUp from "../ui/count-up";
import GradientText from "../ui/gradient-text";
import ArrowRightGradient from "@/assets/icons/arrow-right-gradient";
import { cn } from "@/lib/utils";

type Slide = {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  image: string;
  content?: React.ReactNode;
};

const OutlinedButton = ({
  onClick,
  label = "Read More",
}: {
  onClick: () => void;
  label?: string;
}) => {
  return (
    <GradientOutlinedButton onClick={onClick}>
      <span className="bg-gradient-to-r from-[#FFE8C9] via-[#E3F6FF] to-[#C9D4FF] text-transparent bg-clip-text flex items-center">
        {label}
        <ArrowRightGradient className="md:ml-2 !ml-1" />
      </span>
    </GradientOutlinedButton>
  );
};

const HeroBanner = () => {
  const [active, setActive] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [firstCount, setFirstCount] = useState(true);
  const { isMobile } = useBreakpoint();
  const handleReadMore = useCallback(() => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/nodo-ai-vault-genesis-yield-campaign-phase-1",
      "_blank"
    );
  }, []);

  const handleMigrate = useCallback(() => {
    window.open(
      "https://docs.nodo.xyz/public/nodo-campaigns/move-your-xp-shares-and-gems-to-sui",
      "_blank"
    );
  }, []);

  const slides: Slide[] = useMemo(
    () => [
      {
        title: (
          <GradientText className="text-left md:text-[28px] text-base font-bold md:px-12 px-4 md:py-1">
            Claim your share in {isMobile && <br />} NODO’s Genesis vault
            campaign
          </GradientText>
        ),
        description: (
          <div
            className="text-white font-dm-sans text-[28px] font-bold leading-[36px] tracking-[-0.9px] flex md:flex-row flex-col items-center py-2 md:w-fit w-full md:px-10 px-4 md:my-4"
            style={{
              background: isMobile
                ? "none"
                : "linear-gradient(90deg, rgba(255, 0, 166, 0.00) 0%, rgba(255, 0, 200, 0.60) 12%, rgba(255, 0, 255, 0.60) 25%, rgba(196, 0, 255, 0.60) 38%, rgba(74, 40, 255, 0.60) 50%, rgba(0, 47, 255, 0.60) 62%, rgba(0, 120, 255, 0.60) 75%, rgba(0, 196, 255, 0.60) 88%, rgba(0, 255, 255, 0.00) 100%)",
            }}
          >
            <div className="flex items-center justify-start w-full md:w-fit">
              <img
                src="/coins/usdc.png"
                alt="USDC"
                className="md:h-8 h-4 w-auto md:ml-2"
                width={isMobile ? 16 : 32}
                height={isMobile ? 16 : 32}
              />
              <div className="ml-2 mr-4 flex gap-2 items-center md:text-[32px] text-base  ">
                <div className="md:w-[105px] w-[45px]">
                  <CountUp
                    from={9940}
                    to={10000}
                    duration={2}
                    delay={0}
                    separator=","
                    startWhen={firstCount}
                    onEnd={() => setFirstCount(false)}
                  />
                </div>{" "}
                USDC
              </div>
            </div>
            {!isMobile && (
              <span className="mr-4 md:text-[32px] text-base">+ </span>
            )}
            <div className="flex items-center gap-2 justify-start w-full md:w-fit">
              <img
                src="/coins/xp.png"
                alt="XP"
                className="md:h-8 h-4 w-auto"
                width={isMobile ? 16 : 32}
                height={isMobile ? 16 : 32}
              />
              <div className="flex gap-2 items-center md:text-[32px] text-base ">
                <div className="md:w-[230px] w-[105px]">
                  <CountUp
                    from={1999999940}
                    to={2000000000}
                    duration={2}
                    delay={0}
                    separator=","
                    startWhen={firstCount}
                  />
                </div>{" "}
                XP Shares
              </div>
            </div>
          </div>
        ),
        image: `${
          isMobile
            ? "/banners/hero-banner-mobile.png"
            : "/banners/hero-banner.png"
        }`,
        content: (
          <div className="w-fit md:px-12 px-4">
            <OutlinedButton onClick={handleReadMore} />
          </div>
        ),
      },
      {
        title: (
          <div>
            <GradientText className="text-left md:text-[28px] text-base font-bold md:px-12 px-4 md:py-1 flex items-center justify-left md:flex-wrap flex-nowrap tracking-[-0.9px]">
              <span>Migrate your</span>
              <img
                src="/coins/xp.png"
                alt="xp"
                className="inline md:h-6 h-4 w-auto md:mx-2 mx-1"
              />
              <span>XP Shares & </span>
              <img
                src="/coins/gem.png"
                alt="gem"
                className="inline md:h-6 h-4 w-auto md:mx-2 mx-1"
              />
              <span>GEMs to SUI</span>
            </GradientText>
            <GradientText className="text-left md:text-[28px] text-base font-bold md:px-12 px-4 md:py-1 pt-2 flex items-center justify-left">
              Keep the upside
            </GradientText>
          </div>
        ),
        description: (
          <div className="flex py-2 md:w-fit w-full md:px-12 px-4">
            <div
              className="md:px-4 px-3 md:py-2 py-1 font-bold text-base flex items-center"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,232,201,0.25) 0%, rgba(249,244,233,0.25) 25%, rgba(227,246,255,0.25) 60%, rgba(201,212,255,0.25) 100%)",
              }}
            >
              <GradientText>Before 23:59:59 (UTC) 30 Sep 2025</GradientText>
            </div>
          </div>
        ),
        image: `${
          isMobile
            ? "/banners/migrate-banner-mobile.png"
            : "/banners/migrate-banner.png"
        }`,
        content: (
          <div className="w-fit md:px-12 px-4">
            <OutlinedButton onClick={handleMigrate} label="Migrate Now" />
          </div>
        ),
      },
    ],
    [isMobile, firstCount, handleReadMore, handleMigrate]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [active, slides.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);
  const handleNext = useCallback(() => {
    setActive((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const edgeThreshold = 80; // px from edge
    setShowLeftArrow(x - left < edgeThreshold);
    setShowRightArrow(right - x < edgeThreshold);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowLeftArrow(false);
    setShowRightArrow(false);
  }, []);

  return (
    <section
      className="relative w-full h-[210px] md:h-[210px] flex items-center overflow-hidden md:rounded-xl rounded-none mb-12 "
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optimized banner image */}
      <img
        src={slides[active].image}
        alt={
          active === 0
            ? "NODO AI Vaults Banner"
            : "Migrate your XP Shares and GEMs to SUI"
        }
        className="absolute inset-0 w-full h-full object-cover md:rounded-xl rounded-none z-0"
        width={1720}
        height={210}
        loading="eager"
        {...{ fetchpriority: "high" }}
      />
      <div
        className={cn(
          "relative z-20 h-full text-left max-w-[1000px] md:px-8 w-full",
          active === 1
            ? "md:flex md:flex-col md:justify-center block md:mt-0 mt-4"
            : "flex flex-col justify-center"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col"
          >
            {slides[active].title}
            {slides[active].description}
            {slides[active].content}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Carousel navigation dots with animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            initial={false}
            animate={{
              width: active === idx ? 32 : 16,
              opacity: active === idx ? 1 : 0.5,
              backgroundColor: active === idx ? "#fff" : "#b6a6e7",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              height: 8,
              borderRadius: 4,
              border: "none",
              outline: "none",
              cursor: "pointer",
              boxShadow: active === idx ? "0 0 8px #fff" : "none",
            }}
            className="focus:outline-none"
          />
        ))}
      </div>
      {/* Arrow navigation, only show when mouse near edge */}
      {showLeftArrow && (
        <Button
          variant="ai-outline"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-8 h-8 flex items-center justify-center p-0 pointer-events-auto bg-transparent shadow-none border-none"
          onClick={handlePrev}
          aria-label="Previous slide"
          style={{ background: "none", boxShadow: "none", border: "none" }}
        >
          <ArrowLeft className="text-white w-6 h-6" />
        </Button>
      )}
      {showRightArrow && (
        <Button
          variant="ai-outline"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-8 h-8 flex items-center justify-center p-0 pointer-events-auto bg-transparent shadow-none border-none"
          onClick={handleNext}
          aria-label="Next slide"
          style={{ background: "none", boxShadow: "none", border: "none" }}
        >
          <ArrowRight className="text-white w-6 h-6" />
        </Button>
      )}
    </section>
  );
};

export default HeroBanner;
