"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

interface RangeSliderProps {
  rangeLow: string;
  rangeHigh: string;
  // Add other props as needed
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & RangeSliderProps
>(({ className, rangeLow, rangeHigh, ...props }, ref) => {
  // const { rangeLow, rangeHigh } = props;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-neutral-500" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative block  h-4 w-10 rounded-md border border-black bg-cyan-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:w-16">
        <div className="absolute -top-2 left-0 h-8 w-2 rounded-sm border border-black bg-cyan-600"></div>
        <div className="absolute -left-4 -top-7 text-xs md:-left-3">
          {rangeLow}
        </div>
        <div className="absolute -top-2 right-0 h-8 w-2 rounded-sm border border-black bg-cyan-600"></div>
        <div className="absolute -right-4 -top-7 text-xs md:-right-3">
          {rangeHigh}
        </div>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
RangeSlider.displayName = SliderPrimitive.Root.displayName;

export { Slider, RangeSlider };
