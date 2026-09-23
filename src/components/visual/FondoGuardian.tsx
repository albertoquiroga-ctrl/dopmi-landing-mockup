import React from 'react';
import { Clock, Shield, TrendingUp } from 'lucide-react';
import { guardianFundData } from '../../data/guardianFund';

export default function FondoGuardian() {
  const { availableFund, currency, reserveSegments, lastResponseTime, reportedImpact, recentClosures } = guardianFundData;

  return (
    <div className="w-full max-w-[400px] bg-neutral-900/90 border border-white/10 rounded-[28px] p-6 md:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/8">
        <div className="w-8 h-8 rounded-xl bg-[#F6C94A]/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#F6C94A]" />
        </div>
        <span className="text-sm font-semibold text-neutral-400">Fondo Guardián</span>
      </div>

      <div className="mb-7">
        <p className="text-[11px] text-[#F6C94A] uppercase tracking-wider font-bold mb-1.5">Fondo disponible</p>
        <p className="font-display font-bold text-4xl md:text-[44px] text-white tracking-tight leading-none">
          ${availableFund.toLocaleString('es-MX')}{' '}
          <span className="text-base text-neutral-400 font-sans font-medium">{currency}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-[20px] bg-white/6 border border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F6C94A]" />
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">Última urgencia</p>
          </div>
          <p className="font-display font-bold text-2xl text-white leading-tight">{lastResponseTime}</p>
        </div>
        <div className="rounded-[20px] bg-white/6 border border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">Impacto reportado</p>
          </div>
          <p className="font-display font-bold text-2xl text-white leading-tight">{reportedImpact}</p>
        </div>
      </div>

      <div className="mb-5 opacity-80">
        <div className="flex h-2 rounded-full overflow-hidden bg-neutral-800 gap-px">
          {reserveSegments.map(({ label, pct, color }) => (
            <div key={label} className={`${color} h-full`} style={{ width: `${pct}%` }} title={label} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {reserveSegments.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span className="text-[9px] text-neutral-500">{label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5 opacity-70">
        {recentClosures.slice(0, 2).map((item) => (
          <li key={item} className="flex items-center gap-2 text-[10px] text-neutral-400 px-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400/70 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
