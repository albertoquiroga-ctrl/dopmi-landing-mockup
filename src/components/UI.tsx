import React from 'react';

// Simple event tracker with detailed, clean dev output
export function trackEvent(name: string, payload?: Record<string, any>) {
  console.log(`%c[DopMi Analytics] %cTracked: ${name}`, 'color: #F6C94A; font-weight: bold', 'color: #FFF; background: #161616; padding: 2px 6px; border-radius: 4px;', payload || '');
  // Custom event trigger if standard track system exists in window
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, payload);
  }
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'text';
  dataEvent: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function Button({ variant = 'primary', dataEvent, children, className = '', onClick, ...props }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent(dataEvent);
    if (onClick) onClick(e);
  };

  const baseStyles = "px-7 py-3.5 rounded-full font-medium transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F6C94A] cursor-pointer text-sm md:text-base flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-[#161616] text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white text-[#161616] border border-[#161616]/10 hover:bg-neutral-50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    accent: "bg-[#F6C94A] text-[#161616] hover:bg-[#f7d163] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5",
    text: "text-[#161616] hover:text-[#5B3FFF] font-medium hover:underline px-2 py-1"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={handleClick}
      data-event={dataEvent}
      {...props}
    >
      {children}
    </button>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {eyebrow && (
        <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-[#5B3FFF] uppercase mb-3 px-3 py-1 bg-[#5B3FFF]/10 rounded-full">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-display font-bold text-[#161616] tracking-tight leading-tight max-w-3xl mx-auto">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface StoreButtonProps {
  store: 'apple' | 'google';
  dataEvent: string;
  className?: string;
}

export function StoreButton({ store, dataEvent, className = '' }: StoreButtonProps) {
  const handleClick = () => {
    trackEvent(dataEvent);
  };

  const base = `bg-[#161616] text-white hover:bg-neutral-800 transition-all duration-300 px-5 py-3 rounded-2xl flex items-center gap-3 border border-neutral-800/50 cursor-pointer active:scale-[0.98] text-left shadow-lg shadow-neutral-900/15 hover:shadow-xl hover:-translate-y-0.5 ${className}`;

  if (store === 'apple') {
    return (
      <button onClick={handleClick} className={base} data-event={dataEvent}>
        <svg className="w-7 h-7 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path d="M18.71,19.5 C17.88,20.74 17,21.95 15.66,21.97 C14.32,22 13.89,21.18 12.37,21.18 C10.84,21.18 10.37,21.95 9.1,22 C7.79,22.05 6.8,20.68 5.96,19.47 C4.25,17 2.94,12.45 4.7,9.39 C5.57,7.87 7.13,6.91 8.82,6.88 C10.1,6.86 11.32,7.75 12.11,7.75 C12.89,7.75 14.37,6.68 15.92,6.84 C16.57,6.87 18.39,7.1 19.56,8.82 C19.47,8.88 17.39,10.1 17.41,12.63 C17.44,15.65 20.06,16.66 20.1,16.67 C20.08,16.74 19.67,18.11 18.71,19.5 M15.97,4.17 C16.63,3.37 17.07,2.28 16.95,1 C16,1.04 14.9,1.6 14.24,2.38 C13.68,3.04 13.19,4.14 13.34,5.39 C14.39,5.47 15.4,4.88 15.97,4.17" />
        </svg>
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Descargar en</span>
          <span className="block text-sm font-bold -mt-0.5">App Store</span>
        </div>
      </button>
    );
  }

  return (
    <button onClick={handleClick} className={base} data-event={dataEvent}>
      <svg className="w-7 h-7 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path d="M3,5.27V18.73 L16.55,12 L3,5.27 M17.87,11.33 L21,12.89 C21.43,13.11 21.43,13.73 21,13.95 L17.87,15.51 L15,12 L17.87,11.33 M3.27,3 L15.71,11.45 L13,12 L3.27,3 M3.27,21 L13,12 L15.71,12.55 L3.27,21 Z" />
      </svg>
      <div>
        <span className="block text-[9px] uppercase tracking-wider text-neutral-400">Descargar en</span>
        <span className="block text-sm font-bold -mt-0.5">Google Play</span>
      </div>
    </button>
  );
}

interface FloatingBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingBadge({ children, className = '' }: FloatingBadgeProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#161616]/5 rounded-2xl p-4 flex items-center gap-3.5 animate-float ${className}`}>
      {children}
    </div>
  );
}
