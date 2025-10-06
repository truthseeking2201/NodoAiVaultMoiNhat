
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, trackClassName, rangeClassName, thumbClassName, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      data-slot="track"
      className={cn(
        "relative h-[4px] w-full grow overflow-hidden rounded-full bg-white/12",
        trackClassName
      )}
    >
      <SliderPrimitive.Range
        data-slot="range"
        className={cn(
          "absolute h-full bg-gradient-to-r from-[#FF8A65] to-[#26A69A]",
          rangeClassName
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      data-slot="thumb"
      className={cn(
        "block h-4 w-4 rounded-full border border-white/40 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-transform duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2",
        thumbClassName
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
