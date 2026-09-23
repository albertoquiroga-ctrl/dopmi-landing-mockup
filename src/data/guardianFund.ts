/** Demo editable — conectar a backend cuando exista fuente real */
export const guardianFundData = {
  availableFund: 24500,
  currency: 'MXN',
  reserveSegments: [
    { label: 'Reserva operativa', pct: 45, color: 'bg-[#F6C94A]' },
    { label: 'Buffer', pct: 30, color: 'bg-[#E8B84A]' },
    { label: 'Excedente asignable', pct: 25, color: 'bg-[#FFF3D6]' },
  ],
  lastResponseTime: '47 min',
  reportedImpact: '12 casos',
  recentClosures: [
    'Consulta cubierta',
    'Traslado realizado',
    'Tratamiento iniciado',
  ],
} as const;
