import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SectionNavService } from '../../services/section-nav.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly sectionNav = inject(SectionNavService);

  scrollToContact(): void {
    this.sectionNav.goTo('contact');
  }
}
