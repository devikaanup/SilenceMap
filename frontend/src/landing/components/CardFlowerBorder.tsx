import React from 'react';

// Exact warm botanical palette matching Silence Map landing aesthetic
const C = {
  ink: '#4A3B32',
  cream: '#FFFDF8',
  amber: '#F59E0B',
  apricot: '#F4A261',
  terracotta: '#E07A5F',
  gold: '#FEF08A',
  deepAmber: '#D97706',
  warmRed: '#C85A48',
  stem: '#658B6F',
  leaf: '#78A083',
  softBg: '#FBF6F0',
};

interface CardFlowerBorderProps {
  className?: string;
  variant?: number; // 0, 1, 2, 3 for unique flower variations per stage
}

export const CardFlowerBorder: React.FC<CardFlowerBorderProps> = ({ className = '', variant = 0 }) => {
  // Rotate primary flower colors across stages for charming variety
  const palettes = [
    { primary: C.amber, secondary: C.cream, accent: C.terracotta, center: C.deepAmber },
    { primary: C.terracotta, secondary: C.apricot, accent: C.gold, center: C.warmRed },
    { primary: C.cream, secondary: C.amber, accent: C.apricot, center: C.deepAmber },
    { primary: C.gold, secondary: C.terracotta, accent: C.cream, center: C.deepAmber },
  ];
  const pal = palettes[variant % palettes.length];

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {/* 1. TOP FLOWER GARLAND VINE */}
      <div className="absolute top-0 left-0 right-0 h-8 sm:h-9 overflow-visible z-10 flex items-center justify-center">
        <svg
          viewBox="0 0 540 36"
          preserveAspectRatio="xMidYMin meet"
          className="w-full h-full overflow-visible drop-shadow-[0_1px_2px_rgba(74,59,50,0.08)]"
        >
          <defs>
            <filter id={`doodle-shadow-card-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#3B2E26" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Organic Meandering Vine along top edge */}
          <path
            d="M 10,24 Q 70,12 135,22 T 270,18 T 405,24 T 530,19"
            fill="none"
            stroke={C.stem}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Subtle ink sketch tremor */}
          <path
            d="M 12,24 Q 72,12.5 135,22 T 270,18.5 T 405,24.5 T 528,19"
            fill="none"
            stroke={C.ink}
            strokeWidth="0.8"
            strokeDasharray="3 4"
            opacity="0.35"
          />

          {/* Tendril curl left */}
          <path
            d="M 16,24 C 8,20 4,14 10,10 C 15,7 19,12 14,16"
            fill="none"
            stroke={C.stem}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="9" cy="11" r="1.5" fill={C.ink} />

          {/* Tendril curl right */}
          <path
            d="M 524,20 C 532,16 536,10 530,7 C 525,4 521,9 526,13"
            fill="none"
            stroke={C.stem}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="531" cy="8" r="1.5" fill={C.ink} />

          {/* Vine Leaves */}
          <g stroke={C.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
            {/* Leaves at x=55 */}
            <path d="M 55,18 C 45,12 44,4 55,8 Z" fill={C.leaf} />
            {/* Leaves at x=105 */}
            <path d="M 105,20 C 115,14 118,6 107,11 Z" fill={C.leaf} />
            {/* Leaves at x=175 */}
            <path d="M 175,19 C 165,13 162,5 174,10 Z" fill={C.leaf} />
            {/* Leaves at x=235 */}
            <path d="M 235,17 C 245,11 247,3 236,8 Z" fill={C.leaf} />
            {/* Leaves at x=310 */}
            <path d="M 310,20 C 300,14 298,6 309,11 Z" fill={C.leaf} />
            {/* Leaves at x=365 */}
            <path d="M 365,22 C 375,16 378,8 366,13 Z" fill={C.leaf} />
            {/* Leaves at x=445 */}
            <path d="M 445,21 C 435,15 433,7 444,12 Z" fill={C.leaf} />
            {/* Leaves at x=495 */}
            <path d="M 495,21 C 505,15 507,7 496,12 Z" fill={C.leaf} />
          </g>

          {/* FLOWER 1: Chamomile Star at x=32 */}
          <g transform="translate(32, 21)" filter={`url(#doodle-shadow-card-${variant})`}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="0"
                x2={Math.cos((deg * Math.PI) / 180) * 8}
                y2={Math.sin((deg * Math.PI) / 180) * 8}
                stroke={C.cream}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            ))}
            <circle cx="0" cy="0" r="3.2" fill={C.amber} stroke={C.ink} strokeWidth="1" />
          </g>

          {/* FLOWER 2: Mini Terracotta Tulip at x=80 */}
          <g transform="translate(80, 14)" filter={`url(#doodle-shadow-card-${variant})`}>
            <path
              d="M -5,-2 C -7,-8 -1,-11 0,-9 C -1,-3 -2,0 -5,-2 Z"
              fill={pal.accent}
              stroke={C.ink}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path
              d="M 5,-2 C 7,-8 1,-11 0,-9 C 1,-3 2,0 5,-2 Z"
              fill={pal.accent}
              stroke={C.ink}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path
              d="M 0,3 C -4,3 -5,-5 -3,-11 C -1,-9 0,-8 0,-8 C 0,-8 1,-9 3,-11 C 5,-5 4,3 0,3 Z"
              fill={pal.primary}
              stroke={C.ink}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>

          {/* FLOWER 3: Big Smiling Daisy at x=145 */}
          <g transform="translate(145, 19)" filter={`url(#doodle-shadow-card-${variant})`}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <ellipse cx="0" cy="-6" rx="2.8" ry="4.5" fill={C.cream} stroke={C.ink} strokeWidth="1.1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="3.8" fill={C.amber} stroke={C.ink} strokeWidth="1.2" />
            <circle cx="-1" cy="-1" r="0.9" fill="#FFFDF8" opacity="0.9" />
          </g>

          {/* FLOWER 4: Lavender Sprig Beads at x=205 */}
          <g transform="translate(205, 17)" filter={`url(#doodle-shadow-card-${variant})`}>
            <circle cx="-3" cy="2" r="2.2" fill={pal.secondary} stroke={C.ink} strokeWidth="0.9" />
            <circle cx="3" cy="0" r="2.2" fill={pal.secondary} stroke={C.ink} strokeWidth="0.9" />
            <circle cx="-2" cy="-4" r="2.1" fill={pal.primary} stroke={C.ink} strokeWidth="0.9" />
            <circle cx="2" cy="-6" r="2.1" fill={pal.primary} stroke={C.ink} strokeWidth="0.9" />
            <circle cx="0" cy="-10" r="1.9" fill={pal.accent} stroke={C.ink} strokeWidth="0.9" />
          </g>

          {/* FLOWER 5: Warm Poppy Blossom at x=270 (CENTERPIECE) */}
          <g transform="translate(270, 16)" filter={`url(#doodle-shadow-card-${variant})`}>
            <circle cx="-4" cy="-3" r="5" fill={pal.primary} stroke={C.ink} strokeWidth="1.1" />
            <circle cx="4" cy="-3" r="5" fill={pal.primary} stroke={C.ink} strokeWidth="1.1" />
            <circle cx="0" cy="2" r="5.2" fill={pal.primary} stroke={C.ink} strokeWidth="1.1" />
            <circle cx="0" cy="-5" r="5.2" fill={pal.primary} stroke={C.ink} strokeWidth="1.1" />
            {/* Poppy Center */}
            <circle cx="0" cy="-2" r="3.2" fill={pal.center} stroke={C.ink} strokeWidth="1.1" />
            <circle cx="0" cy="-2" r="1.4" fill={C.gold} />
          </g>

          {/* FLOWER 6: Sunflower / Starburst at x=338 */}
          <g transform="translate(338, 20)" filter={`url(#doodle-shadow-card-${variant})`}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <polygon points="0,-8 -1.8,-3 1.8,-3" fill={C.gold} stroke={C.ink} strokeWidth="0.8" />
              </g>
            ))}
            <circle cx="0" cy="0" r="4.2" fill={C.deepAmber} stroke={C.ink} strokeWidth="1.1" />
            <circle cx="-1" cy="-1" r="0.9" fill="#FFF" opacity="0.8" />
          </g>

          {/* FLOWER 7: Apricot Bellflower at x=395 */}
          <g transform="translate(395, 20)" filter={`url(#doodle-shadow-card-${variant})`}>
            <path
              d="M 0,-9 C -5,-7 -6,0 -4,3 C -3,1 -1,2 0,0 C 1,2 3,1 4,3 C 6,0 5,-7 0,-9 Z"
              fill={pal.accent}
              stroke={C.ink}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <circle cx="-1.5" cy="4.5" r="0.9" fill={C.amber} />
            <circle cx="1.5" cy="5.2" r="0.9" fill={C.amber} />
          </g>

          {/* FLOWER 8: Daisy at x=465 */}
          <g transform="translate(465, 19)" filter={`url(#doodle-shadow-card-${variant})`}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <ellipse cx="0" cy="-5.5" rx="2.5" ry="4" fill={pal.secondary} stroke={C.ink} strokeWidth="1" />
              </g>
            ))}
            <circle cx="0" cy="0" r="3.2" fill={C.deepAmber} stroke={C.ink} strokeWidth="1" />
          </g>

          {/* FLOWER 9: Chamomile Star at x=510 */}
          <g transform="translate(510, 18)" filter={`url(#doodle-shadow-card-${variant})`}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="0"
                x2={Math.cos((deg * Math.PI) / 180) * 6.5}
                y2={Math.sin((deg * Math.PI) / 180) * 6.5}
                stroke={C.cream}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            ))}
            <circle cx="0" cy="0" r="2.8" fill={C.amber} stroke={C.ink} strokeWidth="0.9" />
          </g>
        </svg>
      </div>

      {/* 2. TOP-LEFT CORNER FLOWER DOODLE ACCENT */}
      <div className="absolute -top-2.5 -left-2.5 w-10 h-10 overflow-visible z-20">
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
          {/* Leaves */}
          <path
            d="M 12,14 C 4,11 2,3 11,6 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M 14,16 C 11,24 3,26 6,17 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* Corner Blossom */}
          <g transform="translate(13, 14)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-4.5"
                rx="2.4"
                ry="3.8"
                fill={pal.primary}
                stroke={C.ink}
                strokeWidth="1"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.6" fill={pal.center} stroke={C.ink} strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* 3. TOP-RIGHT CORNER FLOWER DOODLE ACCENT */}
      <div className="absolute -top-2.5 -right-2.5 w-10 h-10 overflow-visible z-20">
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
          {/* Leaves */}
          <path
            d="M 28,14 C 36,11 38,3 29,6 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M 26,16 C 29,24 37,26 34,17 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* Corner Blossom */}
          <g transform="translate(27, 14)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-4.5"
                rx="2.2"
                ry="3.5"
                fill={pal.accent}
                stroke={C.ink}
                strokeWidth="1"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.4" fill={C.deepAmber} stroke={C.ink} strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* 4. BOTTOM-RIGHT CORNER DELICATE DOODLE SPRIG */}
      <div className="absolute -bottom-2 -right-2 w-9 h-9 overflow-visible z-20">
        <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
          <path
            d="M 12,24 Q 20,20 25,12"
            fill="none"
            stroke={C.stem}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Tiny leaf */}
          <path
            d="M 18,21 C 24,19 26,15 21,17 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1"
          />
          {/* Little buttercup bud */}
          <circle cx="25" cy="11" r="2.8" fill={C.gold} stroke={C.ink} strokeWidth="1" />
          <circle cx="25" cy="11" r="1.1" fill={C.deepAmber} />
        </svg>
      </div>

      {/* 5. BOTTOM-LEFT CORNER DELICATE LEAF SPROUT */}
      <div className="absolute -bottom-2 -left-2 w-9 h-9 overflow-visible z-20">
        <svg viewBox="0 0 36 36" className="w-full h-full overflow-visible">
          <path
            d="M 24,24 Q 16,20 11,12"
            fill="none"
            stroke={C.stem}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Tiny leaf */}
          <path
            d="M 18,21 C 12,19 10,15 15,17 Z"
            fill={C.leaf}
            stroke={C.ink}
            strokeWidth="1"
          />
          {/* Tiny daisy blossom */}
          <g transform="translate(11, 11)">
            {[0, 90, 180, 270].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * 2.5}
                cy={Math.sin((deg * Math.PI) / 180) * 2.5}
                r="1.5"
                fill={C.cream}
                stroke={C.ink}
                strokeWidth="0.8"
              />
            ))}
            <circle cx="0" cy="0" r="1.4" fill={C.amber} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CardFlowerBorder;
