import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANY } from '../../data/company.data';
import { LegalValueComponent } from './legal-value.component';

@Component({
  selector: 'app-mentions-legales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalValueComponent, RouterLink],
  templateUrl: './mentions-legales.component.html',
})
export class MentionsLegalesComponent {
  readonly company = COMPANY;
}
