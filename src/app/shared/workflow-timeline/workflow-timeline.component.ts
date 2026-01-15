import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationStatus, WORKFLOW_STEPS } from '../../models/application.model';

@Component({
  selector: 'app-workflow-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './workflow-timeline.component.html',
  styleUrls: ['./workflow-timeline.component.scss']
})
export class WorkflowTimelineComponent {
  @Input() currentStatus!: ApplicationStatus;

  protected readonly steps = WORKFLOW_STEPS;
  protected readonly statuses = WORKFLOW_STEPS.map(s => s.status);

  isCompleted(status: ApplicationStatus): boolean {
    return this.statuses.indexOf(status) < this.statuses.indexOf(this.currentStatus);
  }

  isActive(status: ApplicationStatus): boolean {
    return status === this.currentStatus;
  }

  isFuture(status: ApplicationStatus): boolean {
    return this.statuses.indexOf(status) > this.statuses.indexOf(this.currentStatus);
  }

  trackByStatus(index: number, step: { status: ApplicationStatus }): string {
    return step.status;
  }
}
