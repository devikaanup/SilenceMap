import React, { useState, useEffect, useRef } from 'react';
import { Award } from 'lucide-react';
import FlowerDoodleBorder from './FlowerDoodleBorder.tsx';

interface CounterProps {
  end: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  active?: boolean;
}

const AnimatedCounter: React.FC<CounterProps> = ({
  end,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1600,
  active = true,
}) => {
  const [count, setCount] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setCount(0);
      return;
    }

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easeProgress * end);
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(end);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [active, end, duration]);

  return (
    <span>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const EquitySummary: React.FC = () => {
  const [isInView, setIsInView] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="get-started-section"
      ref={sectionRef}
      className="relative h-screen h-[100dvh] max-h-[100dvh] w-full snap-start snap-always shrink-0 flex flex-col justify-between overflow-hidden select-none"
    >
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-sm text-emerald-900 text-xs font-mono font-medium uppercase tracking-wider mb-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Section 04 &bull; Equity Report & Classroom Impact</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#231A12] font-serif tracking-tight leading-tight">
            Quantifying what was once invisible.
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6B5A4E] leading-relaxed max-w-xl mx-auto">
            Silence Map gives educators clear, unbiased data instead of vague impressions, 
            enabling targeted interventions that empower quiet and marginalized voices.
          </p>
        </div>

        {/* 4 Animated Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E3D2BF] shadow-lg text-center">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#8A7565] tracking-wider mb-1 font-semibold">
              Airtime Monopolization
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
              <AnimatedCounter end={72} suffix="%" active={isInView} />
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F5E52] mt-1">
              Consumed by just 2 of 5 students in discussion
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E3D2BF] shadow-lg text-center">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#8A7565] tracking-wider mb-1 font-semibold">
              Speaking Gap Ratio
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#231A12] font-mono">
              <AnimatedCounter end={4.2} decimals={1} suffix="x" active={isInView} />
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F5E52] mt-1">
              Disparity between top & bottom vocal percentiles
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E3D2BF] shadow-lg text-center">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#8A7565] tracking-wider mb-1 font-semibold">
              Interruption Events
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              <AnimatedCounter end={14} active={isInView} />
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F5E52] mt-1">
              Instances of simultaneous speech where speaker yielded
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E3D2BF] shadow-lg text-center">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#8A7565] tracking-wider mb-1 font-semibold">
              Voice Diarization Accuracy
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              <AnimatedCounter end={98.4} decimals={1} suffix="%" active={isInView} />
            </div>
            <p className="text-[11px] sm:text-xs text-[#6F5E52] mt-1">
              Segment attribution accuracy via pyannote neural model
            </p>
          </div>
        </div>

        {/* Cozy Botanical Call To Action Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF9]/95 via-[#FFF6ED]/95 to-[#FDEEE0]/90 border-2 border-[#EADAC9] shadow-lg p-4 sm:p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Decorative Flower Doodles in the Top-Right Corner */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-85">
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
            {/* Vine trailing from top right */}
            <path
              d="M220,10 Q160,20 130,55 T80,105"
              stroke="#658B6F"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Leaves */}
            <ellipse cx="165" cy="32" rx="7" ry="3.5" fill="#78A083" stroke="#4A3B32" strokeWidth="1" transform="rotate(-30 165 32)" />
            <ellipse cx="120" cy="62" rx="7.5" ry="4" fill="#78A083" stroke="#4A3B32" strokeWidth="1" transform="rotate(25 120 62)" />
            <ellipse cx="145" cy="48" rx="6" ry="3" fill="#78A083" stroke="#4A3B32" strokeWidth="1" transform="rotate(-40 145 48)" />

            {/* Corner Daisy */}
            <g transform="translate(180, 45)">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-10"
                  rx="4"
                  ry="7"
                  fill="#FFFDF8"
                  stroke="#4A3B32"
                  strokeWidth="1.2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="5.5" fill="#F59E0B" stroke="#4A3B32" strokeWidth="1.3" />
            </g>

            {/* Corner Terracotta Tulip */}
            <g transform="translate(95, 90)">
              <path
                d="M-8,-4 C-10,-12 -2,-16 0,-14 C-1,-6 -3,-1 -8,-4 Z"
                fill="#C85A48"
                stroke="#4A3B32"
                strokeWidth="1.2"
              />
              <path
                d="M8,-4 C10,-12 2,-16 0,-14 C1,-6 3,-1 8,-4 Z"
                fill="#C85A48"
                stroke="#4A3B32"
                strokeWidth="1.2"
              />
              <path
                d="M0,4 C-7,4 -8,-8 -5,-16 C-2,-14 0,-12 0,-12 C0,-12 2,-14 5,-16 C8,-8 7,4 0,4 Z"
                fill="#E07A5F"
                stroke="#4A3B32"
                strokeWidth="1.3"
              />
            </g>

            {/* Little Honey Blossom */}
            <g transform="translate(145, 95)">
              <circle cx="-5" cy="-3" r="4.5" fill="#F4A261" stroke="#4A3B32" strokeWidth="1" />
              <circle cx="5" cy="-3" r="4.5" fill="#F4A261" stroke="#4A3B32" strokeWidth="1" />
              <circle cx="0" cy="3" r="4.5" fill="#F4A261" stroke="#4A3B32" strokeWidth="1" />
              <circle cx="0" cy="-2" r="3" fill="#D97706" />
            </g>

            {/* Gentle fluttering doodle butterfly */}
            <g transform="translate(45, 35) rotate(-12)">
              {/* Forewings */}
              <path d="M12,10 C9,4 3,1 1,5 C-1,9 4,13 12,12 Z" fill="#F59E0B" stroke="#4A3B32" strokeWidth="1" />
              <path d="M12,10 C15,4 21,1 23,5 C25,9 20,13 12,12 Z" fill="#F59E0B" stroke="#4A3B32" strokeWidth="1" />
              {/* Hindwings */}
              <path d="M12,12 C7,13 3,15 4,18 C5,21 10,20 12,14 Z" fill="#E07A5F" stroke="#4A3B32" strokeWidth="1" />
              <path d="M12,12 C17,13 21,15 20,18 C19,21 14,20 12,14 Z" fill="#E07A5F" stroke="#4A3B32" strokeWidth="1" />
              {/* Body */}
              <ellipse cx="12" cy="12" rx="1.5" ry="4" fill="#4A3B32" />
            </g>
          </svg>
        </div>

        {/* Bottom Left Corner Floral Sprig */}
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-80">
          <svg width="160" height="90" viewBox="0 0 160 90" fill="none">
            <path
              d="M0,90 Q40,65 75,55 T130,50"
              stroke="#658B6F"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <ellipse cx="45" cy="68" rx="6" ry="3" fill="#78A083" stroke="#4A3B32" strokeWidth="1" transform="rotate(-20 45 68)" />
            <ellipse cx="85" cy="54" rx="6.5" ry="3.2" fill="#78A083" stroke="#4A3B32" strokeWidth="1" transform="rotate(15 85 54)" />
            {/* Little Daisy */}
            <g transform="translate(60, 48)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse key={deg} cx="0" cy="-6" rx="3" ry="5" fill="#FFFDF8" stroke="#4A3B32" strokeWidth="1" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="3.5" fill="#F59E0B" stroke="#4A3B32" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <div className="max-w-xl relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#F5E6D8]/80 border border-[#E4D0BD] text-[#7A6150] text-[11px] font-mono mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
            <span>Inclusive Discussions &bull; Get Involved</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#231A12] font-serif tracking-tight leading-tight">
            Ready to get started?
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[#6B5A4E] leading-relaxed">
            Bring clarity and warmth to group discussions with real-time acoustic equity insights.
          </p>
        </div>

        {/* Cozy Warm Button */}
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => { window.location.href = '/app'; }}
            className="group px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#E88E50] hover:from-[#E59306] hover:to-[#D97736] text-[#241B13] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center gap-2 cursor-pointer border border-[#D97706]/40"
          >
            <span>Click here</span>
            <span className="text-sm group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>
      </div>

      {/* Flower Meadow Border & Edge-to-Edge Docked Footer */}
      <div className="w-full shrink-0 relative z-20">
        <FlowerDoodleBorder />
        <footer className="relative -mt-1 w-full bg-white/85 backdrop-blur-md border-t border-[#E8DACB]/60 pt-1 pb-2 sm:pb-3 px-4 text-center font-mono">
          <div className="max-w-4xl mx-auto space-y-0.5">
            <div className="flex items-center justify-center gap-2 font-bold text-[#231A12] text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Silence Map &bull; Made with love, by Devika Anup</span>
            </div>
            <p className="text-[#8C7A6D] text-[10px] sm:text-[11px] tracking-wide">
              Python &middot; FastAPI &middot; PyTorch &middot; PyAnnote 3.1 &middot; React &middot; Vite &middot; Pytest
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default EquitySummary;
