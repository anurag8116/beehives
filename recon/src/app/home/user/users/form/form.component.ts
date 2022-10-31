import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public modules = [];
  public designations = [];
  public roles = [];
  public isLoading: boolean;
  public id: number;
  public isEditMode = false;
  public userTypes = [{key: 'INTERNAL', value: 'Internal'}, {key: 'EXTERNAL', value: 'External'}];
  public selectedUserType = 'INTERNAL';

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      if (this.id) {
        this.isEditMode = true;
        this.onEditUser(this.id);
      }
    });
    this.form = new FormGroup({
      id: new FormControl(null),
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      gender: new FormControl(null),
      email: new FormControl(null),
      mobile: new FormControl(null),
      slackId: new FormControl(null),
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
  }

  cancel() {
    this.router.navigate(['/home/user/full', 'users', {
      outlets: {
        'fullBodyOutlet': ['list'],
      }
    }]);
  }

  onSubmit() {
    this.isLoading = true;
    if (this.id) {
      this.httpService.put('v1/appusers', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.router.navigate(['/home/user/full', 'users', {
            outlets: {
              'fullBodyOutlet': ['list'],
            }
          }]);
          this.httpService.displaySuccessOnPopUp('User Successfully Updated!');
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      if (this.selectedUserType === 'INTERNAL') {

        this.httpService.post('v1/appusers', this.form.getRawValue(), true).subscribe(
          (data: any) => {
            this.isLoading = false;
            this.router.navigate(['/home/user/full', 'users', {
              outlets: {
                'fullBodyOutlet': ['list'],
              }
            }]);
            this.httpService.displaySuccessOnPopUp('User Successfully Created!');
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoading = false;
          }
        );
      } else {
        const formData = this.form.getRawValue();
        delete formData['designation'];
        delete formData['module'];
        delete formData['role'];
        this.httpService.post('v1/appusers/externals', formData, true).subscribe(
          (data: any) => {
            this.isLoading = false;
            this.router.navigate(['/home/user/full', 'users', {
              outlets: {
                'fullBodyOutlet': ['list'],
              }
            }]);
            this.httpService.displaySuccessOnPopUp('User Successfully Created!');
          },
          (errorResponse: HttpErrorResponse) => {
            this.isLoading = false;
          }
        );
      }
    }
  }

  private onEditUser(id: number) {
    this.httpService.get('v1/appusers/' + this.id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          this.form.patchValue(data);
          this.form.patchValue({gender: data.gender});
        }
      });
  }

  public onUserTypeChange(type) {
    this.selectedUserType = type;
  }

  public onKeyUp(event: any) {
    const NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/;
    const newValue = event.target.value;
    const regExp = new RegExp(NUMBER_REGEXP);

    if (!regExp.test(newValue)) {
      event.target.value = newValue.slice(0, -1);
    }
    if (newValue && newValue.length > 10) {
      event.target.value = newValue.slice(0, 10);
    }
  }
}
