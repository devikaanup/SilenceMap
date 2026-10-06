import React, { useState } from 'react';
import { Mic, Waves, Cpu, Split, LayoutGrid, CheckCircle2, ArrowRight } from 'lucide-react';
import CardStack from './CardStack.tsx';
import CardFlowerBorder from './CardFlowerBorder.tsx';

interface PipelineStage {
  step: string;
  title: string;
  badge: string;
  description: string;
  tech: string;
  details: string[];
  icon: React.ElementType;
}

const STAGES: PipelineStage[] = [
  {
    step: '01',
    title: 'Audio Input & WebRTC VAD Filtering',
    badge: 'Stage 1: Pre-Processing',
    description: 'Pre-recorded 5–15 min classroom discussion audio is ingested. WebRTC Voice Activity Detection strips room noise, pencil taps, and HVAC hum, slicing out clean speech frames.',
    tech: 'WebRTC VAD • 16kHz PCM Audio',
    details: [
      'Noise suppression & voice frame gating',
      'Millisecond speech onset / offset detection',
      'Zero external streaming delay (local clip processing)'
    ],
    icon: Mic,
  },
  {
    step: '02',
    title: 'Pyannote Neural Diarization',
    badge: 'Stage 2: Voice Biometrics',
    description: 'A pre-trained deep acoustic model extracts vocal embeddings and clusters speaker vectors, outputting time-coded speech segments tagged by individual speaker identifiers.',
    tech: 'pyannote-audio • HuggingFace Pretrained',
    details: [
      'Identifies 4–12 distinct voices automatically',
      'Generates precise segment timestamps [t_start, t_end]',
      'Robust against pitch variations and natural room acoustics'
    ],
    icon: Waves,
  },
  {
    step: '03',
    title: 'Overlap Speech & Interruption Detection',
    badge: 'Stage 3: Conversational Logic',
    description: 'Our collision detector scans for overlapping timestamps where two speakers talk simultaneously. The speaker whose segment began second is designated the interrupter.',
    tech: 'Custom Overlap Collision Engine',
    details: [
      'Identifies exact overlap windows (in milliseconds)',
      'Attributes interruption to chronological secondary speaker',
      'Tracks interrupted yield rate (who stops speaking)'
    ],
    icon: Split,
  },
  {
    step: '04',
    title: 'Spatial Heatmap & Equity Attribution',
    badge: 'Stage 4: Spatial Visualization',
    description: 'One-time manual mapping links Speaker IDs to physical classroom desks. Cumulative airtime and interruption vectors build the live thermal seating chart and disparity report.',
    tech: 'React SVG Grid • Thermal Accumulator',
    details: [
      'Dynamic desk thermal coloring (Cold blue → Thermal red)',
      'Amber pulse alerts for active interruption events',
      'Calculates classroom airtime Gini coefficient & equity score'
    ],
    icon: LayoutGrid,
  },
];

export const PipelineScroller: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Generate the 4 stacked cards for the CardStack
  const stageCards = STAGES.map((stage, idx) => {
    return (
      <div
        key={stage.step}
        className="pt-7 sm:pt-8 px-5 sm:px-6 pb-5 sm:pb-6 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-[#E4D3C0] shadow-xl relative"
      >
        {/* Hand-drawn flower doodle border framing each card */}
        <CardFlowerBorder variant={idx} className="absolute inset-0" />

        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-900 bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
            {stage.badge}
          </span>
          <span className="text-[11px] font-mono text-[#8C7A6D] bg-[#F5ECE2] px-2 py-0.5 rounded-md border border-[#E9DDD0]">
            {stage.tech}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-[#231A12] font-serif mb-1.5 leading-snug relative z-10">
          {stage.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#615145] leading-relaxed mb-3 relative z-10">
          {stage.description}
        </p>

        {/* Stage Capabilities Checklist */}
        <div className="space-y-1.5 pt-3 border-t border-[#EFE4D6] relative z-10">
          <h4 className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#8A7667] font-semibold">
            Technical Highlights
          </h4>
          {stage.details.map((detail, dIdx) => (
            <div key={dIdx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs text-[#483B32]">{detail}</span>
            </div>
          ))}
        </div>

        {/* Pipeline Stage Progression Mini-Bar */}
        <div className="mt-4 pt-3 border-t border-[#EFE4D6] flex items-center justify-between relative z-10">
          <div className="text-[11px] font-mono text-[#8F7C6E]">
            Stage {idx + 1} of {STAGES.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={idx === 0}
              onClick={(e) => {
                e.stopPropagation();
                setActiveStep((prev) => Math.max(0, prev - 1));
              }}
              className="px-2.5 py-1 rounded-lg border border-[#DACDC0] text-[11px] font-mono text-[#5C4D42] disabled:opacity-30 hover:bg-[#F8F1E9] transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={idx === STAGES.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setActiveStep((prev) => Math.min(STAGES.length - 1, prev + 1));
              }}
              className="px-3 py-1 rounded-lg bg-[#241B13] text-white text-[11px] font-mono font-medium disabled:opacity-30 hover:bg-neutral-800 flex items-center gap-1 shadow-md transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section
      id="how-it-works-section"
      className="relative h-screen h-[100dvh] max-h-[100dvh] w-full snap-start snap-always shrink-0 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden select-none"
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 shadow-sm text-amber-900 text-xs font-mono font-medium uppercase tracking-wider mb-2">
          <Cpu className="w-3.5 h-3.5 text-amber-600" />
          <span>Section 03 &bull; System Architecture</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#231A12] font-serif tracking-tight leading-tight">
          How Silence Map decodes classroom dynamics.
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#6B5A4E] leading-relaxed max-w-xl mx-auto">
          From a raw audio recording to an objective, actionable equity map in four deterministic processing stages.
        </p>
      </div>

      {/* Main Grid: Left Stage Navigator / Right Interactive Card Stack */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
        {/* Step Buttons (Left) */}
        <div className="lg:col-span-5 space-y-2 sm:space-y-2.5">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={stage.step}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl transition-all duration-200 border flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-lg border-amber-500 ring-2 ring-amber-400/30 -translate-x-1'
                    : 'bg-white/75 hover:bg-white/95 border-[#E9DDD0] hover:border-[#DFCFC0]'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 scale-105'
                      : 'bg-[#F4ECE3] text-[#7B6A5E]'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#968273]">
                      Step {stage.step}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 font-semibold'
                          : 'bg-[#F2E8DC] text-[#867364]'
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#231A12] text-xs sm:text-sm leading-snug truncate">
                    {stage.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Card Stack Animation (Right) */}
        <div className="lg:col-span-7">
          <CardStack
            cards={stageCards}
            activeIndex={activeStep}
            onCardChange={(newIdx) => setActiveStep(newIdx)}
            randomRotation={true}
            sensitivity={80}
            sendToBackOnClick={false}
            animationConfig={{ stiffness: 260, damping: 20 }}
            autoplay={false}
          />
        </div>
      </div>
    </section>
  );
};

export default PipelineScroller;
