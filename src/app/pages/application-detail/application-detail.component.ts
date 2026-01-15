import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Application, ApplicationStatus } from '../../models/application.model';
import { WorkflowTimelineComponent } from '../../shared/workflow-timeline/workflow-timeline.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  getFileIcon(type: string): string {
    switch (type) {
      case 'cin': return 'badge';
      case 'revenu': return 'receipt';
      case 'promesse': return 'home';
      default: return 'description';
    }
  }

  viewDocument(base64: string): void {
    if (!base64.startsWith('')) {
      console.error('Invalid base64 format:', base64);
      alert('Impossible d’afficher ce document.');
      return;
    }
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const blobUrl = URL.createObjectURL(blob);

    const win = window.open(blobUrl, '_blank');
    if (!win) {
      alert('Veuillez autoriser les popups pour afficher les documents.');
    }
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

  advanceStatus(): void {
    if (!this.application) return;

    const allStatuses: ApplicationStatus[] = [
      'Brouillon',
      'Soumis',
      'Pre-analyse',
      'Documents requis',
      'Analyse finale',
      'Offre generee',
      'Signature',
      'Accepte'
    ];

    const currentIndex = allStatuses.indexOf(this.application.status);
    if (currentIndex < allStatuses.length - 1) {
      const newStatus = allStatuses[currentIndex + 1];
      this.application.status = newStatus;
      this.mockData.saveApplication(this.application);
      alert(`Dossier avancé à l'étape : ${newStatus}`);
    }
  }

  refuseApplication(): void {
    if (!this.application) return;
    if (confirm('Confirmer le refus de ce dossier ?')) {
      this.application.status = 'Refuse';
      this.mockData.saveApplication(this.application);
      alert('Dossier refusé.');
    }
  }

  async exportToPDF(): Promise<void> {
    if (!this.application) return;

    const today = new Date().toLocaleDateString('fr-FR');
    const emprunt = this.application.loan.prixBien - this.application.loan.apport;
    const capacite = this.application.finances.revenusMensuels - this.application.finances.chargesMensuelles;

    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    pdfContent.style.fontSize = '12px';
    pdfContent.style.color = '#333';
    pdfContent.innerHTML = `
      <div style="display:flex; align-items:center; margin-bottom:20px; border-bottom:3px solid #b71c1c; padding-bottom:10px;">
        <img src="logo.png" alt="Logo" style="height:40px; margin-right:15px;">
        <div>
          <h2 style="margin:0; color:#b71c1c; font-size:18px;">Crédit Habitat</h2>
          <p style="margin:4px 0 0; color:#555; font-size:11px;">Récapitulatif du dossier client</p>
        </div>
      </div>

      <div style="background:#f9f9f9; padding:12px; border-radius:6px; margin:15px 0; display:flex; justify-content:space-between; font-size:11px;">
        <div><strong>Référence :</strong> ${this.application.reference}</div>
        <div><strong>Date :</strong> ${today}</div>
        <div><strong>Statut :</strong> <span style="color:${
          this.application.status === 'Accepte' ? '#2e7d32' :
          this.application.status === 'Refuse' ? '#d32f2f' : '#1976d2'
        }">${this.application.status}</span></div>
      </div>

      <div style="margin:20px 0;">
        <h3 style="color:#1976d2; border-left:4px solid #1976d2; padding-left:10px; margin:20px 0 12px; font-size:14px;">
          Informations du demandeur
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; background:#fafafa; padding:12px; border-radius:6px;">
          <div><strong>Nom complet :</strong> ${this.application.applicant.nom}</div>
          <div><strong>CIN :</strong> ${this.application.applicant.cin}</div>
          <div><strong>Téléphone :</strong> ${this.application.applicant.telephone}</div>
          <div><strong>Email :</strong> ${this.application.applicant.email}</div>
        </div>
      </div>

      <div style="margin:20px 0;">
        <h3 style="color:#1976d2; border-left:4px solid #1976d2; padding-left:10px; margin:20px 0 12px; font-size:14px;">
          Détails du projet immobilier
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; background:#fafafa; padding:12px; border-radius:6px;">
          <div><strong>Type de bien :</strong> ${this.application.loan.typeBien}</div>
          <div><strong>Prix du bien :</strong> ${this.application.loan.prixBien.toLocaleString('fr-FR')} DH</div>
          <div><strong>Apport personnel :</strong> ${this.application.loan.apport.toLocaleString('fr-FR')} DH</div>
          <div><strong>Montant emprunté :</strong> ${emprunt.toLocaleString('fr-FR')} DH</div>
          <div><strong>Durée du prêt :</strong> ${this.application.loan.duree} ans</div>
        </div>
      </div>

      <div style="margin:20px 0;">
        <h3 style="color:#1976d2; border-left:4px solid #1976d2; padding-left:10px; margin:20px 0 12px; font-size:14px;">
          Situation financière
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; background:#fafafa; padding:12px; border-radius:6px;">
          <div><strong>Revenus mensuels :</strong> ${this.application.finances.revenusMensuels.toLocaleString('fr-FR')} DH</div>
          <div><strong>Charges mensuelles :</strong> ${this.application.finances.chargesMensuelles.toLocaleString('fr-FR')} DH</div>
          <div><strong>Capacité d'emprunt :</strong> ${capacite.toLocaleString('fr-FR')} DH</div>
        </div>
      </div>

      ${
        this.application.documents.length > 0
          ? `
            <div style="margin:20px 0;">
              <h3 style="color:#1976d2; border-left:4px solid #1976d2; padding-left:10px; margin:20px 0 12px; font-size:14px;">
                Pièces justificatives
              </h3>
              <div style="display:flex; flex-wrap:wrap; gap:10px;">
                ${this.application.documents
                  .map(
                    doc => `
                      <div style="background:#fafafa; padding:10px; border-radius:6px; min-width:150px;">
                        <mat-icon style="color:#1976d2;">${this.getFileIcon(doc.type)}</mat-icon>
                        <div style="font-size:11px; margin-top:4px;">${doc.name}</div>
                      </div>
                    `
                  )
                  .join('')}
              </div>
            </div>
          `
          : ''
      }

      <div style="margin-top:30px; padding-top:15px; border-top:1px dashed #ccc; font-size:10px; color:#666; text-align:center;">
        Ce document est généré automatiquement et n’a pas de valeur juridique sans signature manuscrite.<br>
        Crédit Habitat © ${new Date().getFullYear()} – Tous droits réservés
      </div>
    `;

    document.body.appendChild(pdfContent);

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      let height = (canvas.height * width) / canvas.width;

      if (height > pdf.internal.pageSize.getHeight()) {
        const availableHeight = pdf.internal.pageSize.getHeight() - 20;
        const pages = Math.ceil(height / availableHeight);
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage();
          const yPos = -i * availableHeight;
          pdf.addImage(imgData, 'PNG', 0, yPos, width, height);
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      }

      pdf.save(`Dossier_${this.application.reference}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Échec de la génération du PDF. Veuillez réessayer.');
    } finally {
      document.body.removeChild(pdfContent);
    }
  }
}