import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Application } from '../../models/application.model';
import { WorkflowTimelineComponent } from '../../shared/workflow-timeline/workflow-timeline.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    WorkflowTimelineComponent
  ],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {
  application: Application | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockData: MockDataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.application = this.mockData.getApplicationById(id);
      if (!this.application) {
        alert('Dossier non trouvé.');
        this.router.navigate(['/mes-dossiers']);
      }
    });
  }

  editApplication(): void {
    if (this.application && this.application.status === 'Brouillon') {
      this.router.navigate(['/nouvelle-demande', this.application.id]);
    }
  }

  deleteApplication(): void {
    if (this.application && confirm('Supprimer ce dossier ?')) {
      this.mockData.deleteApplication(this.application.id!);
      this.router.navigate(['/mes-dossiers']);
    }
  }

  exportToPDF(): void {
    alert('Fonctionnalité d\'export PDF simulée.\nDans une vraie app, cela générerait un PDF signé.');
  }
}
