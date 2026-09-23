export enum PetStatus {
  Adoptable = "Adoptable",
  Adopted = "Adopted",
  InTreatment = "En tratamiento",
}

export interface Pet {
  id: string;
  name: string;
  age: string;
  size: 'Chico' | 'Mediano' | 'Grande';
  breed: string;
  gender: 'Macho' | 'Hembra';
  location: string;
  rescuerName: string;
  isVerifiedRescuer: boolean;
  imageUrl: string;
  story: string;
  badgeText: string;
  likesCount: number;
}

export interface DonationCase {
  id: string;
  petName: string;
  category: 'Medicina' | 'Alimento' | 'Consulta' | 'Urgencia';
  itemTitle: string;
  currentAmount: number;
  targetAmount: number;
  isCompleted: boolean;
  status: 'Urgente' | 'Activo' | 'Completado';
  lastUpdate: string;
  rescuerName: string;
  imageUrl: string;
  description: string;
  ctaText?: string;
}

export interface TrustPillar {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface GuardianBenefit {
  id: string;
  title: string;
  description: string;
}
