import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {ModuleWithProviders} from '@angular/compiler/src/core';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgatePasswordComponent} from './forgate-password/forgate-password.component';
import {FirstLoginComponent} from './first-login/first-login.component';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {BlankComponent} from '../shared/blank/blank.component';
import {OtpComponent} from './otp/otp.component';
import {ExpiredPasswordComponent} from './expired-password/expired-password.component';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'login', pathMatch: 'full', component: LoginComponent},
  {path: 'first-login', pathMatch: 'full', component: FirstLoginComponent},
  {path: 'expired-password', pathMatch: 'full', component: ExpiredPasswordComponent},
  {path: 'forgate-password', pathMatch: 'full', component: ForgatePasswordComponent},
  {path: 'otp', pathMatch: 'full', component: OtpComponent},
  {
    path: 'full', component: FullLayoutComponent, children: [
    {path: 'reset-password/:token', component: ResetPasswordComponent, outlet: 'fullBodyOutlet'},
  ]
  },

];

export const authRouting: ModuleWithProviders = RouterModule.forChild(routes);
