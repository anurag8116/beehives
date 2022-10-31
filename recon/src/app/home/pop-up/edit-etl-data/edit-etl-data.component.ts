import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {isNullOrUndefined} from 'util';
import {FormGroup} from '@angular/forms';
import {DynamicFormLayout, DynamicFormService,
  DynamicInputModel
} from '@ng-dynamic-forms/core';
import {HttpErrorResponse} from '@angular/common/http';
import {MY_FORM_LAYOUT} from './edit.component.layout';
import {ReconDataType} from '../../../shared/services/enum';

@Component({
  selector: 'app-edit-etl-data',
  templateUrl: './edit-etl-data.component.html'
})
export class EditEtlDataComponent implements OnInit {

  private displayInvalidSuccessOnPopUp = 'Invalid Data Successfully Updated !';
  private displayMasterSuccessOnPopUp = 'Master Data Successfully Updated !';

  public formModel = [];
  public form: FormGroup;
  formLayout: DynamicFormLayout = MY_FORM_LAYOUT;
  private displaySuccessOnPopUp: string;
  private rowDataUrl: string;
  private submitUrl: string;
  public headerName: string;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<EditEtlDataComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any, private formService: DynamicFormService,
              private changeDectector: ChangeDetectorRef) { }

  ngOnInit() {
    this.form = new FormGroup({});
    this.setUrl(this.popUpData);
    this.httpService.get(this.rowDataUrl, true).subscribe(
      (data: any) => {
        const keys = Object.keys(data);
        const rowModel = [];
        if (!isNullOrUndefined(keys) && keys.length > 0) {
          const selectkey = this.selectKey(data);
          for (const key of keys) {
            this.createDynamicLayout(key);
            rowModel.push(new DynamicInputModel({
                id: key,
                label: key.toUpperCase(),
                value: data[key],
                readOnly: key === selectkey.toString() ? true : false,
              },
            ));
          }
          this.formModel = rowModel;
          this.form = this.formService.createFormGroup(this.formModel);
          this.changeDectector.detectChanges();
        }
      }
    );
  }

  private setUrl (data: any) {
    switch (data.type) {
      case ReconDataType.EDIT_INVALID_DATA:
        this.headerName = 'Edit Invalid Data';
        this.rowDataUrl = 'v1/invaliddatas/' + this.popUpData.rowId + '?Find=ByDataSource&dataSource=' + this.popUpData.dataSource;
        this.submitUrl = 'v1/invaliddatas/' + this.popUpData.dataSource;
        this.displaySuccessOnPopUp = this.displayInvalidSuccessOnPopUp;
        break;
      case ReconDataType.MASTER_DATA:
        this.headerName = 'Edit Master Data';
        this.rowDataUrl = 'v1/masterdatas/' + this.popUpData.rowId + '?Find=ByMasterData&masterSource=' + this.popUpData.masterSource;
        this.submitUrl = 'v1/masterdatas/' + this.popUpData.masterSource;
        this.displaySuccessOnPopUp = this.displayMasterSuccessOnPopUp;
        break;
      default:
        break;
    }
  }

  public onSubmit() {
    this.httpService.put(this.submitUrl, this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.form.reset();
        this.close();
        this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

  private createDynamicLayout(key: string) {
    let layout = {};
    layout = {
      [key]: {
        element: {
          label: 'control-label'
        },
        grid: {
          container: 'label-align',
          control: 'col-sm-8',
          label: 'col-sm-4',
        }
      }
    };
    Object.assign(this.formLayout, layout);
  }

  private selectKey(rowData: any): number {
    let rowKey;
    if (!isNullOrUndefined(rowData['ID'])) {
      rowKey = 'ID';
    } else if (!isNullOrUndefined(rowData['id'])) {
      rowKey = 'id';
    } else if (!isNullOrUndefined(rowData['Id'])) {
      rowKey = 'Id';
    } else if (!isNullOrUndefined(rowData['iD'])) {
      rowKey = 'iD';
    }
    return rowKey;
  }

}
