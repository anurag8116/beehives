import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {LocationStrategy} from '@angular/common';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-financial-institution-form',
  templateUrl: './financial-institution-form.component.html'
})
export class FinancialInstitutionFormComponent implements OnInit {
  public form: FormGroup;
  public masterDatas: any;
  public isLoading = false;
  public settingGroup: any;
  public isFormShow: boolean;
  public financialData: any;
  public tableColumn: any;
  public map = new Map<number, any[]>();
  public masterDataUsages = [{key: 'FINANCIAL_INSTITUTION', value: 'Financial Institution'},
    {key: 'ATM', value: 'ATM'}];

  constructor(private httpService: HttpService, private location: LocationStrategy, private activeRoute: ActivatedRoute,
              private cdRef : ChangeDetectorRef) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.params.subscribe((param: Params) => {
      this.activeRoute.queryParams.subscribe(params => {
        this.settingGroup = params['categoryType'] || null;
        this.financialSetting(this.settingGroup);
      });
    });
    this.httpService.get('v1/masterdatatypes', true).subscribe(
      (data: any) => {
        this.masterDatas = data.data;
      });
    this.form = new FormGroup({
      globalSetting: new FormArray([])
    });
    this.addGlobalSetting();
  }

  onChangeMasterDataUsages(i: number, usage: string) {
    if (usage !== 'ATM') {
      (<FormArray>this.form.get('globalSetting')).at(i).get('parentKey').reset();
      (<FormArray>this.form.get('globalSetting')).at(i).get('fileColumnName').reset();
    }
  }

  onChangeMasterDataType (i: number, tableName: string) {
    this.httpService.get('v1/datatables/columns?table=' + tableName + '&start=0', true).subscribe(
      (data: any) => {
        this.tableColumn = data;
        this.map.set(i, data);
      }
    );

  }

  financialSetting(settingGroup: any) {
    this.httpService.get('v1/globalsettings?Find=BySettingGroup&settingGroup=' + settingGroup, true).subscribe(
      (data: any) => {
        this.financialData = data;
        if (this.financialData.length === 0) {
          this.isFormShow = true;
        } else {
          this.isFormShow = false;
        }
      }
    );
  }

  removeSetting (i: number) {
    (<FormArray>this.form.get('globalSetting')).removeAt(i);
  }

  public addGlobalSetting(): void {
    const control = new FormGroup({
      id: new FormControl(),
      settingKey: new FormControl(),
      settingValue: new FormControl(),
      parentKey: new FormControl(),
      fileColumnName: new FormControl()
    });
    (<FormArray>this.form.get('globalSetting')).push(control);
  }

  edit() {
    this.isFormShow = true;
    (<FormGroup>this.form).removeControl('globalSetting');
    (<FormGroup>this.form).addControl('globalSetting', new FormArray([]));
    for (let i = 0; i < this.financialData.length; i++) {
      this.addGlobalSetting();
    }
    (<FormArray>this.form.get('globalSetting')).patchValue(this.financialData);
    this.cdRef.detectChanges();
  }

  cancel() {
    this.isFormShow = false;
  }

  onSubmit() {
    this.isLoading = true;
    this.httpService.put('v1/globalsettings?settingGroup=FINANCIAL_INSTITUTION', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Global Setting Successfully Updated!');
        this.financialSetting(this.settingGroup);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }
}
