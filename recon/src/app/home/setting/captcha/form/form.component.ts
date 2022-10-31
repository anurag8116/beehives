import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';

enum SettingGroup {
  USER = 'USER',
  FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION',
  RECON_CYCLE = 'RECON_CYCLE'
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public settingData: any;
  public userformOpen: any;
  public subSettings = [{key: 'User', value: 'USER'}, {key: 'Financial Institutions', value: 'FINANCIAL_INSTITUTION'},
    {key: 'Recon Cycle', value: 'RECON_CYCLE'}];
  public currentSettingGroup: any;
  public isLoading: boolean;
  public userMod: boolean;
  public financialInstitution: boolean;
  public financialForm: boolean;
  public financialDetail: boolean;
  public isreconCycle: boolean;
  public isreconCycleForm: boolean;
  public isreconCycleNewButton: boolean;
  public isreconCycleDetail: boolean;
  public selectedIndex: number;
  public masterDatas: any;
  public settingGroup: any;
  public formType: any;

  constructor(private http: HttpService, private router: Router) {
    this.settingGroup = SettingGroup;
  }

  ngOnInit() {
    this.form = new FormGroup({
      globalSetting: new FormArray([])
    });
    for (const val of this.subSettings) {
      this.currentSettingGroup = val.value;
      this.onSelectSubSetting(val.value);
      break;
    }
    this.http.get('v1/masterdatatypes', true).subscribe(
      (data: any) => {
        this.masterDatas = data.data;
      });
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  onSelectSubSetting(settingGroup: string) {
    this.currentSettingGroup = settingGroup;
    switch (settingGroup) {
      case this.settingGroup.USER:
      case this.settingGroup.FINANCIAL_INSTITUTION:
        this.userSetting(settingGroup);
        break;
      case this.settingGroup.RECON_CYCLE:
        this.reconSetting('detail', 1);
        break;
      default:
        break;
    }
  }

  userSetting(settingGroup: any) {
    this.http.get('v1/globalsettings?Find=BySettingGroup&settingGroup=' + settingGroup, true).subscribe(
      (data: any) => {
        switch (settingGroup) {
          case this.settingGroup.USER:
            this.userConditions(data);
            break;
          case this.settingGroup.FINANCIAL_INSTITUTION:
            this.financialConditions(data);
            break;
          default:
            break;
        }
      }
    );
  }

  reconSetting(check: String, data) {
    this.userMod = false;
    this.userformOpen = false;
    this.financialInstitution = false;
    this.financialForm = false;
    this.isreconCycle = true;
    if (check === 'edit') {
      this.isreconCycleForm = true;
      this.isreconCycleNewButton = false;
      this.formType = {type: 'edit', data: data};
    } else if (check === 'new') {
      this.isreconCycleForm = true;
      this.isreconCycleNewButton = false;
      this.formType = {type: 'new', data: data};
    } else {
      this.isreconCycleForm = false;
      this.isreconCycleNewButton = true;
    }
  }

  userConditions(data: any) {
    this.financialInstitution = false;
    this.isreconCycle = false;
    this.isreconCycleNewButton = false;
    if (!isNullOrUndefined(data)) {
      this.settingData = data;
      this.userMod = true;
      this.userformOpen = false;
    } else {
      this.userMod = true;
      this.userformOpen = true;
    }
  }

  financialConditions(data: any) {
    this.userMod = false;
    this.isreconCycleNewButton = false;
    this.isreconCycle = false;
    if (!isNullOrUndefined(data)) {
      this.settingData = data;
      this.financialInstitution = true;
      this.financialForm = false;
    } else {
      this.financialInstitution = true;
      this.financialForm = true;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.http.put('v1/globalsettings', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.userformOpen = false;
        this.financialForm = false;
        this.onSelectSubSetting(this.currentSettingGroup);
        this.http.displaySuccessOnPopUp('Global Setting Successfully Updated!');
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  public addGlobalSetting(data: any): void {
    const control = new FormGroup({
      id: new FormControl(data.id),
      displayMessage: new FormControl(data.displayMessage),
      settingValue: new FormControl(data.settingValue),
    });
    (<FormArray>this.form.get('globalSetting')).push(control);
  }

  editDetail() {
    this.userformOpen = true;
    (<FormGroup>this.form).removeControl('globalSetting');
    (<FormGroup>this.form).addControl('globalSetting', new FormArray([]));
    for (const setting of this.settingData) {
      this.addGlobalSetting(setting);
    }
  }

  editFinancialDetail() {
    this.financialForm = true;
    (<FormGroup>this.form).removeControl('globalSetting');
    (<FormGroup>this.form).addControl('globalSetting', new FormArray([]));
    for (const setting of this.settingData) {
      this.addGlobalSetting(setting);
    }
  }

  editReconCycl(data: any) {
    this.reconSetting('edit', data);
  }

  openReconDeail() {
    this.reconSetting('detail', 1);
  }

  cancel() {
    this.isLoading = true;
    if (this.currentSettingGroup === 'USER') {
      this.userformOpen = false;
    }
    if (this.currentSettingGroup === 'FINANCIAL_INSTITUTION') {
      this.financialForm = false;
    }
    this.isLoading = false;
  }

  reconCycleNewForm () {
    this.reconSetting('new', 1);
  }

}
