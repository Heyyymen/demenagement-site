import type { IconName } from '../components/icon/icon.component';

/**
 * Source unique des services proposés.
 * Utilisée par la section « Nos Services », le formulaire de devis et le footer.
 * ⚠️ Les `id` doivent rester alignés avec SERVICE_LABELS dans netlify/functions/devis.mjs.
 */
export interface ServiceItem {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  features: string[];
}

export const SERVICES: readonly ServiceItem[] = [
  {
    id: 'residentiel',
    icon: 'home',
    title: 'Déménagement Résidentiel',
    description: 'Déménagement complet de votre domicile avec emballage professionnel et transport sécurisé.',
    features: ['Emballage et déballage', 'Démontage/remontage meubles', 'Protection des biens'],
  },
  {
    id: 'entreprise',
    icon: 'building',
    title: 'Déménagement Professionnel',
    description: 'Transfert de bureaux et locaux commerciaux avec planification sur mesure.',
    features: ['Déménagement week-end', 'Installation informatique', 'Archives et documents', 'Mobilier professionnel'],
  },
  {
    id: 'international',
    icon: 'globe-europe',
    title: 'Déménagement International',
    description: "Déménagement vers l'étranger avec gestion complète des formalités.",
    features: ['Formalités douanières', 'Emballage maritime', 'Assurance internationale'],
  },
  {
    id: 'garde-meuble',
    icon: 'warehouse',
    title: 'Garde-Meuble',
    description: 'Solutions de stockage sécurisées pour vos biens pendant la transition.',
    features: ['Stockage climatisé', 'Accès flexible', 'Inventaire détaillé'],
  },
  {
    id: 'monte-meuble',
    icon: 'elevator',
    title: 'Location de Monte-Meuble',
    description:
      "Montée et descente de vos meubles par la fenêtre ou le balcon, quand l'escalier ou l'ascenseur ne suffit pas.",
    features: ['Passage par fenêtre ou balcon', 'Meubles lourds et volumineux', 'Gain de temps et sécurité'],
  },
  {
    id: 'complementaires',
    icon: 'hands-helping',
    title: 'Services Complémentaires',
    description: 'Services additionnels pour un déménagement clé en main.',
    features: ['Nettoyage pré/post', 'Raccordements', 'Aide administrative'],
  },
  {
    id: 'express',
    icon: 'clock',
    title: 'Déménagement Express',
    description: "Service d'urgence pour les déménagements de dernière minute.",
    features: ['Intervention rapide', 'Équipe dédiée', 'Matériel spécialisé', 'Planning flexible'],
  },
];
