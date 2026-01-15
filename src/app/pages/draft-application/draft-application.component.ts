import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private mockData: MockDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.applicationForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      cin: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
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
   return {
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
     createdAt: now
   };
 }
}
