import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkMode = signal(false);
  readonly isDarkMode = this.darkMode.asReadonly();

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.setDarkMode(true);
    }
  }

  toggleTheme(): void {
    this.setDarkMode(!this.darkMode());
  }

  private setDarkMode(isDark: boolean): void {
    this.darkMode.set(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
