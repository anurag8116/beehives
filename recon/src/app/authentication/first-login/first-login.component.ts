import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../shared/services/http-service';
import {AuthService} from '../../shared/services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-first-login',
  templateUrl: './first-login.component.html'
})
export class FirstLoginComponent implements OnInit {

  public loginForm: FormGroup;
  public allowCaptcha: boolean;
  public imgs: any;
  public isImg = false;
  public userDetail: any;
  public privileges: any = {privilegeMenu: []};
  public isLoading: boolean;
  public oldPassword: boolean;
  public password: boolean;
  public confirmPassword: boolean;

  constructor(private router: Router, private httpService: HttpService, private authService: AuthService) {
    this.allowCaptcha = false;
    this.oldPassword = false;
    this.password = false;
    this.confirmPassword = false;
  }

  ngOnInit() {
    this.isLoading = false;
    this.loginForm = new FormGroup({
      'userName': new FormControl(null),
      'oldPassword': new FormControl(null),
      'password': new FormControl(null),
      'confirmPassword': new FormControl(null),
      'captcha': new FormControl(null),
      'allowCaptcha': new FormControl(true),
      captchaCode: new FormControl(null),
    });
    this.refreshCaptcha();
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

  public onSubmit(): void {
    this.isLoading = true;
    this.httpService.login('v1/firstlogin', this.loginForm.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (!isNullOrUndefined(data) && data.firstLogin === true) {
          this.router.navigate([ '/authentication/login']);
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
        this.refreshCaptcha();
      }
    );
  }

  public showOldPassword () {
    this.oldPassword = !this.oldPassword;
  }

  public showPassword () {
    this.password = !this.password;
  }

  public showConfirmPassword () {
    this.confirmPassword = !this.confirmPassword;
  }
}
