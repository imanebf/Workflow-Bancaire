import { Injectable, inject } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;
  private overlayContainer = inject(OverlayContainer);

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('darkMode', this.isDarkMode.toString());
    }
  }

  private updateTheme(): void {
    if (typeof document === 'undefined') return;

    const container = document.body;
    const overlay = this.overlayContainer.getContainerElement();

    if (this.isDarkMode) {
      container.classList.add('dark-theme');
      overlay.classList.add('dark-theme');
    } else {
      container.classList.remove('dark-theme');
      overlay.classList.remove('dark-theme');
    }
  }

  private loadTheme(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      this.isDarkMode = saved === 'true';
    }
    setTimeout(() => this.updateTheme(), 0);
  }

  isDark(): boolean {
    return this.isDarkMode;
  }
}
