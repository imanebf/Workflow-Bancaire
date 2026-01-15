import { Routes } from '@angular/router';
import { DraftApplicationComponent } from './pages/draft-application/draft-application.component';

export const routes: Routes = [
  { path: '', redirectTo: '/nouvelle-demande', pathMatch: 'full' },
  { path: 'nouvelle-demande', component: DraftApplicationComponent }
];
