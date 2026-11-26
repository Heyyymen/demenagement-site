import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../data/company.data';
import { SERVICES } from '../../data/services.data';
import { SectionNavService } from '../../services/section-nav.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class FooterComponent {
  private readonly sectionNav = inject(SectionNavService);
  readonly company = COMPANY;
  readonly services = SERVICES;
  readonly currentYear = new Date().getFullYear();
  readonly navLinks = [
    { id: 'hero', label: 'Accueil' },
    { id: 'services', label: 'Nos Services' },
    { id: 'about', label: 'À Propos' },
    { id: 'testimonials', label: 'Témoignages' },
    { id: 'contact', label: 'Contact' },
  ];

  goTo(sectionId: string, event: Event): void {
    this.sectionNav.goTo(sectionId, event);
  }
}
