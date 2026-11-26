import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);
  readonly isMenuOpen = signal(false);
  readonly isDarkMode = this.themeService.isDarkMode;

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    this.isMenuOpen.set(false);
  }
}
