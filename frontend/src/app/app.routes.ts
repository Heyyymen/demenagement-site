import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'REFLEX DÉMÉNAGEMENT - La passion du service' },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./pages/legal/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
    title: 'Mentions légales - REFLEX DÉMÉNAGEMENT',
  },
  {
    path: 'politique-de-confidentialite',
    loadComponent: () =>
      import('./pages/legal/politique-confidentialite.component').then((m) => m.PolitiqueConfidentialiteComponent),
    title: 'Politique de confidentialité - REFLEX DÉMÉNAGEMENT',
  },
  { path: '**', redirectTo: '' },
];
