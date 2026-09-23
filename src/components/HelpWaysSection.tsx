import React from 'react';
import { Heart, Shield, Clock, Crown } from 'lucide-react';
import { Button } from './UI';
import { ProgressBar, Chip, CategoryBadge } from './visual/VisualElements';
import { images } from '../lib/images';
import { guardianFundData } from '../data/guardianFund';
import { donationCases } from '../data';
import { DonationCase } from '../types';

const miloPreview = donationCases[0];
const ninaPreview = donationCases[1];

const guardianBarSegments = [
  { label: 'Reserva', pct: 45, color: 'bg-[#F6C94A]' },
  { label: 'Buffer', pct: 30, color: 'bg-[#E8B84A]' },
  { label: 'Asignable', pct: 25, color: 'bg-[#FFF3D6]/40' },
] as const;

function CasePreviewMini({ caseData, imageSrc }: { caseData: DonationCase; imageSrc: string }) {
  return (
    <div className="bg-[#FFF8E9] rounded-2xl p-3.5 border border-amber-100/80">
      <div className="flex items-center justify-between gap-2 mb-3">
        <CategoryBadge category={caseData.category} />
        <Chip variant="purple" className="text-[9px] px-2 py-0.5 tracking-normal normal-case">
          Caso activo
        </Chip>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <img src={imageSrc} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        <p className="text-[11px] font-bold text-[#161616] leading-snug">
          {caseData.petName} · {caseData.itemTitle}
        </p>
      </div>

      <p className="text-[10px] font-mono font-semibold text-neutral-600 mb-2.5">
        ${caseData.currentAmount.toLocaleString('es-MX')} de ${caseData.targetAmount.toLocaleString('es-MX')} MXN
      </p>

      <ProgressBar current={caseData.currentAmount} target={caseData.targetAmount} size="sm" showLabel={false} />
    </div>
  );
}

interface HelpWaysSectionProps {
  onViewCases: () => void;
  onBecomeGuardian: () => void;
}

export default function HelpWaysSection({ onViewCases, onBecomeGuardian }: HelpWaysSectionProps) {
  return (
    <section id="formas-ayudar" className="relative py-16 md:py-24 overflow-hidden">
      <div className="help-ways-paw" aria-hidden>
        <img src={images.decorative.pawHero.src} alt="" draggable={false} loading="lazy" />
      </div>
      <div
        className="help-ways-paw-fade pointer-events-none z-[1]"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="flex justify-center mb-4">
        <Chip variant="warning" className="text-xs md:text-sm tracking-normal normal-case px-4 py-2">
          ¿Entonces, estás listo?
        </Chip>
      </div>
      <h2 className="text-3xl md:text-[48px] font-display font-bold text-[#161616] tracking-tight leading-[1.08] text-center mb-5">
        Dos formas de ayudar
      </h2>
      <p className="text-sm md:text-base text-neutral-500 text-center mb-10 max-w-md mx-auto">
        Una es para apoyar a lomitos en problemas. La otra mantiene listo el fondo mes a mes para ayudar más rápido
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
        <article className="bg-white rounded-[28px] border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3D6] flex items-center justify-center mb-4">
            <Heart className="w-5 h-5 text-amber-700" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#161616] mb-1">Apoyar casos de urgencia</h3>
          <p className="text-sm text-neutral-600 mb-5 flex-1">Ves una mascota, una necesidad y una meta clara.</p>

          <div className="relative mb-5">
            <div className="relative max-h-[11.5rem] overflow-hidden">
              <div className="flex flex-col gap-3">
                <CasePreviewMini caseData={miloPreview} imageSrc={images.caseMilo.src} />
                <CasePreviewMini caseData={ninaPreview} imageSrc={images.caseNina.src} />
              </div>
              <div
                className="absolute inset-x-0 bottom-0 h-[62%] pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.55) 42%, #ffffff 88%)',
                }}
                aria-hidden
              />
            </div>
          </div>

          <Button variant="primary" dataEvent="help_ways_cases_click" onClick={onViewCases} className="text-xs py-2.5 w-full">
            Ver casos
          </Button>
        </article>

        <article className="relative bg-[#161616] rounded-[28px] border border-neutral-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col text-white overflow-hidden">
          <div
            className="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center border border-[#F6C94A]/35 bg-gradient-to-br from-[#FFF3D6] via-[#F6C94A] to-[#E8A317] shadow-[0_4px_16px_rgba(246,201,74,0.35)]"
            aria-hidden
          >
            <Crown className="w-5 h-5 text-[#161616] drop-shadow-sm" strokeWidth={2.25} />
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#F6C94A]/20 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-[#F6C94A]" />
          </div>
          <h3 className="font-display font-bold text-lg mb-1">Ser Guardián</h3>
          <p className="text-sm text-neutral-300 mb-4 flex-1">
            Mantienes listo el fondo para la próxima urgencia y recibes impacto reportado.
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {['Fondo común', 'Urgencias', 'Reporte mensual'].map((chip) => (
              <span
                key={chip}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#F6C94A]/25 bg-[#F6C94A]/10 text-[#F6C94A]"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 mb-5 border border-white/8">
            <p className="text-[10px] text-neutral-400 mb-1">Fondo disponible</p>
            <p className="font-display font-bold text-xl text-[#F6C94A]">
              ${guardianFundData.availableFund.toLocaleString('es-MX')} {guardianFundData.currency}
            </p>

            <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-neutral-800 gap-px">
              {guardianBarSegments.map(({ label, pct, color }) => (
                <div key={label} className={`${color} h-full`} style={{ width: `${pct}%` }} title={label} />
              ))}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2.5">
              {guardianBarSegments.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                  <span className="text-[9px] text-neutral-400 font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/8">
              <Clock className="w-3.5 h-3.5 text-[#F6C94A] shrink-0" />
              <p className="text-[10px] text-neutral-300">
                <span className="text-neutral-500">Última urgencia:</span>{' '}
                <span className="font-semibold text-white">{guardianFundData.lastResponseTime}</span>
              </p>
            </div>
          </div>

          <Button variant="accent" dataEvent="help_ways_guardian_click" onClick={onBecomeGuardian} className="text-xs py-2.5 w-full">
            Ser Guardián
          </Button>
        </article>
      </div>
      </div>
    </section>
  );
}
