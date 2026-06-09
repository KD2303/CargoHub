"use client";

/**
 * HeroIllustration — Premium Logistics Scene Animation
 *
 * Architecture:
 *  Each element uses a two-stage motion pattern:
 *  1. Entrance: motion.div with initial/animate for the enter-from state
 *  2. Ambient: inner motion.div that starts its loop after the entrance delay
 *
 * Animation wave sequence:
 *  0.00s  Back racks      — slide from right
 *  0.12s  Second rack     — slide from right, slightly offset
 *  0.30s  Warehouse       — slide from right
 *  0.70s  Container       — drops in with spring bounce
 *  1.00s  Big truck       — diagonal from upper-left
 *  1.20s  Small truck     — diagonal from upper-left, trailing
 *  1.40s  Forklift        — diagonal from upper-right
 *  1.60s  Worker stacker  — diagonal from upper-right
 *  1.75s  Worker pallet   — diagonal from upper-right, trailing
 *  1.90s  Scale           — rises from below
 *  2.00s  Empty pallets   — slide from right
 *  2.15s  Pallet+boxes    — slide from right
 */

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image, { StaticImageData } from "next/image";

// ─── Easing presets ───────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
const SPRING_SOFT   = { type: "spring" as const, stiffness: 45, damping: 15, mass: 1.0 };
const SPRING_BOUNCE = { type: "spring" as const, stiffness: 60, damping: 12, mass: 1.0 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 75, damping: 16, mass: 1.0 };

// ─── Entrance "from" states ───────────────────────────────────────────────────
const FROM = {
  rack:          { opacity: 0, x: 300, scale: 0.9, filter: "blur(2px)" },
  warehouse:     { opacity: 0, x: 450, scale: 0.95 },
  container:     { opacity: 0, y: -80, scale: 0.95 },
  truckBig:      { opacity: 0, x: -120, y: -80, rotate: -4 },
  truckSmall:    { opacity: 0, x: -100, y: -60, rotate: -3 },
  forklift:      { opacity: 0, x: 80,   y: -60, rotate: 3 },
  workerStacker: { opacity: 0, x: 70,   y: -60, rotate: 3 },
  workerPallet:  { opacity: 0, x: 80,   y: -50, rotate: 4 },
  scale:         { opacity: 0, y: 40, scale: 0.9 },
  smallItem:     { opacity: 0, x: 250, scale: 0.8 },
};

// ─── Entrance "to" states ─────────────────────────────────────────────────────
const TO_VISIBLE = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" };

// ─── A single animated scene element ─────────────────────────────────────────
interface SceneElementProps {
  src: StaticImageData;
  alt: string;
  positionClass: string;       // absolute position + z-index classes
  dropShadow?: string;         // tailwind drop-shadow class
  from: any;                   // entrance "hidden" state
  enterTransition: any;        // framer transition for entrance
  delay: number;               // entrance delay in seconds
  ambient?: {                  // optional perpetual loop after entrance
    keyframes: any;
    duration: number;
    loopDelay?: number;        // extra start delay before first loop
  };
  priority?: boolean;
  trigger: boolean;
}

function SceneElement({
  src,
  alt,
  positionClass,
  dropShadow = "drop-shadow-md",
  from,
  enterTransition,
  delay,
  ambient,
  priority = false,
  trigger,
}: SceneElementProps) {
  const reducedMotion = useReducedMotion();

  // In reduced-motion mode render statically
  if (reducedMotion) {
    return (
      <div className={positionClass}>
        <Image src={src} alt={alt} className={`w-full h-auto object-contain ${dropShadow}`} />
      </div>
    );
  }

  const ambientAnimProps = ambient && trigger
    ? {
        animate: {
          ...ambient.keyframes,
          transition: {
            delay: delay + (ambient.loopDelay ?? 1.2),
            duration: ambient.duration,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
      }
    : {};

  return (
    <motion.div
      className={positionClass}
      initial={from}
      animate={trigger ? TO_VISIBLE : from}
      transition={{ ...enterTransition, delay }}
    >
      {/* Inner div handles ambient loop independently */}
      <motion.div
        className="w-full"
        {...ambientAnimProps}
      >
        <Image
          src={src}
          alt={alt}
          className={`w-full h-auto object-contain ${dropShadow}`}
          priority={priority}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeroIllustrationProps {
  images: {
    img1:  StaticImageData;  // Big truck
    img2:  StaticImageData;  // Small truck
    img3:  StaticImageData;  // Forklift
    img4:  StaticImageData;  // Scale / scanner
    img5:  StaticImageData;  // Worker with pallet jack
    img6:  StaticImageData;  // Worker with stacker
    img7:  StaticImageData;  // Empty pallets
    img8:  StaticImageData;  // Pallet with boxes
    img9:  StaticImageData;  // (reserved / extra)
    img10: StaticImageData;  // Warehouse
    img11: StaticImageData;  // Storage rack
    img12: StaticImageData;  // Shipping container
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function HeroIllustration({ images }: HeroIllustrationProps) {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setTrigger(true);
  }, []);

  return (
    <div className="relative w-full aspect-[1.1] scale-100 lg:scale-[1.15] lg:translate-x-[2%]">

      {/* ── Wave 0: Back rack — depth layer ─────────────────────────────────── */}
      <SceneElement
        src={images.img11}
        alt="Storage rack"
        positionClass="absolute top-[10%] right-[-22%] w-[35%] z-0"
        dropShadow="drop-shadow-sm"
        from={FROM.rack}
        enterTransition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        delay={0.0}
        priority
        trigger={trigger}
      />

      {/* ── Wave 0b: Second rack ─────────────────────────────────────────────── */}
      <SceneElement
        src={images.img11}
        alt="Storage rack"
        positionClass="absolute top-[20%] right-[-34%] w-[35%] z-[1]"
        dropShadow="drop-shadow-sm"
        from={FROM.rack}
        enterTransition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        delay={0.15}
        trigger={trigger}
      />

      {/* ── Wave 1: Warehouse ────────────────────────────────────────────────── */}
      <SceneElement
        src={images.img10}
        alt="Warehouse building"
        positionClass="absolute top-[15%] right-[-16%] w-[60%] z-20"
        dropShadow="drop-shadow-xl"
        from={FROM.warehouse}
        enterTransition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
        delay={0.35}
        priority
        trigger={trigger}
      />

      {/* ── Wave 2: Shipping container — bouncy drop ─────────────────────────── */}
      <SceneElement
        src={images.img12}
        alt="Shipping container"
        positionClass="absolute bottom-[52%] right-[90%] w-[32%] z-10"
        dropShadow="drop-shadow-md"
        from={FROM.container}
        enterTransition={SPRING_BOUNCE}
        delay={0.75}
        trigger={trigger}
      />

      {/* ── Wave 3: Big truck — upper-left diagonal ───────────────────────────── */}
      <SceneElement
        src={images.img1}
        alt="Large cargo truck"
        positionClass="absolute bottom-[25%] right-[85%] w-[42%] z-40"
        dropShadow="drop-shadow-2xl"
        from={FROM.truckBig}
        enterTransition={SPRING_SOFT}
        delay={1.1}
        ambient={{
          keyframes: { y: [0, -6, -3, 0], rotate: [0, 0.4, -0.2, 0] },
          duration: 4.2,
          loopDelay: 1.4,
        }}
        priority
        trigger={trigger}
      />

      {/* ── Wave 4: Small truck — upper-left diagonal ─────────────────────────── */}
      <SceneElement
        src={images.img2}
        alt="Small cargo truck"
        positionClass="absolute bottom-[35%] left-[0%] w-[25%] z-30"
        dropShadow="drop-shadow-lg"
        from={FROM.truckSmall}
        enterTransition={SPRING_SOFT}
        delay={1.35}
        ambient={{
          keyframes: { y: [0, -5, -2, 0], rotate: [0, 0.3, -0.15, 0] },
          duration: 3.8,
          loopDelay: 1.3,
        }}
        trigger={trigger}
      />

      {/* ── Wave 5: Forklift — mechanical horizontal slide ───────────────────── */}
      <SceneElement
        src={images.img3}
        alt="Forklift"
        positionClass="absolute top-[32%] left-[12%] w-[25%] z-20"
        dropShadow="drop-shadow-md"
        from={FROM.forklift}
        enterTransition={SPRING_SNAPPY}
        delay={1.6}
        ambient={{
          keyframes: { x: [0, 2, -1, 0], rotate: [0, 0.3, -0.2, 0] },
          duration: 3.8,
          loopDelay: 1.2,
        }}
        trigger={trigger}
      />

      {/* ── Wave 6: Worker (stacker) — upper-right diagonal ──────────────────── */}
      <SceneElement
        src={images.img6}
        alt="Warehouse worker with stacker"
        positionClass="absolute top-[52%] left-[26%] w-[23%] z-30"
        dropShadow="drop-shadow-md"
        from={FROM.workerStacker}
        enterTransition={SPRING_SOFT}
        delay={1.85}
        ambient={{
          keyframes: { y: [0, -4, 0] },
          duration: 3.0,
          loopDelay: 1.2,
        }}
        trigger={trigger}
      />

      {/* ── Wave 7: Worker (pallet jack) — upper-right diagonal ──────────────── */}
      <SceneElement
        src={images.img5}
        alt="Worker with pallet jack"
        positionClass="absolute bottom-[40%] left-[20%] w-[25%] z-40"
        dropShadow="drop-shadow-lg"
        from={FROM.workerPallet}
        enterTransition={SPRING_SOFT}
        delay={2.05}
        ambient={{
          keyframes: { y: [0, -4.5, 0] },
          duration: 3.2,
          loopDelay: 1.15,
        }}
        trigger={trigger}
      />

      {/* ── Wave 8: Scale / cargo scanner ────────────────────────────────────── */}
      <SceneElement
        src={images.img4}
        alt="Cargo scale"
        positionClass="absolute bottom-[25%] right-[30%] w-[22%] z-40"
        dropShadow="drop-shadow-lg"
        from={FROM.scale}
        enterTransition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
        delay={2.25}
        trigger={trigger}
      />

      {/* ── Wave 9: Empty pallets ─────────────────────────────────────────────── */}
      <SceneElement
        src={images.img7}
        alt="Empty pallets"
        positionClass="absolute bottom-[40%] left-[102%] w-[20%] z-30"
        dropShadow="drop-shadow-md"
        from={FROM.smallItem}
        enterTransition={SPRING_BOUNCE}
        delay={2.4}
        ambient={{
          keyframes: { scale: [1, 1.025, 1] },
          duration: 3.5,
          loopDelay: 1.1,
        }}
        trigger={trigger}
      />

      {/* ── Wave 10: Pallet with boxes ────────────────────────────────────────── */}
      <SceneElement
        src={images.img8}
        alt="Pallet with cargo boxes"
        positionClass="absolute bottom-[30%] left-[92%] w-[20%] z-50"
        dropShadow="drop-shadow-md"
        from={FROM.smallItem}
        enterTransition={SPRING_BOUNCE}
        delay={2.6}
        ambient={{
          keyframes: { scale: [1, 1.03, 1] },
          duration: 3.8,
          loopDelay: 1.05,
        }}
        trigger={trigger}
      />

    </div>
  );
}
