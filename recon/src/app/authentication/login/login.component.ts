import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpService} from '../../shared/services/http-service';
import {AuthService} from '../../shared/services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import * as CryptoJS from 'crypto-js';
import {AppConstants} from '../../shared/services/app.constants';
import {OAuthService, ReceivedTokens} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public isLoading: boolean;
  public isSsoLoading = false;
  public accountRequest = false;
  public loginForm: FormGroup;
  public allowCaptcha = false;
  public isImg = false;
  public imgs: any;
  public show: boolean;

  constructor(private router: Router, private httpService: HttpService, private authService: AuthService,
              private oAuthService: OAuthService) {
  }

  ngOnInit(): void {
    this.show = false;
    this.isLoading = false;
    if (this.authService.hasToken()) {
      this.router.navigate(['/home/dashboard']);
    }
    this.loginForm = new FormGroup({
      userName: new FormControl(null),
      password: new FormControl(null),
      captcha: new FormControl(null),
      captchaCode: new FormControl(null),
    });
    this.refreshCaptcha();
    if (this.oAuthService.hasValidIdToken()) {
      this.ssoLogin(this.oAuthService.getIdToken());
    }
  }

  public refreshCaptcha() {
    this.httpService.get('v1/captcha', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.captchaAllowed === true) {
          this.allowCaptcha = true;
          this.imgs = 'data:image/JPEG;base64,' + data.captchaString;
          this.loginForm.patchValue({captchaCode: data.uniqueCode});
          if (this.imgs !== null) {
            this.isImg = true;
          }
        }
      }
    );
  }

  verify(data: any) {
    if (data.passwordExpired) {
      this.router.navigate(['/authentication/expired-password']);
      this.httpService.displayErrorOnPopUp('Password Expired');
    } else {
      if (data.otpRequired) {
        this.authService.setOtpFormData(data);
        this.router.navigate(['/authentication/otp']);
      } else {
        this.authService.setAuthToken(data);
        this.router.navigate(['/home']);
      }
    }
  }

  public onSubmit(): void {
    this.oAuthService.logOut();
    this.accountRequest = false;
    this.isLoading = true;
    this.encrypt(this.loginForm.get('password').value);
    this.httpService.login('v1/login', this.loginForm.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.verify(data);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
        this.refreshCaptcha();
      }
    );
  }

  public showPassword() {
    this.show = !this.show;
  }


  public encrypt(data: string) {
    if (data) {
      const parsedBase64Key = CryptoJS.enc.Base64.parse(AppConstants.ENCRYPTION_KEY);
      let encryptedData = null;
      // this is Base64-encoded encrypted data
      encryptedData = CryptoJS.AES.encrypt(data, parsedBase64Key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      this.loginForm.patchValue({password: encryptedData.toString()});
    }
  }

  ssoLogin(token) {
    this.isSsoLoading = true;
    this.accountRequest = false;
    this.httpService.ssoLogin('v1/login', token, true).subscribe(
      (data: any) => {
        this.isSsoLoading = false;
        this.verify(data);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isSsoLoading = false;
        this.accountRequest = errorResponse.status === 404;
        this.refreshCaptcha();
      }
    );
  }

  public registrationRequest() {
    if (this.oAuthService.hasValidIdToken()) {
      this.httpService.registrationRequest('v1/registrationRequest', this.oAuthService.getIdToken(), true).subscribe(
        (data: any) => {
          this.httpService.displaySuccessOnPopUp('Request successfully registered.');
        }
      );
    } else {
      this.httpService.displayErrorOnPopUp('Token not found');
    }
  }

  public login() {
    this.oAuthService.initImplicitFlow();
  }
}
