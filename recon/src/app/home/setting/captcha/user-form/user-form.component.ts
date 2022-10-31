import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../shared/services/http-service';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isFormShow: boolean;
  public isEdit: boolean;
  public settingData: any;
  public settingGroup: any;

  constructor(private http: HttpService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.params.subscribe((param: Params) => {
      this.activeRoute.queryParams.subscribe(params => {
        this.settingGroup = params['categoryType'] || null;
        this.userSetting(this.settingGroup);
      });
    });
    this.form = new FormGroup({
      globalSetting: new FormArray([])
    });
  }

  public addGlobalSetting(data: any): void {
    const control = new FormGroup({
      id: new FormControl(data.id),
      displayMessage: new FormControl(data.displayMessage),
      settingValue: new FormControl(data.settingValue),
    });
    (<FormArray>this.form.get('globalSetting')).push(control);
  }

  userSetting(settingGroup: any) {
    this.http.get('v1/globalsettings?Find=BySettingGroup&settingGroup=' + settingGroup, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          this.isFormShow = false;
          this.settingData = data;
        } else {
          this.isFormShow = true;
        }
      }
    );
  }

  onSubmit() {
    this.isLoading = true;
    this.http.put('v1/globalsettings', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.userSetting(this.settingGroup);
        this.http.displaySuccessOnPopUp('Global Setting Successfully Updated!');
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  editDetail() {
    this.isFormShow = true;
    this.isEdit = true;
    (<FormGroup>this.form).removeControl('globalSetting');
    (<FormGroup>this.form).addControl('globalSetting', new FormArray([]));
    for (const setting of this.settingData) {
      this.addGlobalSetting(setting);
    }
  }

  cancel() {
    this.isFormShow = false;
  }

}
