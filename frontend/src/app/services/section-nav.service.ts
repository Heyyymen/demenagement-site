import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Navigation vers une section de la page d'accueil, depuis n'importe quelle page. */
@Injectable({ providedIn: 'root' })
export class SectionNavService {
  private readonly router = inject(Router);

  goTo(sectionId: string, event?: Event): void {
    event?.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', `/#${sectionId}`);
    } else {
      // Autre page (ex. mentions légales) : retour à l'accueil, puis défilement via anchorScrolling.
      void this.router.navigate(['/'], { fragment: sectionId });
    }
  }
}
