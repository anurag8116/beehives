import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {authRouting} from './authentication.routing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {ForgatePasswordComponent} from './forgate-password/forgate-password.component';
import {FirstLoginComponent} from './first-login/first-login.component';
import {LayoutComponent} from './layout/layout.component';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import { OtpComponent } from './otp/otp.component';
import { ExpiredPasswordComponent } from './expired-password/expired-password.component';

@NgModule({
  imports: [
    authRouting,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [LoginComponent, ResetPasswordComponent, ForgatePasswordComponent, FirstLoginComponent, LayoutComponent, FullLayoutComponent, OtpComponent, ExpiredPasswordComponent],
  providers: []
})
export class AuthenticationModule {
}
