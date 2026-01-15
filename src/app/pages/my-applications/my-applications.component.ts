import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Application, ApplicationStatus } from '../../models/application.model';
import { WorkflowTimelineComponent } from '../../shared/workflow-timeline/workflow-timeline.component';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    WorkflowTimelineComponent
  ],
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];

  statusColors: Record<ApplicationStatus, string> = {
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

  getStatusColor(status: ApplicationStatus): string {
    return this.statusColors[status] || '#9e9e9e';
  }

  continueDraft(id: string): void {
    this.router.navigate(['/nouvelle-demande', id]);
  }

  deleteApplication(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      this.mockData.deleteApplication(id);
    }
  }
}
