import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../shared/services/auth.service';
import {HttpService} from '../../shared/services/http-service';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  public isLoading: boolean;
  public resetPasswordForm: FormGroup;
  public token: String;
  public password: boolean;
  public confirmPassword: boolean;

  constructor(private httpService: HttpService, private authService: AuthService, private router: Router, private activeRoute: ActivatedRoute) {
    this.password = false;
    this.confirmPassword = false;
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((param: Params) => {
      this.token = param['token'] || null;
    });
    this.isLoading = false;
    this.resetPasswordForm = new FormGroup({
      'password': new FormControl(null),
      'confirmPassword': new FormControl(null),
      'token': new FormControl(this.token)
    });
  }

  cancel() {
    this.router.navigate(['/home/dashboard']);
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.httpService.post('v1/changepassword', this.resetPasswordForm.getRawValue(), true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.resetPasswordForm.reset();
        this.router.navigate(['/home/dashboard']);
        this.httpService.displaySuccessOnPopUp('Password Successfully Changed !');
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  public showPassword () {
    this.password = !this.password;
  }

  public showConfirmPassword () {
    this.confirmPassword = !this.confirmPassword;
  }

}
