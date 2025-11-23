import { Component } from '@angular/core';

interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  services: Service[] = [
    {
      icon: 'fas fa-home',
      title: 'Déménagement Résidentiel',
      description: 'Déménagement complet de votre domicile avec emballage professionnel et transport sécurisé.',
      features: [
        'Emballage et déballage',
        'Démontage/remontage meubles',
        'Protection des biens',
      ]
    },
    {
      icon: 'fas fa-building',
      title: 'Déménagement Professionnel',
      description: 'Transfert de bureaux et locaux commerciaux avec planification sur mesure.',
      features: [
        'Déménagement week-end',
        'Installation informatique',
        'Archives et documents',
        'Mobilier professionnel'
      ]
    },
    {
      icon: 'fas fa-globe-europe',
      title: 'Déménagement International',
      description: 'Déménagement vers l\'étranger avec gestion complète des formalités.',
      features: [
        'Formalités douanières',
        'Emballage maritime',
        'Assurance internationale',
      ]
    },
    {
      icon: 'fas fa-warehouse',
      title: 'Garde-Meuble',
      description: 'Solutions de stockage sécurisées pour vos biens pendant la transition.',
      features: [
        'Stockage climatisé',
        'Accès flexible',
        'Inventaire détaillé'
      ]
    },
    {
      icon: 'fas fa-hands-helping',
      title: 'Services Complémentaires',
      description: 'Services additionnels pour un déménagement clé en main.',
      features: [
        'Nettoyage pre/post',
        'Raccordements',
        'Aide administrative'
      ]
    },
    {
      icon: 'fas fa-clock',
      title: 'Déménagement Express',
      description: 'Service d\'urgence pour les déménagements de dernière minute.',
      features: [
        'Intervention rapide',
        'Équipe dédiée',
        'Matériel spécialisé',
        'Planning flexible'
      ]
    }
  ];
}
