import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkMode = new BehaviorSubject<boolean>(false);
    isDarkMode$ = this.darkMode.asObservable();

    constructor() {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setDarkMode(true);
        }
    }

    toggleTheme() {
        this.setDarkMode(!this.darkMode.value);
    }

    private setDarkMode(isDark: boolean) {
        this.darkMode.next(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
}
