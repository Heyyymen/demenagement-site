import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const SITE_URL = 'https://reflexdemenagement.fr';
const DEFAULT_DESCRIPTION =
  "REFLEX DÉMÉNAGEMENT - Déménagement en Île-de-France, en France et à l'international, et location de monte-meuble avec ou sans déménagement. Devis gratuit et rapide.";

/** Met à jour l'URL canonique et la meta description à chaque navigation (données `description` des routes). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  init(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let route = this.route;
      while (route.firstChild) route = route.firstChild;
      const description = (route.snapshot.data['description'] as string | undefined) ?? DEFAULT_DESCRIPTION;
      const path = this.router.url.split(/[?#]/)[0];
      const url = SITE_URL + (path === '/' ? '/' : path);

      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:title', content: route.snapshot.title ?? this.document.title });
      this.document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    });
  }
}
