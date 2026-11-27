import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../data/company.data';
import { LegalValueComponent } from './legal-value.component';

@Component({
  selector: 'app-politique-confidentialite',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalValueComponent, RouterLink],
  templateUrl: './politique-confidentialite.component.html',
})
export class PolitiqueConfidentialiteComponent {
  readonly company = COMPANY;
}
