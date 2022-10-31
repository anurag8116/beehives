import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isEdit: boolean;
  public modules: any;
  public id: number;
  public settingTypes = ['CYCLE_WISE', 'DAY_WISE'];
  public dataSources = [];
  public reconCycleData = [];
  @Output() private openReconCycleDetal = new EventEmitter<boolean>();
  @Input() public formData: any;

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.getRawData();
    this.form = new FormGroup({
      id: new FormControl(),
      moduleId: new FormControl(),
      sourceAvails: new FormArray([])
    });
    this.httpService.get('v1/modules', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      });
    if (!isNullOrUndefined(this.formData) && this.formData.type === 'edit') {
      this.patchDetail(this.formData.data);
    }
  }

  getRawData() {
    this.httpService.get('v1/fileavailabilitys', true).subscribe(
      (data: any) => {
        if (data.data.length > 0) {
          this.reconCycleData = data.data;
          this.isEdit = false;
        } else {
          this.isEdit = true;
        }
      });
  }

  openNewForm() {
    this.isEdit = true;
  }

  removeCycleArray(i: number) {
    (<FormArray>this.form.get('sourceAvails')).removeAt(i);
  }


  addCycle(formFileAvailTime, dataSourceId, reconSettingType = 'CYCLE_WISE') {
    const control = new FormGroup({
      id: new FormControl(null),
      availTime: new FormControl(null),
      formFileAvailTime: new FormControl(formFileAvailTime),
      dataSourceId: new FormControl(dataSourceId),
      reconSettingType: new FormControl(reconSettingType),
    });
    (<FormArray>this.form.get('sourceAvails')).push(control);
  }

  onSubmit() {
    const cycleArr = <FormArray>this.form.get('sourceAvails');
    for (let i = 0; i < cycleArr.length; i++) {
      const startTime: Date = cycleArr.at(i).get('formFileAvailTime').value;
      cycleArr.at(i).patchValue({
        availTime: startTime === null ? null : (startTime.getHours() + ':' + startTime.getMinutes())
      });
    }
    this.httpService.post('v1/fileavailabilitys', this.form.value, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('File Avail Successfully Updated !');
        this.form.reset();
        this.isEdit = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
        this.isEdit = true;
      }
    );
  }

  editReconCycl(data: any) {
    this.isEdit = true;
    this.patchDetail(data);
  }

  patchDetail(data: any) {
    this.form.removeControl('sourceAvails');
    this.form.addControl('sourceAvails', new FormArray([]));
    this.onModuleChange(data.moduleId);
    this.form.patchValue(data);
    for (const cycle of data.sourceAvails) {
      let formFileAvailTime = null;
      if (cycle.availTime) {
        const today = new Date();
        formFileAvailTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), cycle.availTime.split(':')[0], cycle.availTime.split(':')[1], 0);
      }
      this.addCycle(formFileAvailTime, cycle.dataSourceId, cycle.reconSettingType);
    }
  }

  public removeCycle(i: number): void {
    (<FormArray>this.form.get('sourceAvails')).removeAt(i);

  }

  cancel() {
    this.form.reset();
    this.form.removeControl('sourceAvails');
    this.form.addControl('sourceAvails', new FormArray([]));
    this.isEdit = false;
  }

  onModuleChange(moduleId, addCycle = false) {
    this.dataSources = [];
    this.httpService.get('v1/datasources?Find=ByModule&moduleId=' + moduleId, true).subscribe(
      (data: any) => {
        this.dataSources = data.data;
        if (data.data && addCycle) {
          this.form.removeControl('sourceAvails');
          this.form.addControl('sourceAvails', new FormArray([]));
          for (const source of this.dataSources) {
            this.addCycle(null, source.id);
          }
        }
      }
    );
  }

  resetTime(index, settingType) {
    (<FormArray>this.form.get('sourceAvails')).at(index).patchValue({formFileAvailTime: null});
  }
}
