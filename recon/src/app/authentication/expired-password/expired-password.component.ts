import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../shared/services/http-service';
import {AuthService} from '../../shared/services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-expired-password',
  templateUrl: './expired-password.component.html'
})
export class ExpiredPasswordComponent implements OnInit {
  public loginForm: FormGroup;
  public isLoading: boolean;
  public isError: boolean;
  public userDetail: any;
  public policyErrorMessage: String;
  public privileges: any = {privilegeMenu: []};
  public oldPassword: boolean;
  public password: boolean;
  public confirmPassword: boolean;

  constructor(private router: Router, private httpService: HttpService, private authService: AuthService) {
    this.oldPassword = false;
    this.password = false;
    this.confirmPassword = false;
  }

  ngOnInit() {
    this.isLoading = false;
    this.loginForm = new FormGroup({
      'oldPassword': new FormControl(null),
      'password': new FormControl(null),
      'confirmPassword': new FormControl(null),
    });
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.httpService.post('v1/resetpassword', this.loginForm.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (!isNullOrUndefined(data.policyErrorMessage)) {
           this.policyErrorMessage = data.policyErrorMessage;
           this.isError = true;
        } else {
          localStorage.clear();
          this.router.navigate([ '/authentication/login']);
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
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
