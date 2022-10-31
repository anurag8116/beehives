import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpService} from '../../shared/services/http-service';
import {AuthService} from '../../shared/services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AppConstants} from '../../shared/services/app.constants';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html'
})
export class OtpComponent implements OnInit {

  public otpForm: FormGroup;
  public requestSubmitted = false;
  public requestExceed = false;
  public restrictOtp = 0;
  public mobileNumber: any;
  public isLoading: boolean;

  constructor(private router: Router, private httpService: HttpService, private authService: AuthService) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.mobileNumber = localStorage.getItem(AppConstants.MOBILE_NUMBER);
    this.otpForm = new FormGroup({
      'otp': new FormControl(null),
      userId: new FormControl(localStorage.getItem(AppConstants.USER_ID)),
    });
  }

  public resendOtp(): void {
    if (this.restrictOtp < 3) {
      this.requestSubmitted = true;
      this.httpService.getWithoutAuth('v1/resendotp/' + localStorage.getItem(AppConstants.USER_ID), true).subscribe(
        (data: any) => {
          this.restrictOtp++;
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    } else {
      this.requestSubmitted = false;
      this.requestExceed = true;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.httpService.postWithoutAuth('v1/verifyotp', this.otpForm.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        if (data.id === null) {
          if (data.otpWrongCount < 2) {
            this.httpService.displayErrorOnPopUp('Wrong OTP');
          } else if (data.otpWrongCount === 2) {
            this.router.navigate(['/authentication/login']);
          }
        } else {
          this.authService.setAuthToken(data);
          this.router.navigate(['/home/dashboard']);
        }
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

}
