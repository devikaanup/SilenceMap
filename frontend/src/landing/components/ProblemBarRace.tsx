import React, { useRef, useState, useEffect } from 'react';
import { AlertCircle, Clock, Flame } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  seat: string;
  finalAirtime: number; // percentage
  initialAirtime: number;
  color: string;
  badge: string;
  isDominant?: boolean;
}

// 5 students summing to 100% total discussion airtime with varying density light-pink to red gradients
const STUDENTS: StudentData[] = [
  { id: 's2', name: 'Julian M.', seat: 'Desk 02', initialAirtime: 5, finalAirtime: 44, color: 'from-pink-400 via-rose-500 to-red-600', badge: 'High Overlap / 6 Interruptions', isDominant: true },
  { id: 's5', name: 'Marcus K.', seat: 'Desk 05', initialAirtime: 4, finalAirtime: 36, color: 'from-pink-300 via-rose-400 to-red-500', badge: 'Dominates Open Floor', isDominant: true },
  { id: 's1', name: 'Elena V.', seat: 'Desk 01', initialAirtime: 3, finalAirtime: 10, color: 'from-pink-200 via-rose-300 to-rose-400', badge: 'Interrupted 3x' },
  { id: 's4', name: 'Chloe T.', seat: 'Desk 04', initialAirtime: 2, finalAirtime: 6, color: 'from-pink-100 via-rose-200 to-rose-300', badge: 'Brief responses' },
  { id: 's7', name: 'Maya L.', seat: 'Desk 07', initialAirtime: 1, finalAirtime: 4, color: 'from-pink-100 to-rose-200', badge: 'Hesitant starter' },
];

export const ProblemBarRace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animProgress, setAnimProgress] = useState<number>(0);

  // Trigger animation quickly as soon as user reaches Section 2, and replay upon return
  useEffect(() => {
    if (!containerRef.current) return;
    let animationFrameId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          const duration = 800; // ms (fast, snappy load)
          const startTime = performance.now();

          const animateStep = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setAnimProgress(easeOut);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animateStep);
            } else {
              setAnimProgress(1);
              animationFrameId = null;
            }
          };

          animationFrameId = requestAnimationFrame(animateStep);
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          setAnimProgress(0);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Live calculated metrics based on one-time animation progress
  const elapsedMinutes = (animProgress * 15).toFixed(1);
  const dominantAirtimeTotal = Math.round(
    (STUDENTS[0].initialAirtime + (STUDENTS[0].finalAirtime - STUDENTS[0].initialAirtime) * animProgress) +
    (STUDENTS[1].initialAirtime + (STUDENTS[1].finalAirtime - STUDENTS[1].initialAirtime) * animProgress)
  );

  return (
    <section
      id="problem-section"
      ref={containerRef}
      className="relative h-screen h-[100dvh] max-h-[100dvh] w-full snap-start snap-always shrink-0 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden select-none"
    >
      {/* Section Header Card */}
      <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 shadow-sm text-rose-900 text-xs font-mono font-medium uppercase tracking-wider mb-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>Section 02 &bull; The Problem</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#231A12] font-serif tracking-tight leading-tight">
          The invisible divide in classroom airtime.
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#6B5A4E] leading-relaxed max-w-xl mx-auto">
          In a 15-minute group seminar, conversational monopolization happens invisibly. 
          Watch airtime disparities accumulate across student seats.
        </p>
      </div>

      {/* Main Bar Race Card */}
      <div className="w-full rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E4D3C0] shadow-lg p-4 sm:p-5 lg:p-6 transition-all">
        {/* Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE4D6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100/90 flex items-center justify-center text-rose-800 shadow-inner">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8A7565]">
                Discussion Timeline Progress
              </div>
              <div className="text-sm font-bold text-[#231A12] font-mono">
                {elapsedMinutes}m / 15.0m elapsed
              </div>
            </div>
          </div>

          {/* Airtime Concentration Indicator */}
          <div className="flex items-center gap-2.5 bg-[#FBF7F2] px-3 py-1 rounded-xl border border-[#EAE0D2]">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A7565]">
                Top 2 Students Airtime
              </div>
              <div className="text-sm sm:text-base font-extrabold text-rose-600 font-mono">
                {dominantAirtimeTotal}%
              </div>
            </div>
            <div className="w-12 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-300 via-rose-500 to-red-600 transition-all duration-75"
                style={{ width: `${Math.min(100, dominantAirtimeTotal)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Airtime Bars (5 Students) */}
        <div className="mt-3.5 space-y-2 sm:space-y-2.5">
          {STUDENTS.map((student) => {
            const currentAirtime =
              student.initialAirtime +
              (student.finalAirtime - student.initialAirtime) * animProgress;
            
            // Bar width scaled relative to highest share (44% mapped to ~90% container width)
            const barWidthPercent = Math.min(100, (currentAirtime / 50) * 100);

            return (
              <div key={student.id} className="group relative">
                <div className="flex items-center justify-between text-xs font-mono mb-1 text-[#5A4B40]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#241B13]">{student.name}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#F4EBE0] text-[#786455] text-[10px]">
                      {student.seat}
                    </span>
                    {student.isDominant && animProgress > 0.4 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold animate-pulse border border-rose-200/80">
                        Dominant Floor Control
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8F7D70] hidden sm:inline">
                      {student.badge}
                    </span>
                    <span className="font-bold font-mono text-xs text-[#231A12] w-12 text-right">
                      {currentAirtime.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full h-5 sm:h-5.5 bg-[#F7F1EA] rounded-lg p-0.5 overflow-hidden shadow-inner border border-[#E9DDCF]/60 flex items-center">
                  <div
                    className={`h-full rounded-md bg-gradient-to-r ${student.color} transition-all duration-75 flex items-center justify-end pr-2 text-[10px] font-mono text-white font-semibold shadow-sm`}
                    style={{ width: `${Math.max(4, barWidthPercent)}%` }}
                  >
                    {barWidthPercent > 22 && `${currentAirtime.toFixed(0)}% airtime`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Observation Callout Footer */}
        <div className="mt-3 pt-3 border-t border-[#EFE4D6] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A695C]">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>
              <strong>3 of 5 students</strong> spoke less than 3 minutes combined throughout the entire exercise.
            </span>
          </div>
          <div className="font-mono text-[10px] text-[#A28F81] bg-[#F8F2EA] px-2.5 py-0.5 rounded-md border border-[#EFE4D6]">
            Session duration &bull; 15.0m analyzed
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemBarRace;
