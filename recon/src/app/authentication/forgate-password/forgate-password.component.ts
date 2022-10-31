import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../shared/services/http-service';
import {AuthService} from '../../shared/services/auth.service';

@Component({
  selector: 'app-forgate-password',
  templateUrl: './forgate-password.component.html',
  styleUrls: ['./forgate-password.component.css']
})
export class ForgatePasswordComponent implements OnInit {

  public isLoading: boolean;
  public resetPasswordForm: FormGroup;
  public token: string;
  constructor(private httpService: HttpService, private authService: AuthService, private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.params.subscribe((param: Params) => {
      this.token = param['token'] || null;
      console.log('token is-----' + this.token);
    });
    this.resetPasswordForm = new FormGroup({
      userName: new FormControl(null)
    });
  }

  cancel () {
    this.router.navigate([ '/authentication/login']);
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.httpService.login('v1/forgotPassword', this.resetPasswordForm.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.resetPasswordForm.reset();
        this.httpService.displaySuccessOnPopUp('Password Change Request Successfully Sent At your Email ,In case you don\'t receive any mail contact to admin!');
        this.router.navigate([ '/authentication/login']);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }


}
