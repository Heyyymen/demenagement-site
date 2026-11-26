import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SERVICES } from '../../data/services.data';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class ServicesComponent {
  readonly services = SERVICES;
}
