import { Component } from '@angular/core';

interface Testimonial {
  author: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      author: 'Karine Mazloumian',
      location: 'Paris',
      rating: 5,
      text: 'J\'ai choisi Wasry Reflex Déménagement après les avoir vus déménager des voisins. J\'avais déjà remarqué leur sérieux et les précautions prises. Et j\'ai été ravie de leur service pour mon propre déménagement : une équipe efficace, soigneuse et hyper sympathique. Leur formule Luxe, d\'un bon rapport qualité/prix, m\'a donné toute satisfaction.',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'Nicolas Katz',
      location: 'Paris 17ème',
      rating: 5,
      text: 'Expérience parfaite de notre côté pour notre déménagement de juillet 2025 à Paris 17. Une équipe expérimentée, professionnelle, efficace et sympathique! Un grand merci en particulier à Sofiane pour son professionnalisme, son énergie et sa très grande gentillesse.',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'Flo From Paris',
      location: 'Paris',
      rating: 5,
      text: 'Prestation efficace et de grande qualité. J\'avais choisi l\'option Emballage : Aucune casse. Tout a été très bien protégé. En plus d\'être très professionnelle, l\'équipe est charmante et travaille dans la bonne humeur. Merci à M. SISABER et à toute l\'équipe !',
      service: 'Déménagement avec emballage'
    },
    {
      author: 'Florence De La Mardière',
      location: 'Île-de-France',
      rating: 5,
      text: 'Entreprise très sérieuse. Personnels prévenants, ponctuels, soigneux, aimables et très professionnels. Pas de mauvaises surprises. Prix final correspondant au prix du devis. Je recommande!',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'James Davies',
      location: 'Paris',
      rating: 5,
      text: 'Je n\'imagine pas comment mon déménagement aurait pu se passer mieux. Deuxième fois que j\'utilise cette équipe et deuxième fois je suis époustouflé par leur professionnalisme, leur efficacité et leur attention à mes objets.',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'Mélanie',
      location: 'Île-de-France',
      rating: 5,
      text: 'Une équipe très pro, soigneuse et efficace (60m3 de déménagement). Ponctuel, bien organisé et très sympathique. Bon rapport qualité/prix. Nous recommandons !',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'Alexandre Jaunez',
      location: 'Paris',
      rating: 5,
      text: 'Nous avons fait appel à Reflex Déménagement pour déménager 40 m3 très sereinement, avec des objets fragiles et des gros meubles. Très prévenants, nous avons été très satisfaits d\'un déménagement réalisé rapidement et sans casse, avec une équipe aussi sympathique que professionnelle.',
      service: 'Déménagement résidentiel'
    },
    {
      author: 'Bruno Delourme',
      location: 'Île-de-France',
      rating: 5,
      text: 'Je prends rarement le temps d\'écrire des commentaires sur internet et de mettre une note aussi élevée. Mais l\'équipe de déménageurs a été, selon moi, parfaite. Equipe organisée, ponctuelle, rassurante, souriante, et bienveillante. Un grand merci Sofiane !',
      service: 'Déménagement résidentiel'
    }
  ];

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
