import React from 'react';

interface DeviceFrameProps {
  children?: React.ReactNode;
  /** Real app screenshot — fills the screen area edge-to-edge */
  screenshot?: string;
  screenshotAlt?: string;
  screenshotPosition?: string;
  screenshotScale?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tilt?: boolean;
}

const sizes = {
  sm: 'w-[220px]',
  md: 'w-[260px]',
  lg: 'w-[280px]',
};

export default function DeviceFrame({
  children,
  screenshot,
  screenshotAlt = 'Captura de pantalla de la app DopMi',
  screenshotPosition = '50% 0%',
  screenshotScale = 1.02,
  className = '',
  size = 'lg',
  tilt = false,
}: DeviceFrameProps) {
  const isScreenshot = Boolean(screenshot);

  return (
    <div className={`relative mx-auto ${sizes[size]} ${tilt ? 'rotate-[-2deg] hover:rotate-0 transition-transform duration-500' : ''} ${className}`}>
      <div className="absolute -inset-3 bg-gradient-to-b from-[#F6C94A]/20 via-transparent to-neutral-900/5 rounded-[52px] blur-xl pointer-events-none" />
      <div className="relative bg-[#1a1a1a] rounded-[44px] p-[10px] shadow-[0_32px_64px_-12px_rgba(22,22,22,0.35),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        {!isScreenshot && (
          <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[28%] h-[22px] bg-[#1a1a1a] rounded-full z-20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-neutral-800" />
          </div>
        )}
        <div className={`relative rounded-[36px] overflow-hidden aspect-[9/19.5] ${isScreenshot ? 'bg-[#FFF8E9]' : 'bg-[#FFF8E9]'}`}>
          {!isScreenshot && (
            <div className="absolute top-0 inset-x-0 h-10 flex items-end justify-between px-6 pb-1 z-10 pointer-events-none">
              <span className="text-[9px] font-semibold text-neutral-500">9:41</span>
              <div className="flex gap-0.5 items-end">
                <div className="w-3.5 h-2 border border-neutral-400 rounded-[2px] relative">
                  <div className="absolute inset-[1px] right-[2px] bg-neutral-500 rounded-[1px]" />
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 overflow-hidden bg-[#FFF8E9]">
            {isScreenshot ? (
              <img
                src={screenshot}
                alt={screenshotAlt}
                className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover select-none [transform:translateZ(0)]"
                style={{
                  objectPosition: screenshotPosition,
                  transform: `translateZ(0) scale(${screenshotScale})`,
                }}
                draggable={false}
                decoding="async"
              />
            ) : (
              <div className="h-full overflow-hidden">{children}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
