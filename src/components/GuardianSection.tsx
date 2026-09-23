import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './UI';
import FondoGuardian from './visual/FondoGuardian';
import DeviceFrame from './visual/DeviceFrame';
import { NoiseOverlay, OrganicBlob, Chip } from './visual/VisualElements';
import { images } from '../lib/images';

interface GuardianSectionProps {
  onDownload?: () => void;
}

const benefits = [
  'Fondo listo para urgencias.',
  'Respuesta más rápida.',
  'Impacto reportado después.',
  'Sin rankings, sin presión.',
];

export default function GuardianSection({ onDownload }: GuardianSectionProps) {
  return (
    <section id="guardian" className="relative bg-[#161616] text-[#FFF8E9] rounded-[32px] py-20 px-6 md:py-28 md:px-14 my-16 overflow-hidden border border-neutral-800 grain-bg">
      <NoiseOverlay className="opacity-[0.06] mix-blend-overlay" />
      <OrganicBlob className="w-[450px] h-[450px] -top-40 -left-40 opacity-40" color="amber" />
      <OrganicBlob className="w-[380px] h-[380px] -bottom-32 -right-32 opacity-30" color="purple" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10">
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-4">
            <Chip variant="warning" className="text-xs md:text-sm tracking-normal normal-case px-4 py-2">
              Fondo Guardián
            </Chip>
          </div>

          <h2 className="text-3xl md:text-[48px] font-display font-bold text-white tracking-tight leading-[1.08] mb-5">
            Sé Guardián de DopMi.
          </h2>

          <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
            Mantienes listo el fondo para responder cuando aparece una urgencia. DopMi decide la asignación con criterios claros y te muestra después qué logró el fondo.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-9">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-[#F6C94A]/20 text-[#F6C94A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-neutral-200">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button variant="accent" dataEvent="guardian_cta_click" onClick={onDownload} className="shadow-lg shadow-[#F6C94A]/20">
              Ser Guardián
            </Button>
            <span className="text-xs text-neutral-400">Desde $50 MXN al mes. Puedes cambiarlo o pausarlo.</span>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <FondoGuardian />
          <DeviceFrame
            size="md"
            tilt
            screenshot={images.guardianSubscribe.src}
            screenshotAlt={images.guardianSubscribe.alt}
            className="shrink-0 opacity-95 hidden sm:block"
          />
        </div>
      </div>
    </section>
  );
}
