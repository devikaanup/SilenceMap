import React, { useState, useEffect, useMemo } from 'react';
import { motion, PanInfo } from 'motion/react';

export interface CardStackProps {
  cards: React.ReactNode[];
  activeIndex?: number;
  onCardChange?: (index: number) => void;
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  animationConfig?: { stiffness: number; damping: number };
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  activeIndex: controlledIndex,
  onCardChange,
  randomRotation = true,
  sensitivity = 80,
  sendToBackOnClick = false,
  animationConfig = { stiffness: 260, damping: 20 },
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  className = '',
}) => {
  const [internalIndex, setInternalIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;
  const numCards = cards.length;

  // Stable organic rotations for cozy 'messy' card stack aesthetic
  const rotations = useMemo(() => {
    if (!randomRotation) return cards.map(() => 0);
    // Pleasant hand-curated slight tilt angles for cards in stack
    const angles = [-2.2, 1.8, -1.4, 2.4, -1.8, 1.5];
    return cards.map((_, i) => angles[i % angles.length]);
  }, [cards, randomRotation]);

  const updateIndex = (nextIndex: number) => {
    const wrapped = (nextIndex + numCards) % numCards;
    if (!isControlled) {
      setInternalIndex(wrapped);
    }
    onCardChange?.(wrapped);
  };

  const handleNext = () => {
    updateIndex(currentIndex + 1);
  };

  // Autoplay support
  useEffect(() => {
    if (!autoplay || (pauseOnHover && isHovered) || numCards <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, pauseOnHover, isHovered, currentIndex, numCards]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      handleNext();
    }
  };

  if (numCards === 0) return null;

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '370px' }}
    >
      <div className="relative w-full h-full">
        {cards.map((cardContent, index) => {
          // Calculate depth in the stack relative to current top card
          const relativeDepth = (index - currentIndex + numCards) % numCards;

          // Limit rendered visible depth to 4 cards for performance & clean layout
          if (relativeDepth >= 4) return null;

          const isTop = relativeDepth === 0;

          // Visual stacking transforms
          const targetY = relativeDepth * 14; // cascade downwards
          const targetScale = 1 - relativeDepth * 0.045; // scale down slightly
          const targetOpacity = relativeDepth === 0 ? 1 : Math.max(0.65, 1 - relativeDepth * 0.15);
          const targetRotate = isTop ? 0 : rotations[index];
          const zIndex = (numCards - relativeDepth) * 10;

          return (
            <motion.div
              key={index}
              className="absolute inset-x-0 top-0 cursor-grab active:cursor-grabbing select-none"
              style={{
                zIndex,
                transformOrigin: 'top center',
              }}
              initial={false}
              animate={{
                y: targetY,
                scale: targetScale,
                rotate: targetRotate,
                opacity: targetOpacity,
              }}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
              drag={isTop ? true : false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={isTop ? handleDragEnd : undefined}
              onClick={() => {
                if (isTop && sendToBackOnClick) {
                  handleNext();
                }
              }}
            >
              <div
                className={`transition-shadow duration-300 ${
                  isTop
                    ? 'shadow-2xl shadow-[#3B2E24]/12'
                    : 'shadow-md shadow-[#3B2E24]/08'
                }`}
              >
                {cardContent}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CardStack;
