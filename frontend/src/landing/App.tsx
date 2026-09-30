import React from 'react';
import CursorScrubVideo from './CursorScrubVideo.tsx';
import BlurText from './BlurText.tsx';
import ProblemBarRace from './components/ProblemBarRace.tsx';
import PipelineScroller from './components/PipelineScroller.tsx';
import EquitySummary from './components/EquitySummary.tsx';
import PillNav from './components/PillNav.tsx';
import { ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'The Problem', href: '#problem-section' },
  { label: 'How It Works', href: '#how-it-works-section' },
  { label: 'Get Started', href: '#get-started-section' }
];

export const App: React.FC = () => {
  const videoSrc = '/eyes.mp4';
  const axis = 'horizontal';
  const reverse = false;
  const trackingArea = 'window';
  const smoothing = 0.10;
  const objectFit = 'cover';

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white font-sans">
      {/* Top Right: PillNav from React Bits */}
      <PillNav
        logo="/favicon.svg"
        logoAlt="Silence Map"
        logoHref="#hero-section"
        items={NAV_ITEMS}
        baseColor="#201712"
        pillColor="#F7EFE6"
        hoveredPillTextColor="#F59E0B"
        pillTextColor="#201712"
        ease="power3.easeOut"
        initialLoadAnimation={true}
      />

      {/* SECTION 1: HERO (100vh Landing Screen) */}
      <section
        id="hero-section"
        className="relative w-full h-screen h-[100dvh] max-h-[100dvh] snap-start snap-always shrink-0 overflow-hidden bg-neutral-950 select-none"
      >
        {/* Full-bleed CursorScrubVideo component */}
        <CursorScrubVideo
          videoSrc={videoSrc}
          axis={axis}
          reverse={reverse}
          trackingArea={trackingArea}
          smoothing={smoothing}
          objectFit={objectFit}
          objectPosition="50% center"
          showPoster={true}
          className="w-full h-full"
        />

        {/* Top Left: Silence Map Title with BlurText Component */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-30 pointer-events-none select-none flex flex-col items-start text-left max-w-4xl">
          <BlurText
            text="Silence Map"
            delay={150}
            animateBy="words"
            direction="top"
            stepDuration={0.4}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)] justify-start font-serif"
          />
        </div>

        {/* Bottom Center: Scroll Prompt to Transition to Section 2 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
          <a
            href="#problem-section"
            className="group flex flex-col items-center gap-2 px-5 py-2.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-lg border border-white/15 text-neutral-200 text-xs font-mono tracking-widest uppercase transition-all shadow-2xl hover:border-amber-400/60"
          >
            <span className="group-hover:text-amber-300 transition-colors">Scroll to Enter Classroom</span>
            <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
          </a>
        </div>
      </section>

      {/* SECTIONS 2 to 4: CLASSROOM NARRATIVE ON WARM ILLUSTRATED PATTERN BACKGROUND */}
      <main
        id="classroom-section"
        className="relative w-full bg-[#F5EBE1] text-[#221C16] border-t border-[#E8DACB]"
        style={{
          backgroundImage: `url('/bg_image_scroll.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '950px auto',
        }}
      >
        {/* Subtle translucent wash layer allowing the aesthetic doodle pattern to show through while preserving text clarity */}
        <div className="absolute inset-0 bg-[#FDF9F4]/55 backdrop-blur-[0.5px] pointer-events-none" />

        <div className="relative z-10">
          {/* Section 2: Problem Statement (Bar Race) */}
          <ProblemBarRace />

          {/* Section 3: How It Works (Pipeline Architecture) */}
          <PipelineScroller />

          {/* Section 4: Impact Metrics, CTA, Meadow & Footer */}
          <EquitySummary />
        </div>
      </main>
    </div>
  );
};

export default App;
