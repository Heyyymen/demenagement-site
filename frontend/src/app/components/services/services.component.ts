import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SERVICES } from '../../data/services.data';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  readonly services = SERVICES;
}
