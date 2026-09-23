import { DonationCase, TrustPillar } from './types';
import { images } from './lib/images';

export const donationCases: DonationCase[] = [
  {
    id: "case-1",
    petName: "Milo",
    category: "Medicina",
    itemTitle: "Spray para herida",
    currentAmount: 180,
    targetAmount: 260,
    isCompleted: false,
    status: "Urgente",
    lastUpdate: "Hace 2 días",
    rescuerName: "Refugio San Jerónimo",
    imageUrl: images.screenLana.src,
    description: "Spray antiséptico para sanar raspaduras tras rescate."
  },
  {
    id: "case-2",
    petName: "Nina",
    category: "Alimento",
    itemTitle: "Comida húmeda para gatita",
    currentAmount: 90,
    targetAmount: 320,
    isCompleted: false,
    status: "Activo",
    lastUpdate: "Evidencia recibida",
    rescuerName: "Gatitos MTY",
    imageUrl: images.caseNina.src,
    description: "Latas húmedas y croquetas de destete para gatita de un mes."
  },
  {
    id: "case-3",
    petName: "Rocky",
    category: "Consulta",
    itemTitle: "Revisión veterinaria",
    currentAmount: 450,
    targetAmount: 450,
    isCompleted: true,
    status: "Completado",
    lastUpdate: "Consulta cubierta",
    rescuerName: "Fundación Patitas",
    imageUrl: images.caseRockyPhoto.src,
    description: "Valoración y desparasitación inicial completadas."
  }
];

export const trustPillars: TrustPillar[] = [
  {
    id: "01",
    title: "Quién publica",
    description: "Más revisión cuando una publicación pide fondos."
  },
  {
    id: "02",
    title: "Qué se publica",
    description: "Mascotas reales antes de aparecer en la app."
  },
  {
    id: "03",
    title: "Qué necesita",
    description: "Alimento, medicina, consulta o traslado separados por caso."
  },
  {
    id: "04",
    title: "Qué pasó después",
    description: "Avances, recibos o cierres cuando el caso lo requiere."
  }
];
