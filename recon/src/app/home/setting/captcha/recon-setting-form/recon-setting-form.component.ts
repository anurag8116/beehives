import {Component, OnInit, ChangeDetectorRef, EventEmitter} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

enum reconSetting {
  CYCLE_WISE = 'CYCLE_WISE',
  DAY_WISE = 'DAY_WISE',
}

@Component({
  selector: 'app-recon-setting-form',
  templateUrl: './recon-setting-form.component.html'
})
export class ReconSettingFormComponent implements OnInit {

  public form: FormGroup;
  public modules: any;
  public recons = [];
  public isLoading: boolean;
  public reconSettings = reconSetting;
  public isEdit: boolean;
  public reconSettingData: any[] = [];
  public reconSettingMap: Map<number, [{}]> = new Map<number, [{}]>();

//  @Output() public settingData: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(private http: HttpService, private router: Router, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      reconSetting: new FormArray([])
    });
    this.addReconSetting();
    this.http.get('v1/modules', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        for (let i = 0; i < data.data.length; i++) {
          this.onSelectModule(data.data[i].id);
        }
      });
    this.getData();
  }

  getData() {
    this.http.get('v1/reconsettings', true).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.reconSettingData = data;
          this.isEdit = true;
        } else {
          this.isEdit = false;
        }

      });
  }

  settingEnums(): Array<string> {
    return Object.keys(this.reconSettings).map(el => Object(this.reconSettings)[el]);
  }

  onSelectModule(moduleId) {
    this.http.get('v1/recons?Find=ByModule&module=' + moduleId, true).subscribe(
      (data: any) => {
        this.recons = data.data;
        for (let i = 0; i < data.data.length; i++) {
          this.reconSettingMap.set(+moduleId, data.data);
        }
        this.changeDef.detectChanges();
      });
  }

  addReconSetting(): void {
    const control = new FormGroup({
      id: new FormControl(null),
      moduleId: new FormControl(null),
      reconId: new FormControl(null),
      settingType: new FormControl(null),
      matchingInFileCount: new FormControl(null)
    });
    (<FormArray>this.form.get('reconSetting')).push(control);
    this.changeDef.detectChanges();
  }

  removeReconSetting(i: number) {
    (<FormArray>this.form.get('reconSetting')).removeAt(i);
  }

  editDetail() {
    this.isEdit = false;
    (<FormGroup>this.form).removeControl('reconSetting');
    (<FormGroup>this.form).addControl('reconSetting', new FormArray([]));
    for (let i = 0; i < this.reconSettingData.length; i++) {
      this.addReconSetting();
      const reconSettingControl = (<FormArray>this.form.get('reconSetting')).at(i);
      reconSettingControl.get('moduleId').patchValue(this.reconSettingData[i].module.id);
      reconSettingControl.get('reconId').patchValue(this.reconSettingData[i].recon.id);
      reconSettingControl.get('settingType').patchValue(this.reconSettingData[i].settingType);
      reconSettingControl.get('matchingInFileCount').patchValue(this.reconSettingData[i].matchingInFileCount);
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.http.post('v1/reconsettings', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.http.displaySuccessOnPopUp('Recon Setting Successfully Submitted !');
        this.getData();
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  cancel() {
    this.ngOnInit();
  }

}
