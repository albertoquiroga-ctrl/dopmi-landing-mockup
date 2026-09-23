import React from 'react';
import { Button } from './UI';
import { MonthlyImpactCard } from './visual/AppScreens';
import { images } from '../lib/images';

interface ImpactSectionProps {
  onDownload?: () => void;
}

export default function ImpactSection({ onDownload }: ImpactSectionProps) {
  return (
    <section id="impacto" className="py-20 md:py-28 max-w-6xl mx-auto px-6 relative overflow-visible">
      <div className="impact-paw-trail" aria-hidden>
        <img src={images.impactPawTrail.src} alt="" draggable={false} loading="lazy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10 isolate">
        <div className="lg:col-span-5 relative z-10">
          <span className="text-xs font-semibold tracking-wider text-[#5B3FFF] uppercase mb-3 px-3 py-1.5 bg-[#5B3FFF]/10 rounded-full inline-block">
            Tu impacto sin ruido
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-[56px] font-display font-bold text-[#161616] tracking-tight leading-[1.1] mb-5">
            Tú{' '}
            <span className="font-sans font-medium text-[#161616]/65 tracking-normal text-[0.94em]">
              también dejas una
            </span>{' '}
            <span className="italic font-semibold text-[#161616]/90">enorme huella</span>.{' '}
            <span className="font-sans font-medium text-[#161616]/65 tracking-normal text-[0.94em]">
              Te la presentamos
            </span>{' '}
            <span className="hero-chalk-highlight">mes con mes</span>.
          </h2>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-8">
            Un resumen sobrio: consultas cubiertas, adopciones en seguimiento, evidencias revisadas. Sin abrir la app cada día.
          </p>
          <Button variant="primary" dataEvent="impact_download_click" onClick={onDownload}>
            Descargar app
          </Button>
        </div>

        <div className="lg:col-span-7 relative flex justify-center z-10">
          <div className="w-full max-w-[340px] relative z-20 isolate">
            <MonthlyImpactCard onAction={onDownload} />
          </div>
        </div>
      </div>
    </section>
  );
}
