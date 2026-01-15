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
    const saved = localStorage.getItem('applications');
    if (saved) {
      try {
        const apps = JSON.parse(saved);
        apps.forEach((a: any) => a.createdAt = new Date(a.createdAt));
        this.applicationsSubject.next(apps);
      } catch {
        this.applicationsSubject.next([]);
      }
    }
  }

  saveApplication(app: Application): void {
    const apps = this.applicationsSubject.value;
    if (!app.id) {
      app.id = this.generateId();
      app.reference = 'REF-' + app.id.slice(0, 6).toUpperCase();
      app.createdAt = new Date();
    }
    const updated = [...apps.filter(a => a.id !== app.id), app];
    this.applicationsSubject.next(updated);
    localStorage.setItem('applications', JSON.stringify(updated));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
}
