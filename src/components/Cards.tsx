import React from 'react';
import { Heart, Home, Shield, PawPrint, Sparkles, Users, ClipboardList } from 'lucide-react';
import { DonationCase, TrustPillar } from '../types';
import { trackEvent, Button } from './UI';
import { CategoryBadge, ProgressBar, IntentCardPet } from './visual/VisualElements';
import { images } from '../lib/images';

interface IntentCardProps {
  type: 'adopt' | 'help' | 'rescue';
  title: string;
  text: string;
  ctaText: string;
  image?: string;
  imageAlt?: string;
  onCtaClick?: () => void;
}

const intentConfig = {
  adopt: {
    bg: 'bg-white',
    border: 'border-[#F6C94A]/30',
    accent: 'bg-[#F6C94A]/15 text-amber-900',
    icon: Home,
    iconBg: 'bg-[#F6C94A]',
    dataEvent: 'intent_adopt_click',
    glow: 'shadow-[0_20px_50px_-12px_rgba(246,201,74,0.25)]',
  },
  help: {
    bg: 'bg-gradient-to-br from-[#FFF3D6] to-[#FFEAB3]/60',
    border: 'border-amber-200/50',
    accent: 'bg-amber-900/10 text-amber-900',
    icon: Heart,
    iconBg: 'bg-amber-600',
    dataEvent: 'intent_help_click',
    glow: 'shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)]',
  },
  rescue: {
    bg: 'bg-gradient-to-br from-[#5B3FFF] to-[#4833CC]',
    border: 'border-[#5B3FFF]/30',
    accent: 'bg-white/15 text-white',
    icon: Shield,
    iconBg: 'bg-white/20',
    dataEvent: 'intent_rescuer_click',
    glow: 'shadow-[0_20px_50px_-12px_rgba(91,63,255,0.35)]',
  },
};

export function IntentCard({ type, title, text, ctaText, image, imageAlt = '', onCtaClick }: IntentCardProps) {
  const cfg = intentConfig[type];
  const Icon = cfg.icon;
  const isDark = type === 'rescue';

  return (
    <div className={`group relative rounded-[28px] p-7 border ${cfg.bg} ${cfg.border} ${cfg.glow} overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col min-h-[360px] ${type === 'adopt' ? 'md:min-h-[380px] ring-1 ring-[#F6C94A]/20' : ''}`}>
      {image && <IntentCardPet src={image} alt={imageAlt} isDark={isDark} photoMode={type === 'rescue'} />}

      <div className={`w-11 h-11 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-5 shadow-md`}>
        <Icon className={`w-5 h-5 ${isDark ? 'text-white' : type === 'help' ? 'text-white' : 'text-[#161616]'}`} />
      </div>

      <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full w-fit mb-3 ${cfg.accent}`}>
        {type === 'adopt' ? 'Adopción' : type === 'help' ? 'Apoyo' : 'Rescatista'}
      </span>

      <h3 className={`text-xl md:text-2xl font-display font-bold mb-2 tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-[#161616]'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed max-w-[220px] relative z-10 flex-1 ${isDark ? 'text-white/75' : 'text-neutral-600'}`}>
        {text}
      </p>

      <div className="relative z-10 mt-6">
        <Button variant="primary" dataEvent={cfg.dataEvent} className="text-xs py-2.5 px-5 font-semibold" onClick={onCtaClick}>
          {ctaText}
        </Button>
      </div>
    </div>
  );
}

interface PetCaseCardProps {
  caseData: DonationCase;
  onAction?: () => void;
}

const caseImages: Record<string, string> = {
  Milo: images.caseMilo.src,
  Nina: images.caseNina.src,
  Rocky: images.caseRockyPhoto.src,
};

const caseImageObjectClass: Record<string, string> = {
  Nina: 'object-[center_32%]',
  Rocky: 'object-[center_28%]',
};

const statusBadgeStyles = {
  Urgente: 'bg-red-50/95 text-red-700 border-red-200/70',
  Activo: 'bg-[#5B3FFF]/10 text-[#5B3FFF] border-[#5B3FFF]/20',
  Completado: 'bg-emerald-50/95 text-emerald-700 border-emerald-200/70',
} as const;

const statusEmojis = {
  Urgente: '⚡',
  Activo: '🟢',
  Completado: '✅',
} as const;

export function PetCaseCard({ caseData, onAction }: PetCaseCardProps) {
  const pct = Math.min(Math.round((caseData.currentAmount / caseData.targetAmount) * 100), 100);
  const isComplete = caseData.isCompleted || pct >= 100;
  const imageSrc = caseImages[caseData.petName] || caseData.imageUrl;

  const ctaLabel = isComplete ? 'Ver avance' : 'Apoyar caso';

  const handleClick = () => {
    trackEvent('case_support_click', { petName: caseData.petName, status: caseData.status });
    onAction?.();
  };

  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-[28px] border border-neutral-100/80 bg-white shadow-[0_8px_30px_-8px_rgba(22,22,22,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-12px_rgba(22,22,22,0.15)]">
      <div className="relative h-[220px] overflow-hidden bg-neutral-100">
        <img
          src={imageSrc}
          alt={`${caseData.petName}, ${caseData.category.toLowerCase()}`}
          className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${caseImageObjectClass[caseData.petName] ?? 'object-center'}`}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusBadgeStyles[caseData.status]}`}>
          <span aria-hidden>{statusEmojis[caseData.status]}</span>
          {caseData.status}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="font-display font-bold text-white text-xl drop-shadow-sm">{caseData.petName}</h4>
          <p className="text-white/80 text-[11px]">{caseData.itemTitle}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <CategoryBadge category={caseData.category} />

        <p className="text-[11px] text-neutral-600 leading-snug">
          <span aria-hidden>👤 </span>
          <span className="text-neutral-400">Rescatista ·</span> {caseData.rescuerName}
        </p>

        <p className="text-[10px] text-neutral-500">
          <span aria-hidden>🕒 </span>
          <span className="text-neutral-400">Último avance ·</span> {caseData.lastUpdate}
        </p>

        <ProgressBar
          current={caseData.currentAmount}
          target={caseData.targetAmount}
          size="sm"
          label="💰 Progreso"
          className="mb-1"
        />

        <button
          type="button"
          onClick={handleClick}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer mt-auto ${
            isComplete ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-[#161616] text-white hover:bg-neutral-800'
          }`}
          data-event="case_support_click"
        >
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}

const pillarIcons = [Users, ClipboardList, Sparkles, Shield];

export function TrustPillarCard({ pillar, index = 0 }: { pillar: TrustPillar; index?: number }) {
  const Icon = pillarIcons[index] || Shield;
  return (
    <div className="group bg-white border border-neutral-100 rounded-[24px] p-6 hover:shadow-lg hover:border-[#F6C94A]/30 transition-all duration-300">
      <div className="w-10 h-10 rounded-2xl bg-[#FFF3D6] text-amber-800 flex items-center justify-center mb-4 group-hover:bg-[#F6C94A]/30 transition-colors">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <span className="text-[10px] font-mono text-neutral-400 mb-1 block">{pillar.id}</span>
      <h4 className="font-display font-bold text-base text-[#161616] mb-2">{pillar.title}</h4>
      <p className="text-neutral-600 text-sm leading-relaxed">{pillar.description}</p>
    </div>
  );
}

export function MiniStatCard({ label, value, icon: Icon = PawPrint }: { label: string; value: string; icon?: typeof PawPrint }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-[#F6C94A]" />
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className="font-display font-bold text-lg text-[#161616]">{value}</span>
    </div>
  );
}
