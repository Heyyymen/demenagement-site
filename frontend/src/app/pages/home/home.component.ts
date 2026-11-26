import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { AboutComponent } from '../../components/about/about.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactComponent } from '../../components/contact/contact.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroComponent, ServicesComponent, AboutComponent, TestimonialsComponent, ContactComponent],
  template: `
    <app-hero />
    <app-services />
    <app-about />
    <app-testimonials />
    <app-contact />
  `,
})
export class HomeComponent {}
