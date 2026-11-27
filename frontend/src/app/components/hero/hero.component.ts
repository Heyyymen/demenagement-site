import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SectionNavService } from '../../services/section-nav.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class HeroComponent {
  private readonly sectionNav = inject(SectionNavService);

  goTo(sectionId: string, event: Event): void {
    this.sectionNav.goTo(sectionId, event);
  }

  scrollToContact(): void {
    this.sectionNav.goTo('contact');
  }
}
