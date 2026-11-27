import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { COMPANY } from '../../data/company.data';
import { MONTE_MEUBLE_ID } from '../../data/services.data';
import { DevisPrefillService } from '../../services/devis-prefill.service';
import { SectionNavService } from '../../services/section-nav.service';

/** Mise en avant de la location de monte-meuble (possible sans déménagement). */
@Component({
  selector: 'app-monte-meuble',
  templateUrl: './monte-meuble.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class MonteMeubleComponent {
  private readonly prefill = inject(DevisPrefillService);
  private readonly sectionNav = inject(SectionNavService);

  readonly phone = COMPANY.phone;

  readonly points = [
    {
      title: 'Location seule ou avec votre déménagement',
      text: 'Canapé trop large pour l’escalier, électroménager en étage sans ascenseur, travaux, livraison…',
    },
    {
      title: 'Autorisation de stationnement gérée',
      text: 'Nous faisons les démarches auprès de la mairie. Les frais de voirie dépendent de la commune.',
    },
    {
      title: 'Particuliers et professionnels',
      text: 'Paris et toute l’Île-de-France, en semaine comme le samedi.',
    },
  ];

  demanderDevis(event: Event): void {
    this.prefill.select(MONTE_MEUBLE_ID);
    this.sectionNav.goTo('contact', event);
  }
}
