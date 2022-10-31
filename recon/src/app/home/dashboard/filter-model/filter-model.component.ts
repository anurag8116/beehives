import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogData} from '../config-tab-layout/config-tab-layout.component';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../shared/services/app.constants';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../shared/services/auth.service';
import {forEach} from '@angular/router/src/utils/collection';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-filter-model',
  templateUrl: './filter-model.component.html'
})
export class FilterModelComponent implements OnInit {

  onSearch = new EventEmitter();
  public form: FormGroup;
  public archiveDate: string = null;
  public isArchiveData: boolean;
  public fromDateControlName: any = [];
  public toDateControlName: any = [];
  public minDate: Date;
  public maxDate: Date;
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();


  constructor(public dialogRef: MatDialogRef<FilterModelComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private authService: AuthService, private  datePipe: DatePipe) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.isArchiveData = false;
    this.form = new FormGroup({
      'filters': new FormArray([])
    });
    this.archiveDate = this.authService.getArchiveDataTillDate();
    const date = AppConstants.getDateFromString(this.datePipe.transform(this.authService.getArchiveDataTillDate(), 'dd-MM-yyyy'));
    this.minDate = new Date(date.setDate(date.getDate() + 1));
    this.maxDate = new Date(date.setDate(date.getDate() - 1));
    this.data.parameters.forEach((parameterItem, parameterIndex) => {
      const columnName = parameterItem.fieldName ? parameterItem.fieldName : parameterItem.id;
      const value = this.data.requestFiltersStore.size > 0 ? this.data.requestFiltersStore.get(columnName) : null;
      if (parameterItem.inputType === 'CALENDER') {
        parameterItem['postion'] = parameterIndex > 2 ? 'top' : 'bottom';
        if (parameterItem.dateType === 'PAST') {
          this.fromDateControlName.push(parameterIndex);
          parameterItem['bsconfigDate'] = AppConstants.getDatePickerConfig();
        } else if (parameterItem.dateType === 'FUTURE') {
          this.toDateControlName.push(parameterIndex);
          parameterItem['bsconfigDate'] = AppConstants.getDatePickerConfig();
        } else {
          parameterItem['bsconfigDate'] = AppConstants.getDatePickerConfig();
        }
      }
      const control = new FormGroup({
        'value': new FormControl(value),
        'column': new FormControl(columnName)
      });
      (<FormArray>this.form.get('filters')).push(control);
    });
    const arciveControl = new FormGroup({
      'value': new FormControl('false'),
      'column': new FormControl('archiveData')
    });
    (<FormArray>this.form.get('filters')).push(arciveControl);
  }

  public onApplyFilter() {
    const filterParemeters = this.form.get('filters').value;
    // (<FormArray>this.form.get('filters')).at(this.data.parameters).patchValue({value: '' + this.isArchiveData});
    filterParemeters[filterParemeters.length - 1].value = '' + this.isArchiveData;
    this.onSearch.emit(filterParemeters);
    this.dialogRef.close();
  }

  public onRestFilter() {
    this.onSearch.emit([]);
    this.dialogRef.close();
  }

  onArchivalData(event: any) {
    this.isArchiveData = event.target.checked;
    let date = this.datePipe.transform(this.archiveDate, 'dd-MM-yyyy');
    if (event.target.checked) {
      date = this.datePipe.transform(this.archiveDate, 'dd-MM-yyyy');
    } else {
      date = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    }
    for (let i = 0; i < this.fromDateControlName.length; i++) {
      (<FormArray>this.form.get('filters')).at(this.fromDateControlName[i]).get('value').patchValue(date);
    }
    for (let i = 0; i < this.toDateControlName.length; i++) {
      (<FormArray>this.form.get('filters')).at(this.toDateControlName[i]).get('value').patchValue(date);
    }
  }
}
