import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { ApplicationStatus } from '../../models/application.model';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss']
})
export class DashboardAnalyticsComponent implements OnInit {
  totalDossiers = 0;
  brouillons = 0;
  soumis = 0;
  acceptes = 0;
  refuses = 0;
  derniereActivite: Date | null = null;

  chartData: { status: ApplicationStatus; label: string; count: number; percent: number }[] = [];

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
      this.totalDossiers = apps.length;
      this.brouillons = apps.filter(a => a.status === 'Brouillon').length;
      this.soumis = apps.filter(a => a.status === 'Soumis').length;
      this.acceptes = apps.filter(a => a.status === 'Accepte').length;
      this.refuses = apps.filter(a => a.status === 'Refuse').length;
      this.derniereActivite = apps.length > 0 ? apps[0].createdAt : null;

      const counts = apps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<ApplicationStatus, number>);

      const total = apps.length;
      this.chartData = Object.entries(counts).map(([status, count]) => ({
        status: status as ApplicationStatus,
        label: status,
        count,
        percent: total > 0 ? (count / total) * 100 : 0
      }));
    });
  }

  getStatusColor(status: ApplicationStatus): string {
    return this.statusColors[status] || '#9e9e9e';
  }
}