import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Exact color palette adhering to the site's warm aesthetic
const COLORS = {
  ink: '#4A3B32',
  petalCream: '#FFFDF8',
  petalAmber: '#F59E0B',
  petalApricot: '#F4A261',
  petalTerracotta: '#E07A5F',
  petalGold: '#FEF08A',
  centerDeep: '#D97706',
  centerWarm: '#C85A48',
  stemSage: '#658B6F',
  leafSage: '#78A083',
  stemOlive: '#4D6A54',
  blush: '#FCA5A5',
  wing: 'rgba(255, 255, 255, 0.9)',
};

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
}

interface FlowerConfig {
  id: string;
  type: 'daisy' | 'tulip' | 'poppy' | 'chamomile' | 'bellflower' | 'sprig' | 'sunflower';
  height: number; // in px
  stemCurve: number; // curvature offset
  primaryColor: string;
  secondaryColor: string;
  leafType: 'double' | 'single-left' | 'single-right' | 'fern';
  scale: number;
  initialTilt: number;
}

// Organic variety of flowers across the meadow border
const FLOWER_SEEDS: FlowerConfig[] = [
  { id: 'f1', type: 'daisy', height: 68, stemCurve: -4, primaryColor: COLORS.petalCream, secondaryColor: COLORS.centerDeep, leafType: 'double', scale: 0.95, initialTilt: -2 },
  { id: 'f2', type: 'tulip', height: 60, stemCurve: 3, primaryColor: COLORS.petalTerracotta, secondaryColor: COLORS.centerWarm, leafType: 'single-left', scale: 0.9, initialTilt: 3 },
  { id: 'f3', type: 'sprig', height: 76, stemCurve: -5, primaryColor: COLORS.petalAmber, secondaryColor: COLORS.stemSage, leafType: 'fern', scale: 1.0, initialTilt: -4 },
  { id: 'f4', type: 'chamomile', height: 64, stemCurve: 2, primaryColor: COLORS.petalCream, secondaryColor: COLORS.petalAmber, leafType: 'single-right', scale: 0.9, initialTilt: 2 },
  { id: 'f5', type: 'poppy', height: 72, stemCurve: 5, primaryColor: COLORS.petalApricot, secondaryColor: COLORS.ink, leafType: 'double', scale: 1.05, initialTilt: 4 },
  { id: 'f6', type: 'bellflower', height: 58, stemCurve: -3, primaryColor: COLORS.petalTerracotta, secondaryColor: COLORS.stemSage, leafType: 'single-left', scale: 0.88, initialTilt: -3 },
  { id: 'f7', type: 'sunflower', height: 80, stemCurve: 4, primaryColor: COLORS.petalGold, secondaryColor: COLORS.centerDeep, leafType: 'double', scale: 1.1, initialTilt: 3 },
  { id: 'f8', type: 'daisy', height: 62, stemCurve: -2, primaryColor: COLORS.petalAmber, secondaryColor: COLORS.petalCream, leafType: 'single-right', scale: 0.92, initialTilt: -1 },
  { id: 'f9', type: 'tulip', height: 70, stemCurve: -5, primaryColor: COLORS.petalApricot, secondaryColor: COLORS.centerWarm, leafType: 'double', scale: 0.98, initialTilt: -3 },
  { id: 'f10', type: 'sprig', height: 56, stemCurve: 3, primaryColor: COLORS.petalGold, secondaryColor: COLORS.stemOlive, leafType: 'fern', scale: 0.85, initialTilt: 2 },
  { id: 'f11', type: 'poppy', height: 74, stemCurve: -3, primaryColor: COLORS.petalCream, secondaryColor: COLORS.centerDeep, leafType: 'single-left', scale: 1.02, initialTilt: -2 },
  { id: 'f12', type: 'bellflower', height: 63, stemCurve: 4, primaryColor: COLORS.petalTerracotta, secondaryColor: COLORS.petalAmber, leafType: 'single-right', scale: 0.9, initialTilt: 3 },
  { id: 'f13', type: 'chamomile', height: 71, stemCurve: -4, primaryColor: COLORS.petalGold, secondaryColor: COLORS.centerWarm, leafType: 'double', scale: 1.0, initialTilt: -2 },
  { id: 'f14', type: 'daisy', height: 66, stemCurve: 3, primaryColor: COLORS.petalCream, secondaryColor: COLORS.petalAmber, leafType: 'single-left', scale: 0.95, initialTilt: 2 },
  { id: 'f15', type: 'sunflower', height: 78, stemCurve: -4, primaryColor: COLORS.petalAmber, secondaryColor: COLORS.centerDeep, leafType: 'double', scale: 1.08, initialTilt: -3 },
  { id: 'f16', type: 'tulip', height: 62, stemCurve: 2, primaryColor: COLORS.petalTerracotta, secondaryColor: COLORS.centerWarm, leafType: 'single-right', scale: 0.92, initialTilt: 2 },
];

export const FlowerDoodleBorder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredFlowerId, setHoveredFlowerId] = useState<string | null>(null);
  const [butterflyPos, setButterflyPos] = useState<{ x: number; y: number }>({ x: 280, y: 32 });
  const [isButterflyLanded, setIsButterflyLanded] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Graceful fluttering flight path for the butterfly when not visiting a flower
  useEffect(() => {
    if (hoveredFlowerId) return;

    let angle = 0;
    const interval = setInterval(() => {
      if (hoveredFlowerId) return;
      angle += 0.04;
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth || 900;
      // Gentle fluttering sine wave across the flowers in full view
      const x = (Math.sin(angle * 0.42) * 0.38 + 0.5) * width;
      const y = 30 + Math.sin(angle * 1.6) * 12;
      setButterflyPos({ x, y });
      setIsButterflyLanded(false);
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [hoveredFlowerId]);

  // Clean up particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(6));
    }, 750);
    return () => clearTimeout(timer);
  }, [particles]);

  const handleFlowerHover = (flowerId: string, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredFlowerId(flowerId);
    setIsButterflyLanded(true);

    const target = event.currentTarget;
    if (containerRef.current && target) {
      // Calculate position relative to container
      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      const targetTop = target.offsetTop;
      setButterflyPos({ x: targetCenter, y: targetTop - 6 });
    }
  };

  const handleFlowerLeave = () => {
    setHoveredFlowerId(null);
    setIsButterflyLanded(false);
  };

  const handleFlowerClick = (e: React.MouseEvent<HTMLDivElement>, flower: FlowerConfig) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    // Emit 6 cute doodle petal particles in the website color palette
    const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = 25 + Math.random() * 32;
      return {
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 22,
        color: [flower.primaryColor, flower.secondaryColor, COLORS.petalGold, COLORS.petalApricot, COLORS.petalTerracotta][i % 5],
        size: 5 + Math.random() * 4,
        rotation: Math.random() * 360,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible select-none pointer-events-auto"
      style={{ minHeight: '135px' }}
    >
      {/* 
        ORGANIC HAND-DRAWN WAVY FOOTER BORDER (Replaces straight CSS border-t)
        The wave path defines the bottom edge where flowers take root, and transitions cleanly into the footer background
      */}
      <div className="absolute inset-x-0 bottom-0 top-[40px] pointer-events-none">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 95"
        >
          {/* Soft translucent footer background filling underneath the organic wave */}
          <path
            d="M0,45 Q180,28 360,44 T720,36 T1080,46 T1440,38 L1440,95 L0,95 Z"
            fill="rgba(255, 255, 255, 0.82)"
          />

          {/* Organic Hand-Drawn Primary Vine Border Line */}
          <path
            d="M0,45 Q180,28 360,44 T720,36 T1080,46 T1440,38"
            fill="none"
            stroke={COLORS.stemSage}
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Hand-drawn ink jitter accent along the vine */}
          <path
            d="M0,46 Q180,30 360,45 T720,37 T1080,47 T1440,39"
            fill="none"
            stroke={COLORS.ink}
            strokeWidth="1.2"
            strokeDasharray="5 7"
            opacity="0.4"
          />

          {/* Whimsical curling tendrils and sprout leaves along the border line */}
          <g fill={COLORS.leafSage} stroke={COLORS.ink} strokeWidth="1.1" strokeLinecap="round">
            {/* Tendril loop 1 */}
            <path
              d="M140,35 C150,22 165,24 160,33 C156,40 148,36 150,32"
              fill="none"
              stroke={COLORS.stemSage}
              strokeWidth="1.8"
            />
            <ellipse cx="163" cy="26" rx="3.5" ry="2" transform="rotate(-30 163 26)" />

            {/* Tendril loop 2 */}
            <path
              d="M520,38 C532,24 548,26 542,36 C538,42 530,38 532,34"
              fill="none"
              stroke={COLORS.stemSage}
              strokeWidth="1.8"
            />
            <ellipse cx="545" cy="28" rx="3.5" ry="2" transform="rotate(-25 545 28)" />

            {/* Tendril loop 3 */}
            <path
              d="M880,43 C892,28 908,30 902,40 C898,46 890,42 892,38"
              fill="none"
              stroke={COLORS.stemSage}
              strokeWidth="1.8"
            />
            <ellipse cx="905" cy="32" rx="3.5" ry="2" transform="rotate(-25 905 32)" />

            {/* Tendril loop 4 */}
            <path
              d="M1260,39 C1272,25 1288,27 1282,37 C1278,43 1270,39 1272,35"
              fill="none"
              stroke={COLORS.stemSage}
              strokeWidth="1.8"
            />
            <ellipse cx="1285" cy="29" rx="3.5" ry="2" transform="rotate(-25 1285 29)" />

            {/* Small leaves along the wavy vine */}
            <ellipse cx="260" cy="40" rx="4" ry="2" transform="rotate(20 260 40)" />
            <ellipse cx="420" cy="42" rx="4.5" ry="2.2" transform="rotate(-15 420 42)" />
            <ellipse cx="640" cy="37" rx="4" ry="2" transform="rotate(18 640 37)" />
            <ellipse cx="800" cy="42" rx="4.5" ry="2.2" transform="rotate(-20 800 42)" />
            <ellipse cx="1010" cy="45" rx="4" ry="2" transform="rotate(15 1010 45)" />
            <ellipse cx="1180" cy="40" rx="4.5" ry="2.2" transform="rotate(-18 1180 40)" />
            <ellipse cx="1360" cy="40" rx="4" ry="2" transform="rotate(15 1360 40)" />
          </g>
        </svg>
      </div>

      {/* Flower Meadow Row Sprouting from the Wavy Border */}
      <div className="relative z-10 w-full flex items-end justify-between px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto pt-6 pb-2">
        {FLOWER_SEEDS.map((flower) => {
          const isHovered = hoveredFlowerId === flower.id;

          return (
            <motion.div
              key={flower.id}
              className="relative flex flex-col items-center cursor-pointer group"
              style={{
                transformOrigin: 'bottom center',
                zIndex: isHovered ? 25 : 10,
              }}
              initial={{ rotate: flower.initialTilt }}
              animate={{
                rotate: isHovered
                  ? [flower.initialTilt, flower.initialTilt - 14, flower.initialTilt + 12, flower.initialTilt - 6, flower.initialTilt]
                  : flower.initialTilt,
                scale: isHovered ? 1.15 : 1.0,
                y: isHovered ? -5 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 12,
                mass: 0.8,
              }}
              onMouseEnter={(e) => handleFlowerHover(flower.id, e)}
              onMouseLeave={handleFlowerLeave}
              onClick={(e) => handleFlowerClick(e, flower)}
            >
              {/* Individual Flower Vector Graphic */}
              <FlowerSvg flower={flower} isHovered={isHovered} />
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Butterfly Companion (Always prominently visible in z-50) */}
      <motion.div
        className="absolute pointer-events-none z-50"
        style={{ left: 0, top: 0 }}
        animate={{
          x: butterflyPos.x - 20,
          y: butterflyPos.y - 18,
          rotate: isButterflyLanded ? [-4, 4, -2, 2, 0] : [0, 8, -8, 0],
        }}
        transition={{
          x: { type: 'spring', stiffness: isButterflyLanded ? 220 : 75, damping: 15 },
          y: { type: 'spring', stiffness: isButterflyLanded ? 220 : 75, damping: 15 },
          rotate: {
            repeat: Infinity,
            repeatType: 'reverse',
            duration: isButterflyLanded ? 0.6 : 1.2,
            ease: 'easeInOut',
          },
        }}
      >
        <ButterflySvg isLanded={isButterflyLanded} />
      </motion.div>

      {/* Floating Petal Sparkle Particles when user clicks a flower */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-50 border border-[#4A3B32]/30 shadow-sm"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              scale: [0, 1.4, 0.9],
              x: p.vx,
              y: p.vy,
              opacity: [1, 0.9, 0],
              rotate: p.rotation,
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Flower SVG Builder with playful hand-drawn doodle aesthetic
const FlowerSvg: React.FC<{ flower: FlowerConfig; isHovered: boolean }> = ({ flower, isHovered }) => {
  const { type, height, stemCurve, primaryColor, secondaryColor, leafType } = flower;
  const width = 44;
  const flowerCenterY = 18;
  const stemBottomY = height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <filter id={`doodle-shadow-${flower.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#3B2E26" floodOpacity="0.12" />
        </filter>
        <filter id={`doodle-glow-${flower.id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Stem */}
      <path
        d={`M${width / 2},${stemBottomY} Q${width / 2 + stemCurve},${(stemBottomY + flowerCenterY) / 2} ${width / 2},${flowerCenterY + 4}`}
        fill="none"
        stroke={COLORS.stemSage}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Hand-drawn ink jitter for stem */}
      <path
        d={`M${width / 2},${stemBottomY} Q${width / 2 + stemCurve * 0.9},${(stemBottomY + flowerCenterY) / 2} ${width / 2},${flowerCenterY + 4}`}
        fill="none"
        stroke={COLORS.ink}
        strokeWidth="0.9"
        strokeDasharray="2 3"
        opacity="0.4"
      />

      {/* Leaves branching from stem */}
      {leafType === 'double' && (
        <g stroke={COLORS.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Left leaf */}
          <path
            d={`M${width / 2 - 1},${stemBottomY - 14} C${width / 2 - 12},${stemBottomY - 18} ${width / 2 - 14},${stemBottomY - 26} ${width / 2 - 3},${stemBottomY - 22} Z`}
            fill={COLORS.leafSage}
          />
          {/* Right leaf */}
          <path
            d={`M${width / 2 + 1},${stemBottomY - 18} C${width / 2 + 12},${stemBottomY - 22} ${width / 2 + 15},${stemBottomY - 30} ${width / 2 + 3},${stemBottomY - 26} Z`}
            fill={COLORS.leafSage}
          />
        </g>
      )}

      {leafType === 'single-left' && (
        <path
          d={`M${width / 2 - 1},${stemBottomY - 16} C${width / 2 - 14},${stemBottomY - 18} ${width / 2 - 15},${stemBottomY - 28} ${width / 2 - 2},${stemBottomY - 24} Z`}
          fill={COLORS.leafSage}
          stroke={COLORS.ink}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}

      {leafType === 'single-right' && (
        <path
          d={`M${width / 2 + 1},${stemBottomY - 16} C${width / 2 + 14},${stemBottomY - 18} ${width / 2 + 15},${stemBottomY - 28} ${width / 2 + 2},${stemBottomY - 24} Z`}
          fill={COLORS.leafSage}
          stroke={COLORS.ink}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}

      {leafType === 'fern' && (
        <g fill={COLORS.leafSage} stroke={COLORS.ink} strokeWidth="1" strokeLinecap="round">
          <circle cx={width / 2 - 7} cy={stemBottomY - 14} r="2.8" />
          <circle cx={width / 2 + 7} cy={stemBottomY - 18} r="2.8" />
          <circle cx={width / 2 - 6} cy={stemBottomY - 24} r="2.4" />
          <circle cx={width / 2 + 6} cy={stemBottomY - 28} r="2.4" />
        </g>
      )}

      {/* Flower Blossom Head */}
      <g filter={isHovered ? `url(#doodle-glow-${flower.id})` : `url(#doodle-shadow-${flower.id})`}>
        {/* TYPE 1: DAISY (6 rounded petals) */}
        {type === 'daisy' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <ellipse
                  cx="0"
                  cy="-9"
                  rx="4.2"
                  ry="6.5"
                  fill={primaryColor}
                  stroke={COLORS.ink}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </g>
            ))}
            {/* Center disk */}
            <circle cx="0" cy="0" r="5.2" fill={secondaryColor} stroke={COLORS.ink} strokeWidth="1.4" />
            <circle cx="-1.5" cy="-1.5" r="1.2" fill="#FFFDF8" opacity="0.8" />
          </g>
        )}

        {/* TYPE 2: TULIP (Classic 3-petal cup) */}
        {type === 'tulip' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            {/* Left petal */}
            <path
              d="M-8,-4 C-10,-12 -2,-17 0,-14 C-1,-6 -3,-1 -8,-4 Z"
              fill={secondaryColor}
              stroke={COLORS.ink}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Right petal */}
            <path
              d="M8,-4 C10,-12 2,-17 0,-14 C1,-6 3,-1 8,-4 Z"
              fill={secondaryColor}
              stroke={COLORS.ink}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Center main petal */}
            <path
              d="M0,4 C-7,4 -8,-8 -5,-16 C-2,-14 0,-12 0,-12 C0,-12 2,-14 5,-16 C8,-8 7,4 0,4 Z"
              fill={primaryColor}
              stroke={COLORS.ink}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* TYPE 3: POPPY (4 wide ruffled petals with dark seed center) */}
        {type === 'poppy' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            <circle cx="-6" cy="-4" r="7" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.3" />
            <circle cx="6" cy="-4" r="7" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.3" />
            <circle cx="0" cy="3" r="7.5" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.3" />
            <circle cx="0" cy="-7" r="7.5" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.3" />
            {/* Center */}
            <circle cx="0" cy="-2" r="4.2" fill={secondaryColor} stroke={COLORS.ink} strokeWidth="1.2" />
            <circle cx="0" cy="-2" r="1.8" fill={COLORS.petalGold} />
          </g>
        )}

        {/* TYPE 4: CHAMOMILE (Dense radiating ray petals) */}
        {type === 'chamomile' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <line
                  x1="0"
                  y1="-3"
                  x2="0"
                  y2="-10.5"
                  stroke={primaryColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="0"
                  y1="-3"
                  x2="0"
                  y2="-10.5"
                  stroke={COLORS.ink}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </g>
            ))}
            <circle cx="0" cy="0" r="5.5" fill={secondaryColor} stroke={COLORS.ink} strokeWidth="1.4" />
            <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFFDF8" opacity="0.8" />
          </g>
        )}

        {/* TYPE 5: BELLFLOWER (Draped delicate bell) */}
        {type === 'bellflower' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            <path
              d="M0,-12 C-7,-10 -9,0 -6,4 C-4,1 -2,2 0,0 C2,2 4,1 6,4 C9,0 7,-10 0,-12 Z"
              fill={primaryColor}
              stroke={COLORS.ink}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Pollen drops */}
            <circle cx="-2" cy="6" r="1.2" fill={COLORS.petalAmber} stroke={COLORS.ink} strokeWidth="0.8" />
            <circle cx="2" cy="7" r="1.2" fill={COLORS.petalAmber} stroke={COLORS.ink} strokeWidth="0.8" />
          </g>
        )}

        {/* TYPE 6: SPRIG / LAVENDER (Beaded berry blossoms) */}
        {type === 'sprig' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            <circle cx="-4" cy="4" r="3.2" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.1" />
            <circle cx="4" cy="2" r="3.2" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.1" />
            <circle cx="-3" cy="-3" r="3.0" fill={COLORS.petalApricot} stroke={COLORS.ink} strokeWidth="1.1" />
            <circle cx="3" cy="-5" r="3.0" fill={COLORS.petalApricot} stroke={COLORS.ink} strokeWidth="1.1" />
            <circle cx="0" cy="-11" r="2.8" fill={primaryColor} stroke={COLORS.ink} strokeWidth="1.1" />
          </g>
        )}

        {/* TYPE 7: SUNFLOWER (Warm gold petals + seed spirals) */}
        {type === 'sunflower' && (
          <g transform={`translate(${width / 2}, ${flowerCenterY})`}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <polygon
                  points="0,-12 -2.8,-5 2.8,-5"
                  fill={primaryColor}
                  stroke={COLORS.ink}
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </g>
            ))}
            <circle cx="0" cy="0" r="6" fill={secondaryColor} stroke={COLORS.ink} strokeWidth="1.4" />
            {/* Center spiral doodle dots */}
            <circle cx="-2" cy="-2" r="0.8" fill={COLORS.petalGold} />
            <circle cx="1.5" cy="-1.5" r="0.8" fill={COLORS.petalGold} />
            <circle cx="-1" cy="1.8" r="0.8" fill={COLORS.petalGold} />
            <circle cx="2" cy="1.5" r="0.8" fill={COLORS.petalGold} />
          </g>
        )}
      </g>
    </svg>
  );
};

// Hand-drawn Bumblebee Doodle with flapping wings & blush
// Hand-drawn Doodle Butterfly with fluttering wings, antennae, & warm palette
const ButterflySvg: React.FC<{ isLanded: boolean }> = ({ isLanded }) => {
  return (
    <svg width="44" height="40" viewBox="0 0 44 40" className="overflow-visible drop-shadow-md">
      {/* LEFT WINGS (Forewing & Hindwing) */}
      <motion.g
        animate={{
          scaleX: isLanded ? [1, 0.6, 1] : [1, 0.15, 1],
          rotate: isLanded ? [0, -3, 0] : [0, -8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isLanded ? 0.8 : 0.11,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '22px 21px' }}
      >
        {/* Left Forewing */}
        <path
          d="M22,19 C17,10 6,5 2,12 C-2,18 7,25 22,22 Z"
          fill={COLORS.petalAmber}
          stroke={COLORS.ink}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* Left Forewing Inner Accent */}
        <path
          d="M20,18 C16,13 9,10 6,14 C4,18 10,22 20,20 Z"
          fill={COLORS.petalTerracotta}
          opacity="0.85"
        />
        {/* Cute Cream Wing Spots */}
        <circle cx="8" cy="13" r="1.5" fill={COLORS.petalCream} />
        <circle cx="12" cy="11" r="1.2" fill={COLORS.petalCream} />
        <circle cx="6" cy="18" r="1.1" fill={COLORS.petalCream} />

        {/* Left Hindwing */}
        <path
          d="M22,22 C14,24 5,27 7,33 C9,38 18,36 22,25 Z"
          fill={COLORS.petalApricot}
          stroke={COLORS.ink}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="31" r="1.3" fill={COLORS.petalGold} />
      </motion.g>

      {/* RIGHT WINGS (Forewing & Hindwing) */}
      <motion.g
        animate={{
          scaleX: isLanded ? [1, 0.6, 1] : [1, 0.15, 1],
          rotate: isLanded ? [0, 3, 0] : [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isLanded ? 0.8 : 0.11,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '22px 21px' }}
      >
        {/* Right Forewing */}
        <path
          d="M22,19 C27,10 38,5 42,12 C46,18 37,25 22,22 Z"
          fill={COLORS.petalAmber}
          stroke={COLORS.ink}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* Right Forewing Inner Accent */}
        <path
          d="M24,18 C28,13 35,10 38,14 C40,18 34,22 24,20 Z"
          fill={COLORS.petalTerracotta}
          opacity="0.85"
        />
        {/* Cute Cream Wing Spots */}
        <circle cx="36" cy="13" r="1.5" fill={COLORS.petalCream} />
        <circle cx="32" cy="11" r="1.2" fill={COLORS.petalCream} />
        <circle cx="38" cy="18" r="1.1" fill={COLORS.petalCream} />

        {/* Right Hindwing */}
        <path
          d="M22,22 C30,24 39,27 37,33 C35,38 26,36 22,25 Z"
          fill={COLORS.petalApricot}
          stroke={COLORS.ink}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="31" r="1.3" fill={COLORS.petalGold} />
      </motion.g>

      {/* BUTTERFLY BODY & HEAD */}
      <g>
        {/* Slender Abdomen */}
        <ellipse
          cx="22"
          cy="25"
          rx="2.2"
          ry="7"
          fill={COLORS.ink}
        />

        {/* Thorax */}
        <ellipse
          cx="22"
          cy="18"
          rx="2.8"
          ry="3.5"
          fill={COLORS.ink}
        />

        {/* Head */}
        <circle
          cx="22"
          cy="13"
          r="2.6"
          fill={COLORS.ink}
        />

        {/* Rosy blush cheeks */}
        <circle cx="20" cy="13.8" r="0.9" fill={COLORS.blush} />
        <circle cx="24" cy="13.8" r="0.9" fill={COLORS.blush} />

        {/* Cute Antennae with curled tips */}
        <path
          d="M21,11 C18,6 14,5 13,7 C12,8.5 15,9.5 16,8"
          fill="none"
          stroke={COLORS.ink}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="13" cy="7" r="0.9" fill={COLORS.ink} />

        <path
          d="M23,11 C26,6 30,5 31,7 C32,8.5 29,9.5 28,8"
          fill="none"
          stroke={COLORS.ink}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="31" cy="7" r="0.9" fill={COLORS.ink} />
      </g>
    </svg>
  );
};

export default FlowerDoodleBorder;
