import React from 'react';
import { Check, ChevronLeft, Heart, Shield, MapPin, MessageCircle } from 'lucide-react';
import { images } from '../../lib/images';
import { CategoryBadge, ProgressBar } from './VisualElements';

export function AdoptionDetailScreen({ petName = 'Lana', petImage = images.screenLana.src }: { petName?: string; petImage?: string }) {
  return (
    <div className="flex flex-col h-full bg-[#FFF8E9] pt-8 pb-4">
      <div className="px-4 flex items-center gap-2 mb-2">
        <ChevronLeft className="w-4 h-4 text-neutral-500" />
        <span className="text-[11px] font-semibold text-neutral-500">Adopciones</span>
      </div>

      <div className="relative mx-4 h-[42%] rounded-2xl overflow-hidden shadow-md">
        <img src={petImage} alt={petName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <span className="absolute top-2.5 left-2.5 bg-emerald-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full" /> Disponible
        </span>
        <button type="button" className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-md" aria-label="Favorito">
          <Heart className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      <div className="px-4 pt-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-display font-bold text-lg text-[#161616]">{petName}</h4>
            <p className="text-[10px] text-neutral-500">Hembra · 2 años · Mediana</p>
          </div>
          <span className="text-[9px] bg-[#F6C94A]/30 text-amber-900 font-semibold px-2 py-0.5 rounded-full">Esterilizada</span>
        </div>

        <div className="flex items-center gap-1 mt-2 text-[10px] text-neutral-600">
          <MapPin className="w-3 h-3 text-[#5B3FFF]" />
          <span>Rescatista activa</span>
        </div>

        <p className="text-[10px] text-neutral-600 leading-relaxed mt-2 line-clamp-2">
          Rescatada hace un mes. Amigable, juguetona y busca hogar definitivo con familia paciente.
        </p>

        <div className="mt-auto pt-3 space-y-1.5">
          <button type="button" className="w-full py-2.5 bg-[#161616] text-white text-[11px] font-bold rounded-xl">
            Me interesa adoptar
          </button>
          <button type="button" className="w-full py-2 text-[#5B3FFF] text-[10px] font-semibold">
            Ver historia completa
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdoptionStoryScreen({ petName = 'Miau', petImage = images.screenMiau.src }: { petName?: string; petImage?: string }) {
  return (
    <div className="flex flex-col h-full bg-white pt-8">
      <div className="px-4 pb-3 border-b border-neutral-100">
        <span className="text-[10px] text-[#5B3FFF] font-semibold uppercase tracking-wider">Historia</span>
        <h4 className="font-display font-bold text-base text-[#161616] mt-0.5">{petName}</h4>
      </div>
      <div className="relative h-[38%] mx-4 mt-3 rounded-xl overflow-hidden">
        <img src={petImage} alt={petName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="px-4 py-3 space-y-2 flex-1">
        <div className="flex gap-2">
          <span className="text-[9px] bg-neutral-100 px-2 py-1 rounded-lg font-medium">Disponible</span>
        </div>
        <p className="text-[10px] text-neutral-600 leading-relaxed">
          Encontrado en colonia residencial. Sociable, usa arenero y convive bien con otros gatos.
        </p>
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-50">
          <div className="w-7 h-7 rounded-full bg-[#F6C94A]/40 flex items-center justify-center text-[9px] font-bold">MR</div>
          <div>
            <p className="text-[10px] font-semibold">María R.</p>
            <p className="text-[9px] text-neutral-400">Rescatista responsable</p>
          </div>
          <MessageCircle className="w-4 h-4 text-[#5B3FFF] ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function CaseNeedsScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FFF8E9] pt-8 px-4 pb-4">
      <span className="text-[10px] font-semibold text-neutral-500 mb-1">Caso activo</span>
      <h4 className="font-display font-bold text-base text-[#161616] mb-3">Milo · Medicina</h4>

      <div className="relative h-[32%] rounded-xl overflow-hidden mb-3">
        <img src={images.caseMilo.src} alt="Milo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <CategoryBadge category="Medicina" className="absolute top-2 left-2" />
      </div>

      <p className="text-[10px] text-neutral-600 mb-3">Spray antiséptico para herida en pata trasera.</p>

      <ProgressBar current={180} target={260} size="sm" />

      <div className="mt-auto pt-3">
        <button type="button" className="w-full py-2.5 bg-[#161616] text-white text-[11px] font-bold rounded-xl">
          Apoyar caso
        </button>
      </div>
    </div>
  );
}

export function GuardianImpactScreen() {
  return (
    <div className="flex flex-col h-full bg-[#161616] pt-8 px-4 pb-4 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-[#F6C94A]" />
        <span className="text-[11px] font-semibold text-[#F6C94A]">Tu impacto</span>
      </div>

      <h4 className="font-display font-bold text-lg leading-tight mb-1">Tu mes en DopMi</h4>
      <p className="text-[10px] text-neutral-400 mb-4">Mayo 2026 · Guardián activo</p>

      <div className="space-y-2 flex-1">
        {[
          'Consulta cubierta',
          'Traslado realizado',
          'Tratamiento iniciado',
        ].map((detail) => (
          <div key={detail} className="flex items-center gap-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl p-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-medium">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800">
        <p className="text-[9px] text-neutral-500 leading-relaxed">
          Lo que logró el fondo recientemente. Reporte retrospectivo, no asignación futura.
        </p>
      </div>
    </div>
  );
}

export function GuardianSubscribeScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FFF8E9] pt-8 px-4 pb-4 justify-center">
      <div className="text-center mb-4">
        <div className="w-12 h-12 mx-auto bg-[#F6C94A]/30 rounded-2xl flex items-center justify-center mb-2">
          <Shield className="w-6 h-6 text-amber-700" />
        </div>
        <h4 className="font-display font-bold text-sm text-[#161616]">Modo Guardián activo</h4>
        <p className="text-[10px] text-neutral-500 mt-1">$150 MXN / mes</p>
      </div>
      <div className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm">
        <p className="text-[10px] text-neutral-600 text-center">Tu aporte se distribuye a urgencias priorizadas cada mes.</p>
      </div>
      <p className="text-[9px] text-neutral-400 text-center mt-3">Puedes cambiar o pausar cuando quieras</p>
    </div>
  );
}

export function RescuerDashboardScreen() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] pt-8 px-3 pb-4">
      <div className="flex justify-between items-center px-1 mb-3">
        <h4 className="font-display font-bold text-sm text-[#161616]">Mis casos</h4>
        <span className="text-[9px] bg-[#5B3FFF]/10 text-[#5B3FFF] font-bold px-2 py-0.5 rounded-full">4 activos</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-3 px-1">
        {[
          { label: 'Activos', val: '4' },
          { label: 'Adopciones', val: '2' },
          { label: 'Pendientes', val: '1' },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white rounded-xl p-2 text-center border border-neutral-100">
            <span className="block text-[8px] text-neutral-400 uppercase">{label}</span>
            <span className="font-display font-bold text-sm text-[#161616]">{val}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-2.5 border border-neutral-100 flex-1 space-y-2">
        {[
          { name: 'Luna', status: 'Adopción', detail: '2 solicitantes', img: images.screenLana.src, color: 'bg-emerald-100 text-emerald-800' },
          { name: 'Milo', status: 'Medicina', detail: '$180 / $260', img: images.caseMilo.src, color: 'bg-amber-100 text-amber-800' },
          { name: 'Nina', status: 'Alimento', detail: '$90 / $320', img: images.caseNina.src, color: 'bg-sky-100 text-sky-800' },
        ].map(({ name, status, detail, img, color }) => (
          <div key={name} className="flex items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 border border-neutral-50">
            <img src={img} alt={name} className="w-9 h-9 rounded-lg object-cover" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold text-[#161616]">{name}</p>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${color}`}>{status}</span>
              </div>
              <p className="text-[9px] text-neutral-400">{detail}</p>
            </div>
          </div>
        ))}
        <button type="button" className="w-full py-2 bg-[#5B3FFF]/10 text-[#5B3FFF] text-[10px] font-bold rounded-xl mt-1">
          + Nuevo caso
        </button>
      </div>
    </div>
  );
}

export function TrustProfileScreen() {
  return (
    <div className="flex flex-col h-full bg-white pt-8 px-4 pb-4">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-[#F6C94A]/30 flex items-center justify-center text-lg font-display font-bold text-[#161616] mb-2">MR</div>
        <h4 className="font-display font-bold text-sm">María R.</h4>
        <p className="text-[10px] text-neutral-500">Rescatista · Refugio San Jerónimo</p>
        <span className="mt-2 text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" /> Perfil activo
        </span>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Casos publicados', val: '12' },
          { label: 'Adopciones cerradas', val: '8' },
          { label: 'Evidencias subidas', val: '24' },
        ].map(({ label, val }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-neutral-50 text-[10px]">
            <span className="text-neutral-500">{label}</span>
            <span className="font-semibold text-[#161616]">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdoptionChatContext() {
  const steps = [
    { label: 'Interés enviado', done: true },
    { label: 'Visita por coordinar', done: false },
    { label: 'Seguimiento activo', done: false },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-neutral-100 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-100 bg-[#FFF8E9]/60">
        <p className="text-[10px] font-semibold text-[#5B3FFF] uppercase tracking-wider mb-2">Más contexto que un chat suelto</p>
        <div className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-neutral-100">
          <img src={images.adoptionCat.src} alt="Lana" className="w-11 h-11 rounded-xl object-cover object-bottom shrink-0" draggable={false} />
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-[#161616]">Lana</p>
            <p className="text-[10px] text-neutral-500">Hembra · 2 años · Disponible</p>
          </div>
          <span className="ml-auto text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full shrink-0">Ficha fija</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2 min-h-[100px]">
        <div className="flex justify-end">
          <div className="bg-[#161616] text-white text-[11px] px-3 py-2 rounded-2xl rounded-br-md max-w-[80%]">
            Hola, me interesa adoptar a Lana.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-neutral-100 text-[#161616] text-[11px] px-3 py-2 rounded-2xl rounded-bl-md max-w-[80%]">
            Gracias. Te cuento su historia y los pasos.
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
        <ul className="space-y-2">
          {steps.map(({ label, done }) => (
            <li key={label} className="flex items-center gap-2.5 text-[11px]">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                {done && <Check className="w-2.5 h-2.5" />}
              </span>
              <span className={done ? 'text-neutral-700 font-medium' : 'text-neutral-500'}>{label}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-neutral-500 mt-3 leading-relaxed">
          DopMi conserva la ficha, los pasos y el seguimiento del animal en el mismo lugar.
        </p>
      </div>
    </div>
  );
}

export function ShareableProfileCard() {
  return (
    <div className="w-full max-w-[220px] bg-white rounded-[20px] border border-neutral-100 shadow-xl overflow-hidden">
      <div className="h-16 bg-gradient-to-br from-[#5B3FFF]/20 to-[#F6C94A]/20" />
      <div className="px-4 pb-4 -mt-8">
        <div className="w-14 h-14 rounded-full bg-[#F6C94A]/40 border-4 border-white flex items-center justify-center text-sm font-display font-bold text-[#161616] mx-auto mb-2">
          MR
        </div>
        <p className="font-display font-bold text-sm text-center text-[#161616]">María R.</p>
        <p className="text-[9px] text-neutral-500 text-center mb-3">Rescatista · Refugio San Jerónimo</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-neutral-50 rounded-xl p-2 text-center">
            <span className="block font-display font-bold text-sm text-[#161616]">3</span>
            <span className="text-[8px] text-neutral-400 uppercase">Abiertos</span>
          </div>
          <div className="bg-neutral-50 rounded-xl p-2 text-center">
            <span className="block font-display font-bold text-sm text-[#161616]">8</span>
            <span className="text-[8px] text-neutral-400 uppercase">Cierres</span>
          </div>
        </div>

        <button type="button" className="w-full py-2 bg-[#5B3FFF]/10 text-[#5B3FFF] text-[10px] font-bold rounded-xl">
          Compartir perfil
        </button>
      </div>
    </div>
  );
}

export function MonthlyImpactCard({ onAction }: { onAction?: () => void }) {
  return (
    <div className="w-full bg-gradient-to-br from-[#FFF3D6] to-[#FFEAB3] rounded-[32px] p-6 shadow-xl border border-amber-200/50">
      <div className="flex justify-between items-center mb-5">
        <span className="font-display font-bold text-[#161616]">DopMi</span>
        <span className="text-[10px] bg-white/70 text-[#161616] px-2.5 py-0.5 rounded-full font-bold">Este mes</span>
      </div>
      <h3 className="font-display font-bold text-2xl text-[#161616] mb-5">Tu mes en DopMi</h3>
      <ul className="space-y-2.5">
        {[
          { emoji: '🛡️', text: '3 casos recibieron apoyo' },
          { emoji: '🏡', text: '1 adopción inició seguimiento' },
          { emoji: '📄', text: '2 evidencias revisadas' },
        ].map(({ emoji, text }) => (
          <li key={text} className="flex items-center gap-3 bg-white/55 p-3 rounded-2xl border border-white/50">
            <span className="text-base">{emoji}</span>
            <span className="text-sm font-medium text-[#161616]">{text}</span>
          </li>
        ))}
      </ul>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="w-full mt-5 py-3 bg-[#161616] text-white text-sm font-semibold rounded-2xl hover:bg-neutral-800 transition"
          data-event="impact_card_cta_click"
        >
          Ver mi impacto
        </button>
      )}
    </div>
  );
}
