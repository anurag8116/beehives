import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html'
})
export class RegisterUserComponent implements OnInit {

  public form: FormGroup;
  public isLoading = false;
  public modules = [];
  public designations = [];
  public roles = [];

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<RegisterUserComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) { }

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(null),
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      gender: new FormControl(null),
      email: new FormControl(null),
      mobile: new FormControl(null),
      slackId: new FormControl(null),
      registrationStatus: new FormControl(null),
      designation: new FormGroup({
        id: new FormControl(null)
      }),
      module: new FormGroup({
        id: new FormControl(null),
      }),
      role: new FormGroup({
        id: new FormControl(null),
      }),

    });
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.httpService.get('v1/designations?start=0', true).subscribe(
      (data: any) => {
        this.designations = data.data;
      }
    );
    this.httpService.get('v1/roles?start=0', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      }
    );
    if (this.popUpData && this.popUpData.id) {
      this.getUserDetail(this.popUpData.id);
    }
  }

  private getUserDetail(id: number) {
    this.httpService.get('v1/appusers/' + id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          const formData = {
            ...data,
            designation: {id: data.designation && data.designation.id ? data.designation.id :  null},
            module: {id: data.module && data.module.id ? data.module.id :  null},
            role: {id: data.role && data.role.id ? data.role.id :  null},
            registrationStatus: 'APPROVED'
          };
          this.form.patchValue(formData);
        }
      });
  }

  public close() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.isLoading = true;
      this.httpService.put('v1/appusers?Update=RegisteredUserStatus', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.httpService.displaySuccessOnPopUp('User Successfully approved!');
          this.close();
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
}
