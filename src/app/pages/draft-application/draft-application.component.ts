import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { Application } from '../../models/application.model';

@Component({
  selector: 'app-draft-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './draft-application.component.html',
  styleUrls: ['./draft-application.component.scss']
})
export class DraftApplicationComponent implements OnInit {
  applicationForm!: FormGroup;
  typesBien = ['Appartement', 'Maison', 'Terrain', 'Local commercial'];
  loadedApplicationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mockData: MockDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadApplication(id);
      }
    });
  }

  private initForm(): void {
    this.applicationForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      cin: ['', [Validators.required, Validators.pattern(/^[A-Z]{1,2}\d{5,7}$/)]],
      telephone: ['', [Validators.required, Validators.pattern(/^0[5-7]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],

      revenusMensuels: [0, [Validators.required, Validators.min(1000)]],
      chargesMensuelles: [0, [Validators.required, Validators.min(0)]],

      prixBien: [0, [Validators.required, Validators.min(100000)]],
      apport: [0, [Validators.required, Validators.min(0)]],
      duree: [20, [Validators.required, Validators.min(5), Validators.max(30)]],
      typeBien: ['Appartement', Validators.required]
    });
  }

  private loadApplication(id: string): void {
    const app = this.mockData.getApplicationById(id);
    if (app && app.status === 'Brouillon') {
      this.loadedApplicationId = id;
      this.applicationForm.patchValue({
        nom: app.applicant.nom,
        cin: app.applicant.cin,
        telephone: app.applicant.telephone,
        email: app.applicant.email,

        revenusMensuels: app.finances.revenusMensuels,
        chargesMensuelles: app.finances.chargesMensuelles,

        prixBien: app.loan.prixBien,
        apport: app.loan.apport,
        duree: app.loan.duree,
        typeBien: app.loan.typeBien
      });
    } else {
      alert('Dossier non trouvé ou déjà soumis.');
      this.router.navigate(['/mes-dossiers']);
    }
  }

  onSaveAsDraft(): void {
    if (this.applicationForm.valid) {
      const app: Application = this.buildApplication('Brouillon');
      this.mockData.saveApplication(app);
      alert('Brouillon enregistré avec succès !');
    }
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      const app: Application = this.buildApplication('Soumis');
      this.mockData.saveApplication(app);
      alert('Demande soumise avec succès !');
      this.router.navigate(['/mes-dossiers']);
    }
  }

  private buildApplication(status: Application['status']): Application {
    const now = new Date();
    const existingApp = this.loadedApplicationId
      ? this.mockData.getApplicationById(this.loadedApplicationId)
      : null;

    return {
      id: this.loadedApplicationId || undefined,
      applicant: {
        nom: this.applicationForm.value.nom,
        cin: this.applicationForm.value.cin,
        telephone: this.applicationForm.value.telephone,
        email: this.applicationForm.value.email
      },
      finances: {
        revenusMensuels: this.applicationForm.value.revenusMensuels,
        chargesMensuelles: this.applicationForm.value.chargesMensuelles
      },
      loan: {
        prixBien: this.applicationForm.value.prixBien,
        apport: this.applicationForm.value.apport,
        duree: this.applicationForm.value.duree,
        typeBien: this.applicationForm.value.typeBien
      },
      status,
      createdAt: existingApp?.createdAt || now
    };
  }
}
