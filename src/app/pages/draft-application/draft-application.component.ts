import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { Application, UploadedFile } from '../../models/application.model';

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

  uploadedFiles: UploadedFile[] = [];
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  maxFileSize = 5 * 1024 * 1024; // 5 Mo

  @ViewChild('fileInput') fileInput!: ElementRef;

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

  calculateMensualite(): number {
  const prixBien = this.applicationForm.get('prixBien')?.value || 0;
  const apport = this.applicationForm.get('apport')?.value || 0;
  const duree = this.applicationForm.get('duree')?.value || 0;

  const montantEmprunte = prixBien - apport;
  if (montantEmprunte <= 0 || duree <= 0) return 0;

  const tauxAnnuel = 0.05;
  const tauxMensuel = tauxAnnuel / 12;
  const nbMensualites = duree * 12;

  const numerateur = montantEmprunte * tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites);
  const denominateur = Math.pow(1 + tauxMensuel, nbMensualites) - 1;
  const mensualite = numerateur / denominateur;

  return isNaN(mensualite) ? 0 : mensualite;
}

getMensualiteFormatted(): string {
  const m = this.calculateMensualite();
  return m > 0 ? `${m.toFixed(2)} DH/mois` : '—';
}

getCoutTotalCred(): string {
  const m = this.calculateMensualite();
  const duree = this.applicationForm.get('duree')?.value || 0;
  const total = m * duree * 12;
  return total > 0 ? `${total.toLocaleString('fr-FR')} DH` : '—';
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
      this.uploadedFiles = app.documents || [];
    } else {
      alert('Dossier non trouvé ou déjà soumis.');
      this.router.navigate(['/mes-dossiers']);
    }
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  if (!this.allowedTypes.includes(file.type)) {
    alert('Type de fichier non autorisé. Seuls JPG, PNG et PDF sont acceptés.');
    return;
  }
  if (file.size > this.maxFileSize) {
    alert('Fichier trop volumineux (max 5 Mo).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    if (!base64.startsWith('data:')) {
      console.error('Base64 invalide');
      return;
    }
    const newFile: UploadedFile = {
      name: file.name,
      type: this.guessDocumentType(file.name),
      url: base64,
      size: file.size
    };
    this.uploadedFiles.push(newFile);
    this.applicationForm.markAsDirty();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

  private guessDocumentType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('cin') || lower.includes('identite')) return 'cin';
    if (lower.includes('facture') || lower.includes('revenu')) return 'revenu';
    if (lower.includes('promesse') || lower.includes('vente')) return 'promesse';
    return 'autre';
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'cin': return 'badge';
      case 'revenu': return 'receipt';
      case 'promesse': return 'home';
      default: return 'description';
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
      documents: this.uploadedFiles,
      createdAt: existingApp?.createdAt || now
    };
  }
}
