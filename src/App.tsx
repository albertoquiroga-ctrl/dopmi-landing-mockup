import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { trackEvent, Button, StoreButton, SectionHeader } from './components/UI';
import HeroSection from './components/HeroSection';
import { IntentCard, PetCaseCard } from './components/Cards';
import GuardianSection from './components/GuardianSection';
import RescuersSection from './components/RescuersSection';
import ImpactSection from './components/ImpactSection';
import TrustSection from './components/TrustSection';
import HelpWaysSection from './components/HelpWaysSection';
import DeviceFrame from './components/visual/DeviceFrame';
import { AdoptionChatContext, AdoptionDetailScreen } from './components/visual/AppScreens';
import { NoiseOverlay, OrganicBlob, PetCutout, SectionDivider, Chip } from './components/visual/VisualElements';
import { donationCases } from './data';
import { images } from './lib/images';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] text-[#161616] font-sans overflow-x-hidden selection:bg-[#F6C94A] selection:text-neutral-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#FFF8E9]/85 backdrop-blur-xl border-b border-[#161616]/5 px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button type="button" className="flex items-center gap-2" onClick={() => handleScrollTo('hero')} aria-label="Ir al inicio">
            <span className="font-display font-bold text-xl tracking-tight flex items-center gap-1.5">
              DopMi
              <span className="w-2 h-2 bg-[#F6C94A] rounded-full" />
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#161616]/60" aria-label="Navegación principal">
            {[
              { id: 'adopcion', label: 'Adoptar', event: 'nav_adopcion' },
              { id: 'guardian', label: 'Guardián', event: 'nav_guardian' },
              { id: 'rescatistas', label: 'Rescatistas', event: 'nav_rescatistas' },
              { id: 'confianza', label: 'Confianza', event: 'nav_confianza' },
            ].map(({ id, label, event }) => (
              <button key={id} onClick={() => { handleScrollTo(id); trackEvent(event); }} className="hover:text-[#161616] transition cursor-pointer">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => { handleScrollTo('rescatistas'); trackEvent('nav_soy_rescatista'); }} className="text-xs font-bold text-neutral-500 hover:text-[#161616] transition cursor-pointer px-2">
              Soy rescatista
            </button>
            <Button variant="primary" dataEvent="navbar_download_click" onClick={() => handleScrollTo('descarga')} className="text-xs py-2 px-5">
              Descargar app
            </Button>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex flex-col justify-center gap-1 w-6 h-5" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen}>
            <span className={`h-0.5 bg-[#161616] transition-all w-full ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`h-0.5 bg-[#161616] transition-all w-full ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 bg-[#161616] transition-all w-full ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#FFF8E9]/95 backdrop-blur-xl border-b border-neutral-100 shadow-xl px-6 py-6 md:hidden flex flex-col gap-3">
            {['adopcion', 'guardian', 'rescatistas', 'confianza'].map((id) => (
              <button key={id} onClick={() => handleScrollTo(id)} className="text-left py-2 font-semibold capitalize">{id === 'adopcion' ? 'Adoptar' : id.charAt(0).toUpperCase() + id.slice(1)}</button>
            ))}
            <div className="h-px bg-neutral-200 my-2" />
            <Button variant="primary" dataEvent="navbar_download_click" onClick={() => handleScrollTo('descarga')} className="w-full">Descargar app</Button>
          </div>
        )}
      </header>

      <HeroSection onDownload={() => handleScrollTo('descarga')} onHowItWorks={() => handleScrollTo('intent')} />

      <SectionDivider />

      {/* SELECTOR */}
      <section id="intent" className="py-20 md:py-28 relative grain-bg overflow-hidden">
        <NoiseOverlay />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <SectionHeader
            title="¿Cómo quieres empezar?"
            subtitle="Tres caminos. Cambia cuando quieras."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 mt-12">
            <IntentCard type="adopt" title="Quiero adoptar" text="Explora mascotas reales, conoce su historia y habla con quien la rescató." ctaText="Ver adopciones" image={images.intentAdopt.src} onCtaClick={() => handleScrollTo('adopcion')} />
            <IntentCard type="help" title="Quiero ayudar" text="Elige una necesidad concreta: mascota, meta y avance en un solo lugar." ctaText="Apoyar un caso" image={images.intentHelp.src} onCtaClick={() => handleScrollTo('casos')} />
            <IntentCard type="rescue" title="Soy rescatista" text="Publica casos, ordena necesidades y recibe apoyo desde la app." ctaText="Registrar mi rescate" image={images.intentRescue.src} imageAlt={images.intentRescue.alt} onCtaClick={() => handleScrollTo('rescatistas')} />
          </div>
        </div>
      </section>

      {/* INFRA FRASE */}
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center relative z-10">
        <p className="text-base md:text-lg text-[#161616]/75 leading-relaxed font-medium">
          DopMi ordena lo que hoy vive disperso en grupos, chats y publicaciones: adopciones, casos urgentes y apoyo a rescatistas en una sola app.
        </p>
      </div>

      <SectionDivider />

      {/* ADOPCIÓN */}
      <section id="adopcion" className="section-gap-lg max-w-6xl mx-auto px-4 relative overflow-hidden pb-24 md:pb-32">
        <OrganicBlob className="w-[350px] h-[350px] -bottom-20 -left-20" color="cream" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          <div className="lg:col-span-6 relative">
            <div className="flex flex-col md:flex-row items-end gap-4 justify-center lg:justify-start">
              <div className="w-[58%] max-w-[300px] relative z-[25] md:-mr-16">
                <PetCutout variant="feature" src={images.adoptionCat.src} alt={images.adoptionCat.alt} className="w-full aspect-[3/4]" />
              </div>
              <div className="relative z-20">
                <DeviceFrame size="md">
                  <AdoptionDetailScreen />
                </DeviceFrame>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="mb-4">
              <Chip variant="warning" className="text-xs md:text-sm tracking-normal normal-case px-4 py-2">
                Adopciones
              </Chip>
            </div>
            <h2 className="text-3xl md:text-[48px] font-display font-bold tracking-tight leading-[1.08] mb-5">
              Detrás de cada carita hay una historia.
            </h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6">
              Ficha clara, pasos del proceso y seguimiento post-adopción — más contexto que un chat suelto.
            </p>

            <div className="mb-8 max-w-md">
              <AdoptionChatContext />
            </div>

            <Button variant="primary" dataEvent="adoptions_section_cta" onClick={() => handleScrollTo('descarga')}>
              Ver adopciones
            </Button>
          </div>
        </div>
      </section>

      <div className="px-4"><GuardianSection onDownload={() => handleScrollTo('descarga')} /></div>

      {/* CASOS */}
      <section id="casos" className="py-20 md:py-28 bg-gradient-to-b from-[#FAFAFA] to-[#FFF8E9] border-y border-neutral-200/60 relative overflow-hidden">
        <NoiseOverlay />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="max-w-2xl mb-10">
            <div className="mb-4">
              <Chip variant="warning" className="text-xs md:text-sm tracking-normal normal-case px-4 py-2">
                Casos urgentes
              </Chip>
            </div>
            <h2 className="text-3xl md:text-[48px] font-display font-bold tracking-tight leading-[1.08]">
              Donaciones únicas a casos urgentes
            </h2>
            <p className="text-neutral-600 text-sm md:text-base mt-4 max-w-lg">
              Una necesidad concreta: ves qué falta, quién lo gestiona y qué avance se reportó.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-stretch">
            {donationCases.map((c) => (
              <div key={c.id} className="contents">
                <PetCaseCard caseData={c} onAction={() => handleScrollTo('descarga')} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button type="button" onClick={() => { trackEvent('view_all_cases_click'); handleScrollTo('descarga'); }} className="text-sm font-bold text-[#5B3FFF] hover:underline cursor-pointer inline-flex items-center gap-1">
              Ver todos los casos en la app <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <HelpWaysSection onViewCases={() => handleScrollTo('casos')} onBecomeGuardian={() => handleScrollTo('guardian')} />

      <TrustSection
        onLearnMore={() => handleScrollTo('casos')}
        onViewCase={() => handleScrollTo('casos')}
      />

      <div className="px-4"><RescuersSection onDownload={() => handleScrollTo('descarga')} /></div>

      <ImpactSection onDownload={() => handleScrollTo('descarga')} />

      {/* CTA FINAL */}
      <section id="descarga" className="relative max-w-6xl mx-auto px-4 mt-20 md:mt-28 mb-24 md:mb-32">
        <div className="relative bg-gradient-to-br from-[#FFF3D6] via-[#FFF8E9] to-[#FFEAB3]/50 rounded-[32px] py-16 px-6 md:py-24 md:px-14 overflow-hidden border border-amber-200/60 grain-bg shadow-xl">
          <NoiseOverlay />
          <OrganicBlob className="w-[450px] h-[450px] -top-40 -right-32" color="amber" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end relative z-10">
            <div className="lg:col-span-7 text-center lg:text-left">
              <h2 className="text-3xl md:text-[52px] font-display font-bold tracking-tight leading-[1.06] mb-5">
                Conoce a nuestros amigos y forma parte de la manada.
              </h2>
              <p className="text-neutral-700 text-sm md:text-base mb-8 max-w-md mx-auto lg:mx-0">
                Cuidado: te puedes terminar enamorando
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-6">
                <StoreButton store="apple" dataEvent="app_store_click" className="w-full sm:w-auto" />
                <StoreButton store="google" dataEvent="google_play_click" className="w-full sm:w-auto" />
              </div>

              <Button variant="secondary" dataEvent="final_rescuer_cta_click" onClick={() => handleScrollTo('rescatistas')} className="text-sm">
                Soy rescatista
              </Button>
            </div>

            <div className="lg:col-span-5 flex justify-center relative">
              <div className="w-[85%] max-w-[380px]">
                <PetCutout variant="cta" src={images.ctaDog.src} alt={images.ctaDog.alt} className="w-full aspect-[4/5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative w-full">
        <img
          src={images.footerPets.src}
          alt=""
          draggable={false}
          loading="lazy"
          aria-hidden
          className="pointer-events-none relative z-10 block w-full h-auto translate-y-[4%]"
        />
        {/* FOOTER — inicio al ras del “muro”; patas colgando encima */}
        <footer className="relative z-[1] -mt-[calc(100%*241/1024*0.35)] bg-[#161616] px-4 pb-10 pt-[calc(100%*241/1024*0.35)] text-[#FFF8E9] md:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="font-display font-bold text-xl flex items-center gap-1.5 mb-2">
                DopMi <span className="w-2 h-2 bg-[#F6C94A] rounded-full" />
              </p>
              <p className="text-neutral-500 text-sm italic">Helping feels good.</p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400" aria-label="Enlaces del footer">
              {[
                { id: 'adopcion', label: 'Adoptar' },
                { id: 'guardian', label: 'Guardián' },
                { id: 'rescatistas', label: 'Rescatistas' },
                { id: 'confianza', label: 'Confianza' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => handleScrollTo(id)} className="hover:text-[#F6C94A] transition cursor-pointer">{label}</button>
              ))}
              <span className="hover:text-[#F6C94A] transition cursor-pointer">Centro de ayuda</span>
              <a href="/privacy-policy" className="hover:text-[#F6C94A] transition">Privacidad</a>
              <span className="hover:text-[#F6C94A] transition cursor-pointer">Términos</span>
            </nav>
          </div>

          <p className="text-xs text-neutral-600 mt-8 text-center md:text-left">© 2026 DopMi. Todos los derechos reservados.</p>
        </div>
        </footer>
      </div>
    </div>
  );
}
