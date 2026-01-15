import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private applicationsSubject = new BehaviorSubject<Application[]>([]);
  applications$ = this.applicationsSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('applications');
      if (saved) {
        try {
          const apps: Application[] = JSON.parse(saved).map((app: any) => ({
            ...app,
            createdAt: new Date(app.createdAt)
          }));
          this.applicationsSubject.next(apps);
        } catch (e) {
          console.warn('Failed to parse applications from localStorage', e);
          this.applicationsSubject.next([]);
        }
      }
    }
  }

  getApplicationById(id: string): Application | undefined {
    return this.applicationsSubject.value.find(a => a.id === id);
  }

  saveApplication(app: Application): void {
    const apps = this.applicationsSubject.value;
    if (!app.id) {
      app.id = this.generateId();
      app.reference = 'REF-' + app.id.slice(0, 6).toUpperCase();
    }
    app.createdAt = app.createdAt || new Date();
    const updated = [...apps.filter(a => a.id !== app.id), app];
    this.applicationsSubject.next(updated);
    this.saveToLocalStorage(updated);
  }

  deleteApplication(id: string): void {
    const updated = this.applicationsSubject.value.filter(a => a.id !== id);
    this.applicationsSubject.next(updated);
    this.saveToLocalStorage(updated);
  }

  private saveToLocalStorage(applications: Application[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('applications', JSON.stringify(applications));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
}
