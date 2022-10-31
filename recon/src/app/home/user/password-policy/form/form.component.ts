import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public passwordPolicyForm: FormGroup;
  public isLoading: boolean;
  public isShow: boolean;
  public formOpen: boolean;
  public passwordPolicy: any = {};
  @Input() public onEdit: any;
  public allow: any = [
    {value: true, name: 'Yes'},
    {value: false, name: 'No'}
  ];

  constructor(private http: HttpService, private router: Router) {
    this.isShow = false;
    this.formOpen = false;
  }

  ngOnInit() {
    this.isLoading = false;
    this.getPasswordPolicy();
    this.passwordPolicyForm = new FormGroup({
      'name': new FormControl(null),
      'minLength': new FormControl(null),
      'maxLength': new FormControl(null),
      'passwordMaxAge': new FormControl(null),
      'passwordExpWarning': new FormControl(null),
      'passwordMaxFailure': new FormControl(null),
      'allowUserToChamgePwd': new FormControl(false),
      'specialCharAllowed': new FormControl(false),
      'specialCharacters': new FormControl(null),
      'uppercaseLetterAllowed': new FormControl(false),
      'numberAllowed': new FormControl(false),
      'usePolicy': new FormControl(false),
    });
  }

  getPasswordPolicy() {
    this.http.get('v1/passwordpolicies?start=0&length=100', true).subscribe(
      (data: any) => {
        this.passwordPolicy = data;
        this.check();
      }
    );
  }

  private check() {
    if (this.passwordPolicy == null) {
      this.formOpen = false;
    } else {
      this.formOpen = true;
    }
  }

  allowSpecialCh(special: any) {
    if (special === 'true') {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  public cancel() {
    if (!isNullOrUndefined(this.passwordPolicy)) {
      this.formOpen = true;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.http.post('v1/passwordpolicies', this.passwordPolicyForm.getRawValue(), true).subscribe(
      (data: any) => {
        if (!(this.passwordPolicy == null )) {
          this.http.displaySuccessOnPopUp('Password Policy Successfully Updated!');
        } else {
          this.http.displaySuccessOnPopUp('Password Policy Successfully Created!');
        }
        this.check();
        this.getPasswordPolicy();
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  editMode() {
    this.formOpen = false;
    this.http.get('v1/passwordpolicies?start=0&length=100', true).subscribe(
      (data: any) => {
        this.passwordPolicy = data;
        this.passwordPolicyForm.patchValue(data);
      }
    );
  }
}
