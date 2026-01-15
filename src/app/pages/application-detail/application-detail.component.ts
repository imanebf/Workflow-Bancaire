import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { Application } from '../../models/application.model';
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

  async exportToPDF(): Promise<void> {
    if (!this.application) return;

    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.fontSize = '12px';
    pdfContent.innerHTML = `
      <div style="text-align:center; margin-bottom:20px;">
        <div style="font-size:24px; font-weight:bold; color:#b71c1c; margin-bottom:10px;">
          Crédit Habitat
        </div>
        <h2 style="color:#b71c1c; margin:0;">Crédit Habitat – Récapitulatif du Dossier</h2>
        <p style="margin:5px 0; color:#555;">${new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div style="background:#f5f5f5; padding:10px; border-radius:4px; margin:15px 0;">
        <strong>Référence :</strong> ${this.application.reference}<br>
        <strong>Statut :</strong> ${this.application.status}
      </div>

      <h3 style="color:#1976d2; border-bottom:1px solid #eee; padding-bottom:5px;">Identité du demandeur</h3>
      <p><strong>Nom :</strong> ${this.application.applicant.nom}</p>
      <p><strong>CIN :</strong> ${this.application.applicant.cin}</p>
      <p><strong>Téléphone :</strong> ${this.application.applicant.telephone}</p>
      <p><strong>Email :</strong> ${this.application.applicant.email}</p>

      <h3 style="color:#1976d2; border-bottom:1px solid #eee; padding-bottom:5px; margin-top:20px;">Projet immobilier</h3>
      <p><strong>Type de bien :</strong> ${this.application.loan.typeBien}</p>
      <p><strong>Prix du bien :</strong> ${this.application.loan.prixBien.toLocaleString('fr-FR')} DH</p>
      <p><strong>Apport personnel :</strong> ${this.application.loan.apport.toLocaleString('fr-FR')} DH</p>
      <p><strong>Montant emprunté :</strong> ${(this.application.loan.prixBien - this.application.loan.apport).toLocaleString('fr-FR')} DH</p>
      <p><strong>Durée du prêt :</strong> ${this.application.loan.duree} ans</p>

      <h3 style="color:#1976d2; border-bottom:1px solid #eee; padding-bottom:5px; margin-top:20px;">Situation financière</h3>
      <p><strong>Revenus mensuels :</strong> ${this.application.finances.revenusMensuels.toLocaleString('fr-FR')} DH</p>
      <p><strong>Charges mensuelles :</strong> ${this.application.finances.chargesMensuelles.toLocaleString('fr-FR')} DH</p>
      <p><strong>Capacité d'emprunt :</strong> ${(this.application.finances.revenusMensuels - this.application.finances.chargesMensuelles).toLocaleString('fr-FR')} DH</p>

      <div style="margin-top:30px; font-size:10px; color:#777; text-align:center;">
        Document généré automatiquement – Crédit Habitat © ${new Date().getFullYear()}
      </div>
    `;

    document.body.appendChild(pdfContent);

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Dossier_${this.application.reference}.pdf`);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Échec de la génération du PDF. Veuillez réessayer.');
    } finally {
      document.body.removeChild(pdfContent);
    }
  }
}
