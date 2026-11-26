import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class AboutComponent {
  readonly values: { icon: IconName; title: string; description: string }[] = [
    {
      icon: 'handshake',
      title: 'Confiance',
      description: 'Nous bâtissons des relations durables basées sur la confiance mutuelle.',
    },
    {
      icon: 'award',
      title: 'Excellence',
      description: "Nous visons l'excellence dans chaque aspect de notre service.",
    },
    {
      icon: 'heart',
      title: 'Bienveillance',
      description: 'Nous traitons vos biens avec le même soin que les nôtres.',
    },
    {
      icon: 'users',
      title: 'Équipe',
      description: 'Une équipe expérimentée et passionnée à votre service.',
    },
  ];
}
