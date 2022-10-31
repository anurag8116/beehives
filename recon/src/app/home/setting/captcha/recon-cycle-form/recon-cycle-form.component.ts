import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-recon-cycle-form',
  templateUrl: './recon-cycle-form.component.html'
})
export class ReconCycleFormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isEdit: boolean;
  public modules: any;
  public id: number;
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
      cycles: new FormArray([])
    });
    this.addCycle();
    this.httpService.get('v1/modules', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      });
    if (!isNullOrUndefined(this.formData) && this.formData.type === 'edit') {
      this.patchDetail(this.formData.data);
    }
  }

  getRawData() {
    this.httpService.get('v1/reconcycles', true).subscribe(
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
    (<FormArray>this.form.get('cycle')).removeAt(i);
  }


  addCycle() {
    const control = new FormGroup({
      id: new FormControl(null),
      startTime: new FormControl(null),
      endTime: new FormControl(null),
      fileAvailTime: new FormControl(null),
      formStartTime: new FormControl(null),
      formEndTime: new FormControl(null),
      formFileAvailTime: new FormControl(null),
      cycleNo: new FormControl(null),
    });
    (<FormArray>this.form.get('cycles')).push(control);
  }

  onSubmit() {
    const cycleArr = <FormArray>this.form.get('cycles');
    for (let i = 0; i < cycleArr.length; i++) {
      const startTime: Date = cycleArr.at(i).get('formStartTime').value;
      const endTime: Date = cycleArr.at(i).get('formEndTime').value;
      const fileAvailTime: Date = cycleArr.at(i).get('formFileAvailTime').value;
      cycleArr.at(i).patchValue({
        startTime: startTime === null ? null : (startTime.getHours() + ':' + startTime.getMinutes()),
        endTime: endTime === null ? null : (endTime.getHours() + ':' + endTime.getMinutes()),
        fileAvailTime: fileAvailTime === null ? null : (fileAvailTime.getHours() + ':' + fileAvailTime.getMinutes()),
        cycleNo: i + 1
      });
    }
    this.httpService.post('v1/reconcycles', this.form.value, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Recon Cycle Successfully Updated !');
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
    this.form.removeControl('cycles');
    this.form.addControl('cycles', new FormArray([]));
    for (const cycle of data.cycles) {
      const today = new Date();
      Object.assign(cycle, {
        formStartTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), cycle.startTime.split(':')[0], cycle.startTime.split(':')[1], 0),
        formEndTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), cycle.endTime.split(':')[0], cycle.endTime.split(':')[1], 0),
        formFileAvailTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), cycle.fileAvailTime.split(':')[0], cycle.fileAvailTime.split(':')[1], 0)
      });
      this.addCycle();
    }
    this.form.patchValue(data);
  }

  public removeCycle(i: number): void {
    (<FormArray>this.form.get('cycles')).removeAt(i);

  }

  cancel() {
    this.form.reset();
    this.form.removeControl('cycles');
    this.form.addControl('cycles', new FormArray([]));
    this.addCycle();
    this.isEdit = false;
  }

}
