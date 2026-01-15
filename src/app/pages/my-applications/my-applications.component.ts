import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Application } from '../../models/application.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];

  statusColors: Record<Application['status'], string> = {
    'Brouillon': '#9e9e9e',
    'Soumis': '#1976d2',
    'Pre-analyse': '#388e3c',
    'Documents requis': '#f57c00',
    'Analyse finale': '#7b1fa2',
    'Offre generee': '#0288d1',
    'Signature': '#d32f2f',
    'Accepte': '#388e3c',
    'Refuse': '#d32f2f'
  };

  constructor(
    private mockData: MockDataService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.mockData.applications$.subscribe(apps => {
      this.applications = apps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }

  getStatusColor(status: Application['status']): string {
    return this.statusColors[status] || '#000';
  }

  continueDraft(id: string): void {
    alert('Reprise du dossier non implémentée encore (Étape 3)');
  }

  deleteApplication(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      const apps = this.mockData['applicationsSubject'].value;
      const updated = apps.filter(a => a.id !== id);
      this.mockData['applicationsSubject'].next(updated);
      localStorage.setItem('applications', JSON.stringify(updated));
      this.applications = updated;
    }
  }
}
