import React from 'react';
import { ChevronRight, Play, Shield, TrendingUp } from 'lucide-react';
import { Button, StoreButton } from './UI';
import DeviceFrame from './visual/DeviceFrame';
import { AdoptionDetailScreen } from './visual/AppScreens';
import { Chip, FloatingAnnotation, NoiseOverlay, OrganicBlob, PetCutout } from './visual/VisualElements';
import { images } from '../lib/images';

interface HeroSectionProps {
  onDownload: () => void;
  onHowItWorks: () => void;
}

export default function HeroSection({ onDownload, onHowItWorks }: HeroSectionProps) {
  return (
    <section id="hero" className="relative pt-10 pb-16 md:pt-16 md:pb-32 px-4 md:px-8 max-w-6xl mx-auto overflow-hidden grain-bg">
      <NoiseOverlay />
      <OrganicBlob className="w-[520px] h-[520px] -top-32 -right-48" color="amber" />
      <OrganicBlob className="w-[380px] h-[380px] bottom-[-60px] -left-40" color="green" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-4 items-end relative z-10">
        <div className="lg:col-span-5 text-left flex flex-col items-start order-2 lg:order-1 pb-4 lg:pb-16">
          <Chip variant="warning" className="mb-5 uppercase tracking-widest text-[10px]">DopMi</Chip>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-display font-bold text-[#161616] tracking-tight leading-[1.1] mb-5">
            Ayudar a{' '}
            <span className="italic font-semibold text-[#161616]/90">animalitos</span>{' '}
            <span className="font-sans font-medium text-[#161616]/65 tracking-normal text-[0.94em]">
              siempre debe
            </span>{' '}
            <span className="hero-chalk-highlight">sentirse bien y seguro</span>.
          </h1>

          <p className="text-[#161616]/65 text-base md:text-lg leading-relaxed mb-7 max-w-md">
            Adopciones, casos urgentes y rescatistas — sin perderte entre grupos, chats y capturas.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-5">
            <Button variant="primary" dataEvent="hero_download_click" onClick={onDownload} className="font-bold shadow-lg shadow-neutral-900/10">
              Descargar app <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="secondary" dataEvent="hero_how_it_works_click" onClick={onHowItWorks} className="gap-2">
              <Play className="w-3.5 h-3.5 fill-current" /> Ver cómo funciona
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <StoreButton store="apple" dataEvent="app_store_click" />
            <StoreButton store="google" dataEvent="google_play_click" />
          </div>
        </div>

        <div className="lg:col-span-7 relative flex justify-center items-end min-h-[480px] sm:min-h-[560px] md:min-h-[640px] order-1 lg:order-2">
          <div className="absolute left-[-4%] sm:left-0 bottom-[-16px] sm:bottom-[-24px] w-[72%] sm:w-[68%] md:w-[64%] max-w-[520px] z-[25] pointer-events-none">
            <PetCutout
              variant="hero"
              src={images.heroDogCutout.src}
              alt={images.heroDogCutout.alt}
              className="w-full aspect-[3/4] sm:aspect-[4/5] max-h-[580px]"
            />
          </div>

          <div className="relative z-20 ml-auto mr-0 lg:translate-x-2 shrink-0">
            <DeviceFrame size="lg" tilt className="w-[240px] sm:w-[280px]">
              <AdoptionDetailScreen />
            </DeviceFrame>

            <FloatingAnnotation className="absolute -top-2 -left-14 md:-left-20 max-w-[160px] hidden md:flex animate-float-delayed">
              <Chip variant="warning" icon={<TrendingUp className="w-3 h-3" />}>Caso activo</Chip>
            </FloatingAnnotation>

            <FloatingAnnotation className="absolute top-[38%] -right-10 md:-right-16 max-w-[170px] hidden lg:flex">
              <div className="space-y-1.5 w-full">
                <span className="text-[10px] font-bold text-[#161616] block">Avances claros</span>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-[#F6C94A] to-emerald-400 rounded-full" />
                </div>
              </div>
            </FloatingAnnotation>

            <FloatingAnnotation className="absolute -bottom-2 -left-6 max-w-[165px] hidden sm:flex">
              <Chip variant="success" icon={<Shield className="w-3 h-3" />}>Rescatista revisada</Chip>
            </FloatingAnnotation>
          </div>
        </div>
      </div>
    </section>
  );
}
