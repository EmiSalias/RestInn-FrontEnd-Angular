import { Routes } from '@angular/router';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsConditions } from './pages/terms-conditions/terms-conditions';
import { CancelPolicy } from './pages/cancel-policy/cancel-policy';
import { CookiesPolicy } from './pages/cookies-policy/cookies-policy';

export const routes: Routes = [
{ path: 'politica-privacidad', component: PrivacyPolicy },
  { path: 'terminos-condiciones', component: TermsConditions },
  { path: 'politica-cancelacion', component: CancelPolicy },
  { path: 'politica-cookies', component: CookiesPolicy },
];
