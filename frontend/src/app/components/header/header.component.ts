import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ThemeService } from '../../services/theme.service';
import { SectionNavService } from '../../services/section-nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeMenu()' },
  imports: [IconComponent],
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);
  private readonly sectionNav = inject(SectionNavService);
  readonly isMenuOpen = signal(false);
  readonly isDarkMode = this.themeService.isDarkMode;

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  scrollToSection(sectionId: string, event: Event): void {
    this.sectionNav.goTo(sectionId, event);
    this.isMenuOpen.set(false);
  }
}
