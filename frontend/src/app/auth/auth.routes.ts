import { Routes } from '@angular/router';
import { LoginpageComponent } from './layouts/loginpage/loginpage.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: LoginpageComponent,
    children: [
      { path: '', redirectTo: 'signin', pathMatch: 'full' },
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
    ],
  },
];
