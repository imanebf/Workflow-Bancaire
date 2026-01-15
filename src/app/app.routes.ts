import { Routes } from '@angular/router';
import { DraftApplicationComponent } from './pages/draft-application/draft-application.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';
import { ApplicationDetailComponent } from './pages/application-detail/application-detail.component';
import { DashboardAnalyticsComponent } from './pages/dashboard-analytics/dashboard-analytics.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tableau-de-bord', pathMatch: 'full' },
  { path: 'tableau-de-bord', component: DashboardAnalyticsComponent },
  { path: 'nouvelle-demande', component: DraftApplicationComponent },
  { path: 'nouvelle-demande/:id', component: DraftApplicationComponent },
  { path: 'mes-dossiers', component: MyApplicationsComponent },
  { path: 'dossier/:id', component: ApplicationDetailComponent }
];