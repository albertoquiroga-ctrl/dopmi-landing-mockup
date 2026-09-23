import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = ['Publica', 'Revisión', 'Apoyo', 'Evidencia'] as const;

export default function TrustProcessLine({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-3 py-4 px-4 bg-[#FFF3D6]/40 rounded-2xl border border-amber-100/60 ${className}`}>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <span className="text-xs md:text-sm font-semibold text-[#161616] px-3 py-1.5 bg-white rounded-full border border-neutral-100 shadow-sm">
            {step}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" aria-hidden />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
