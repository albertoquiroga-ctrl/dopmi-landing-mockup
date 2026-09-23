import React from 'react';
import { Camera, ChevronRight, FileText, Heart, ShieldCheck } from 'lucide-react';
import { trackEvent } from './UI';
import { Chip, ProgressBar } from './visual/VisualElements';
import { images } from '../lib/images';

interface TrustSectionProps {
  onLearnMore?: () => void;
  onViewCase?: () => void;
}

const trustSteps = [
  {
    id: 'publica',
    step: '01',
    title: 'Publica',
    text: 'Caso con mascota, necesidad y responsable.',
    chip: 'Caso creado',
    icon: FileText,
  },
  {
    id: 'revision',
    step: '02',
    title: 'Revisión',
    text: 'Señales clave antes de activar apoyo.',
    chip: 'Señales revisadas',
    icon: ShieldCheck,
  },
  {
    id: 'apoyo',
    step: '03',
    title: 'Apoyo',
    text: 'Meta, monto y avance visibles.',
    chip: 'Meta visible',
    icon: Heart,
  },
  {
    id: 'evidencia',
    step: '04',
    title: 'Evidencia',
    text: 'Avances o cierre cuando aplica.',
    chip: 'Avance reportado',
    icon: Camera,
  },
] as const;

function TrustStepCard({ step, index }: { step: (typeof trustSteps)[number]; index: number; key?: React.Key }) {
  const Icon = step.icon;
  return (
    <article className="relative flex h-[158px] w-full flex-col rounded-[22px] border border-neutral-200/90 bg-white p-[22px] shadow-[0_4px_16px_-8px_rgba(22,22,22,0.06)] transition-all duration-300 hover:border-amber-200/80 hover:shadow-[0_8px_24px_-12px_rgba(22,22,22,0.1)] sm:w-[258px] sm:shrink-0">
      <span className="absolute -top-2.5 left-4 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#161616] px-1.5 text-[9px] font-bold text-[#F6C94A]">
        {step.step}
      </span>
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF8E9] ring-1 ring-amber-200/80">
          <Icon className="h-4 w-4 text-[#161616]" strokeWidth={1.75} aria-hidden />
        </div>
        <h3 className="font-display text-[15px] font-bold leading-tight text-[#161616]">{step.title}</h3>
      </div>
      <p className="mb-auto text-[13px] leading-snug text-neutral-600">{step.text}</p>
      <span className="mt-2 inline-flex w-fit items-center rounded-full border border-emerald-300/55 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-emerald-800">
        {step.chip}
      </span>
      {index < trustSteps.length - 1 && (
        <span className="absolute -right-[18px] top-1/2 hidden h-px w-4 -translate-y-1/2 bg-gradient-to-r from-[#F6C94A]/70 to-amber-200/30 lg:block" aria-hidden />
      )}
    </article>
  );
}

function TrustProcessRow() {
  return (
    <div className="relative hidden lg:block">
      <div
        className="absolute left-[8%] right-[8%] top-[22px] h-px bg-gradient-to-r from-transparent via-[#F6C94A]/45 to-transparent"
        aria-hidden
      />
      <div className="relative flex items-center gap-4">
        {trustSteps.map((step, index) => (
          <TrustStepCard key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

function TrustProcessTimeline() {
  return (
    <div className="relative pl-10 lg:hidden">
      <div
        className="absolute bottom-2 left-[0.9375rem] top-2 w-px bg-gradient-to-b from-amber-200/50 via-[#F6C94A]/45 to-amber-200/25"
        aria-hidden
      />
      <ol className="space-y-3">
        {trustSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.id} className="relative">
              <div className="absolute -left-10 top-[18px] flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-[#FFF3D6] text-[9px] font-bold text-[#161616]">
                {step.step}
              </div>
              <article className="rounded-[20px] border border-neutral-200/90 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(22,22,22,0.06)]">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[#161616]" strokeWidth={1.75} aria-hidden />
                    <h3 className="font-display text-sm font-bold text-[#161616]">{step.title}</h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-300/55 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
                    {step.chip}
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-neutral-600">{step.text}</p>
              </article>
              {index < trustSteps.length - 1 && (
                <div className="ml-4 h-3 w-px bg-amber-200/50" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ReviewableCaseCard({ onViewCase }: { onViewCase?: () => void }) {
  return (
    <aside className="overflow-hidden rounded-[24px] border border-neutral-200/90 bg-white shadow-[0_4px_20px_-10px_rgba(22,22,22,0.08)]">
      <div className="flex items-center justify-between border-b border-neutral-100 bg-[#FAFAFA] px-4 py-2.5 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Caso revisable</p>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-[#FFF3D6] px-2 py-0.5 text-[9px] font-semibold text-amber-900">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          Activo
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={images.caseMilo.src}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white"
            />
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold leading-tight text-[#161616]">Milo</p>
            <p className="text-xs font-medium text-[#5B3FFF]">Medicina · Spray para herida</p>
            <p className="mt-1 text-[10px] text-neutral-400">Refugio San Jerónimo</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 rounded-[18px] bg-[#FFF8E9]/60 p-3.5 ring-1 ring-amber-100/80">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Progreso</p>
            <p className="font-mono text-[11px] font-bold text-[#161616]">$180 / $260 MXN</p>
          </div>
          <ProgressBar current={180} target={260} size="sm" showLabel={false} />
          <p className="mt-2.5 text-[11px] text-emerald-700">
            <span className="font-semibold">Último avance:</span> Evidencia hace 2 días
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            trackEvent('trust_view_case_click');
            onViewCase?.();
          }}
          className="inline-flex w-full shrink-0 items-center justify-center gap-0.5 rounded-full bg-[#161616] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C94A] focus-visible:ring-offset-2 sm:w-auto"
        >
          Ver caso
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </aside>
  );
}

export default function TrustSection({ onLearnMore, onViewCase }: TrustSectionProps) {
  return (
    <section id="confianza" className="section-gap-lg mx-auto max-w-[1240px] px-4">
      <div className="rounded-[32px] border border-neutral-200/70 bg-gradient-to-br from-white via-[#FFFCF5] to-[#FFF8E9]/50 px-6 py-9 shadow-[0_20px_40px_-24px_rgba(22,22,22,0.07)] md:px-10 md:py-10 lg:px-12 lg:py-12">
        <header className="mb-8 max-w-3xl lg:mb-9">
          <Chip variant="warning" className="mb-3 px-2.5 py-1 text-[10px] uppercase tracking-widest">
            Confianza
          </Chip>
          <h2 className="mb-3 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-[#161616] md:text-[36px] lg:text-[38px]">
            Confianza que se puede revisar.
          </h2>
          <p className="mb-3 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-[15px]">
            Antes de apoyar, un caso debe sentirse claro: quién lo publica, qué necesita, cuánto falta y qué seguimiento existe.
          </p>
          <p className="max-w-xl border-l-2 border-[#F6C94A]/60 pl-3.5 text-sm leading-relaxed text-neutral-600">
            DopMi aumenta la revisión cuando entra dinero de por medio.
          </p>
        </header>

        <div className="mb-8 lg:mb-9">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Así se revisa un caso en DopMi
          </p>
          <TrustProcessRow />
          <TrustProcessTimeline />
        </div>

        <ReviewableCaseCard onViewCase={onViewCase} />

        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-9">
          <button
            type="button"
            onClick={() => {
              trackEvent('trust_learn_more_click');
              onLearnMore?.();
            }}
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#161616] underline decoration-[#F6C94A]/70 underline-offset-[5px] transition-colors hover:decoration-[#F6C94A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C94A] focus-visible:ring-offset-2"
          >
            Conocer cómo funciona
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="max-w-md text-xs leading-relaxed text-neutral-400 sm:text-right">
            Los procesos pueden variar según el tipo de caso y el nivel de riesgo.
          </p>
        </div>
      </div>
    </section>
  );
}
