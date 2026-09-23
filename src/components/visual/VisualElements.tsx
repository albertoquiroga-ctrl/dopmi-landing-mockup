import React from 'react';

export function OrganicBlob({ className = '', color = 'amber' }: { className?: string; color?: 'amber' | 'cream' | 'purple' | 'green' }) {
  const fills = {
    amber: 'from-[#F6C94A]/35 via-[#FFEAB3]/25 to-transparent',
    cream: 'from-[#FFF3D6]/80 via-[#FFF8E9]/40 to-transparent',
    purple: 'from-[#5B3FFF]/15 via-[#8B7CF7]/10 to-transparent',
    green: 'from-[#93C572]/20 via-[#C5E1A5]/10 to-transparent',
  };
  return (
    <div
      className={`absolute pointer-events-none rounded-[58%_42%_62%_38%/48%_55%_45%_52%] bg-gradient-to-br ${fills[color]} blur-[1px] ${className}`}
      aria-hidden
    />
  );
}

export function NoiseOverlay({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-multiply ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'dark' | 'purple';
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({ children, variant = 'default', icon, className = '' }: ChipProps) {
  const styles = {
    default: 'bg-white/95 text-[#161616] border-neutral-200/80 shadow-lg shadow-neutral-900/5',
    success: 'bg-emerald-50/95 text-emerald-800 border-emerald-200/60',
    warning: 'bg-[#FFF3D6]/95 text-amber-900 border-amber-200/60',
    dark: 'bg-neutral-900/90 text-white border-neutral-700/50 backdrop-blur-md',
    purple: 'bg-[#5B3FFF]/10 text-[#5B3FFF] border-[#5B3FFF]/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${styles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

interface ProgressBarProps {
  current: number;
  target: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ current, target, className = '', showLabel = true, label = '📊 Progreso', size = 'md' }: ProgressBarProps) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const complete = pct >= 100;
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] mb-1.5">
          <span className="text-neutral-500 font-medium">{label}</span>
          <span className="font-mono font-bold text-[#161616]">
            {complete ? 'Completado' : `$${current.toLocaleString()} de $${target.toLocaleString()} MXN`}
          </span>
        </div>
      )}
      <div className={`w-full bg-neutral-100/80 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${complete ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#F6C94A] to-[#FFD86B]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!complete && showLabel && (
        <span className="text-[10px] text-neutral-400 mt-1 block">📈 {pct}% cubierto</span>
      )}
    </div>
  );
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryStyles: Record<string, string> = {
  Medicina: 'bg-amber-100/90 text-amber-900 border-amber-200/80',
  Alimento: 'bg-emerald-100/90 text-emerald-900 border-emerald-200/80',
  Consulta: 'bg-sky-100/90 text-sky-900 border-sky-200/80',
  Urgencia: 'bg-rose-100/90 text-rose-900 border-rose-200/80',
};

const categoryEmojis: Record<string, string> = {
  Medicina: '💊',
  Alimento: '🥫',
  Consulta: '🩺',
  Urgencia: '🚨',
};

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const emoji = categoryEmojis[category] ?? '🐾';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryStyles[category] || 'bg-neutral-100 text-neutral-700'} ${className}`}>
      <span aria-hidden>{emoji}</span>
      {category}
    </span>
  );
}

interface PetCutoutProps {
  src: string;
  alt: string;
  className?: string;
  /** hero = grande junto al teléfono · feature = adopción · cta = cierre · compact = detalle */
  variant?: 'hero' | 'feature' | 'feature-xl' | 'cta' | 'compact';
}

const cutoutVariants = {
  hero: {
    blob: 'w-[105%] h-[80%] left-1/2 -translate-x-1/2 bottom-[0%]',
    blobInner: 'w-[88%] h-[62%] left-1/2 -translate-x-1/2 bottom-[4%]',
    img: 'object-contain object-bottom w-full h-full max-h-[122%] translate-y-2',
    ground: 'w-[78%] h-[14%] bottom-[2%]',
    filter: 'drop-shadow(0 36px 56px rgba(22,22,22,0.32)) drop-shadow(0 14px 28px rgba(246,201,74,0.18))',
  },
  feature: {
    blob: 'w-[86%] h-[68%] left-1/2 -translate-x-1/2 bottom-[0%]',
    blobInner: 'w-[72%] h-[52%] left-1/2 -translate-x-1/2 bottom-[3%]',
    img: 'object-contain object-bottom w-full h-full',
    ground: 'w-[70%] h-[10%] bottom-[1%]',
    filter: 'drop-shadow(0 24px 40px rgba(22,22,22,0.26))',
  },
  'feature-xl': {
    blob: 'w-[98%] h-[76%] left-1/2 -translate-x-1/2 bottom-[0%]',
    blobInner: 'w-[82%] h-[58%] left-1/2 -translate-x-1/2 bottom-[2%]',
    img: 'object-contain object-bottom w-full h-full max-h-[115%] translate-y-1',
    ground: 'w-[75%] h-[12%] bottom-[0%]',
    filter: 'drop-shadow(0 32px 48px rgba(22,22,22,0.3)) drop-shadow(0 10px 20px rgba(246,201,74,0.12))',
  },
  cta: {
    blob: 'w-[90%] h-[72%] left-1/2 -translate-x-1/2 bottom-[0%]',
    blobInner: 'w-[76%] h-[54%] left-1/2 -translate-x-1/2 bottom-[2%]',
    img: 'object-contain object-bottom w-full h-full max-h-[108%]',
    ground: 'w-[72%] h-[11%] bottom-[1%]',
    filter: 'drop-shadow(0 28px 44px rgba(22,22,22,0.28))',
  },
  compact: {
    blob: 'w-[92%] h-[78%] left-1/2 -translate-x-1/2 bottom-[0%]',
    blobInner: 'w-[78%] h-[58%] left-1/2 -translate-x-1/2 bottom-[2%]',
    img: 'object-contain object-bottom w-full h-full max-h-[110%]',
    ground: 'w-[68%] h-[10%] bottom-[0%]',
    filter: 'drop-shadow(0 16px 24px rgba(22,22,22,0.22))',
  },
};

export function PetCutout({ src, alt, className = '', variant = 'hero' }: PetCutoutProps) {
  const [failed, setFailed] = React.useState(false);
  const cfg = cutoutVariants[variant];

  return (
    <div className={`relative flex items-end justify-center select-none ${className}`}>
      <div
        className={`absolute rounded-full bg-gradient-to-br from-[#F6C94A]/55 via-[#FFE08A]/45 to-[#FFF3D6]/30 blur-[0.5px] ${cfg.blob}`}
        aria-hidden
      />
      <div
        className={`absolute rounded-full bg-[#F6C94A]/35 ${cfg.blobInner}`}
        aria-hidden
      />
      <div
        className={`absolute left-1/2 -translate-x-1/2 bg-[#161616]/10 blur-xl rounded-full ${cfg.ground}`}
        aria-hidden
      />

      {failed ? (
        <div className="relative z-10 w-full h-full min-h-[180px] flex items-end justify-center pb-4">
          <span className="text-5xl" aria-hidden>🐾</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`relative z-10 ${cfg.img}`}
          style={{ filter: cfg.filter }}
          onError={() => setFailed(true)}
          draggable={false}
        />
      )}
    </div>
  );
}

/** Mascota o retrato en esquina de intent cards */
export function IntentCardPet({
  src,
  alt,
  isDark = false,
  photoMode = false,
}: {
  src: string;
  alt: string;
  isDark?: boolean;
  photoMode?: boolean;
}) {
  if (photoMode) {
    return (
      <div className="absolute -right-1 -bottom-6 w-[54%] max-w-[210px] h-[80%] pointer-events-none overflow-hidden rounded-t-[22px] rounded-bl-[22px]">
        <div
          className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#4833CC] via-[#4833CC]/80 to-transparent z-20"
          aria-hidden
        />
        <img
          src={src}
          alt={alt}
          className="relative z-10 w-full h-full object-cover object-top [filter:drop-shadow(0_12px_24px_rgba(22,22,22,0.25))]"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className="absolute -right-2 -bottom-8 w-[58%] max-w-[220px] h-[72%] pointer-events-none flex items-end justify-end">
      <div
        className={`absolute w-[80%] h-[65%] left-1/2 -translate-x-1/2 bottom-[4%] rounded-full ${
          isDark ? 'bg-white/12' : 'bg-[#F6C94A]/30'
        }`}
        aria-hidden
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 w-full h-full object-contain object-bottom [filter:drop-shadow(0_12px_24px_rgba(22,22,22,0.2))]"
        draggable={false}
      />
    </div>
  );
}

interface FloatingAnnotationProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingAnnotation({ children, className = '' }: FloatingAnnotationProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-white/80 rounded-2xl p-3.5 animate-float ${className}`}>
      {children}
    </div>
  );
}

export function PawMotif({ className = '' }: { className?: string }) {
  return (
    <svg className={`text-[#F6C94A]/20 ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.5 8.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-5 3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5 3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-7.5 3c1.66 0 3-1.34 3-3 0-1.5-1.5-3.5-3-5.5-1.5 2-3 4-3 5.5 0 1.66 1.34 3 3 3z" />
    </svg>
  );
}

export function DecorativeHeart({ className = '' }: { className?: string }) {
  return (
    <img
      src="/images/decorative/heart.png"
      alt=""
      className={`pointer-events-none select-none ${className}`}
      aria-hidden
      draggable={false}
    />
  );
}

export function PawPrintTrail({ className = '' }: { className?: string }) {
  return (
    <img
      src="/images/decorative/paw-trail.svg"
      alt=""
      className={`pointer-events-none select-none object-contain opacity-80 ${className}`}
      aria-hidden
      draggable={false}
    />
  );
}

export function SectionDivider() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-2" aria-hidden>
      <div className="h-px bg-gradient-to-r from-transparent via-[#161616]/8 to-transparent" />
    </div>
  );
}
