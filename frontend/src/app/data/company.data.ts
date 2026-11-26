import type { IconName } from '../components/icon/icon.component';

/**
 * Informations légales et de contact de l'entreprise — source unique.
 * Utilisées par les mentions légales, la politique de confidentialité, le footer et les données structurées.
 *
 * ⚠️ Les champs à `null` DOIVENT être complétés avant la mise en production
 * (ils s'affichent en « [À compléter] » sur les pages légales).
 */
export interface CompanyInfo {
  brand: string;
  legalName: string | null;
  legalForm: string | null;
  capital: string | null;
  address: string | null;
  siret: string | null;
  rcs: string | null;
  vat: string | null;
  transportRegistry: string | null;
  publicationDirector: string | null;
  insurance: string | null;
  mediator: { name: string; website: string } | null;
  phone: { display: string; href: string };
  email: string;
  hours: string;
  area: string;
  website: string;
  social: { name: string; url: string; icon: IconName }[];
}

export const COMPANY: CompanyInfo = {
  brand: 'REFLEX DÉMÉNAGEMENT',
  legalName: null, // ex. « WASRY REFLEX DÉMÉNAGEMENT »
  legalForm: null, // ex. « SAS », « SARL », « EI »
  capital: null, // ex. « 1 000 € » (sauf entreprise individuelle)
  address: null, // adresse du siège social
  siret: null, // 14 chiffres
  rcs: null, // ex. « RCS Paris 123 456 789 »
  vat: null, // n° TVA intracommunautaire, ex. « FR12 123456789 »
  transportRegistry: null, // n° d'inscription au registre des transporteurs (DREAL)
  publicationDirector: null, // nom du gérant / président
  insurance: null, // assureur RC professionnelle + zone couverte
  mediator: null, // médiateur de la consommation : { name, website }
  phone: { display: '01 70 24 08 60', href: 'tel:+33170240860' },
  email: 'reflexdemenagement@gmail.com',
  hours: 'Du lundi au samedi, 8h00 – 20h00',
  area: 'Paris, Île-de-France, toute la France et international',
  website: 'https://reflexdemenagement.fr',
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/wasryreflex/', icon: 'instagram' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@wasry.reflex.dmna', icon: 'tiktok' },
  ],
};
