import { Routes } from '@angular/router';
import { DraftApplicationComponent } from './pages/draft-application/draft-application.component';
import { MyApplicationsComponent } from './pages/my-applications/my-applications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/nouvelle-demande', pathMatch: 'full' },
  { path: 'nouvelle-demande', component: DraftApplicationComponent },
  { path: 'mes-dossiers', component: MyApplicationsComponent }
];
