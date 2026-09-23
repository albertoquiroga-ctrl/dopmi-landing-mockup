import React from 'react';
import { Calendar, MessageSquare, ClipboardCheck, Share2 } from 'lucide-react';
import { Button } from './UI';
import DeviceFrame from './visual/DeviceFrame';
import { ShareableProfileCard } from './visual/AppScreens';
import { OrganicBlob } from './visual/VisualElements';
import { images } from '../lib/images';

interface RescuersSectionProps {
  onDownload?: () => void;
}

const features = [
  { icon: Calendar, title: 'Publica casos con ficha completa.' },
  { icon: MessageSquare, title: 'Recibe mensajes de adoptantes en la app.' },
  { icon: ClipboardCheck, title: 'Sube evidencia y avances.' },
  { icon: Share2, title: 'Comparte tu perfil con un solo link.' },
];

export default function RescuersSection({ onDownload }: RescuersSectionProps) {
  return (
    <section id="rescatistas" className="relative rounded-[40px] py-16 px-6 md:py-24 md:px-12 my-16 overflow-hidden border border-neutral-200/80 bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F0FF]/30">
      <OrganicBlob className="w-[400px] h-[400px] top-0 right-0 opacity-50" color="purple" />

      {/* Foto anclada al fondo del card — sobresale hacia arriba, capa sobre items 2–4 */}
      <div
        className="hidden lg:block absolute bottom-0 right-4 xl:right-10 w-[min(43%,384px)] h-[min(74%,544px)] pointer-events-none z-20"
        aria-hidden
      >
        <div className="absolute inset-x-[4%] bottom-[4%] top-[14%] rounded-[50%] bg-[#5B3FFF]/10 blur-3xl" />
        <div className="absolute inset-x-[10%] bottom-[8%] top-[24%] rounded-[50%] bg-white/60 blur-2xl" />
        <img
          src={images.rescuerWithCat.src}
          alt=""
          draggable={false}
          loading="lazy"
          className="relative w-full h-full object-contain object-bottom drop-shadow-[0_32px_56px_rgba(22,22,22,0.2)]"
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10">
        <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
          <div className="relative">
            <DeviceFrame
              size="lg"
              tilt
              screenshot={images.rescueDashboard.src}
              screenshotAlt={images.rescueDashboard.alt}
              screenshotPosition="50% 0%"
              screenshotScale={1}
            />
            <div className="absolute -bottom-2 -right-10 hidden md:block rotate-[5deg] hover:rotate-0 transition-transform duration-500">
              <ShareableProfileCard />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2 relative">
          <div className="relative max-w-xl">
            <span className="relative z-10 py-1.5 px-3.5 rounded-full bg-[#5B3FFF]/10 text-[#5B3FFF] font-semibold text-xs uppercase tracking-wider inline-block mb-4">
              Rescatistas y refugios
            </span>

            <h2 className="relative z-10 text-3xl md:text-[48px] font-display font-bold text-[#161616] tracking-tight leading-[1.08] mb-5">
              Menos caos para quien ya rescató de más.
            </h2>

            <p className="relative z-10 text-neutral-600 text-sm md:text-base leading-relaxed mb-4 max-w-xl">
              Publicar en redes, contestar DMs, explicar cada gasto, perseguir adoptantes. DopMi ordena ese trabajo para personas y refugios que rescatan.
            </p>

            <p className="relative z-10 text-neutral-500 text-sm mb-8 max-w-xl">
              Tu perfil Dopmi te permite:
            </p>

            <ul className="space-y-3 mb-8">
              {features.map(({ icon: Icon, title }, index) => (
                <li
                  key={title}
                  className={`relative flex items-start gap-3 rounded-2xl p-3 border border-neutral-100/80 ${
                    index === 0
                      ? 'z-30 bg-white/95 backdrop-blur-sm'
                      : 'z-10 bg-white/70'
                  }`}
                >
                  <div className="bg-[#5B3FFF]/10 text-[#5B3FFF] p-2 rounded-xl shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm text-neutral-700 pt-1">{title}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              dataEvent="rescuer_cta_click"
              onClick={onDownload}
              className="relative z-30 bg-[#5B3FFF] hover:bg-[#4833CC] shadow-lg shadow-[#5B3FFF]/20"
            >
              Registrar mi rescate
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
