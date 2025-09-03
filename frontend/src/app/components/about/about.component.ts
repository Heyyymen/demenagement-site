import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  values = [
    {
      icon: 'fas fa-handshake',
      title: 'Confiance',
      description: 'Nous bâtissons des relations durables basées sur la confiance mutuelle.'
    },
    {
      icon: 'fas fa-award',
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque aspect de notre service.'
    },
    {
      icon: 'fas fa-heart',
      title: 'Bienveillance',
      description: 'Nous traitons vos biens avec le même soin que les nôtres.'
    },
    {
      icon: 'fas fa-users',
      title: 'Équipe',
      description: 'Une équipe expérimentée et passionnée à votre service.'
    }
  ];
}
