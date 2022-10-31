import {Component, OnInit, Inject} from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ValidationConstant} from '../../../shared/services/validation-constant';
import {ReconDataType} from '../../../shared/services/enum';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../shared/services/app.constants';

@Component({
  selector: 'app-raise-ticket',
  templateUrl: './raise-ticket.component.html'
})
export class RaiseTicketComponent implements OnInit {

  public appusers = [];
  private appUserId = 0;
  private popUpData: any;
  private displaySuccessOnPopUp: string;
  public externalappusers = [];
  public internalappusers = [];
  public types = [{key: 'INTERNAL', value: 'Internal'}, {key: 'EXTERNAL', value: 'External'}];
  public form: FormGroup;
  public formUnmatch: FormGroup;
  private isFileAttached = false;
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerOnlyPast();
  public unMatchTags = [];
  public columns = [];
  public isUnMatchTag = false;

  constructor(private http: HttpService,private httpService: HttpService, private dialogRef: MatDialogRef<RaiseTicketComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.popUpData = this.data;
    this.isUnMatchTag = this.popUpData.data.dataSourceId ? false : true;
    this.form = new FormGroup({
      'title': new FormControl(''),
      'type': new FormControl('INTERNAL'),
      'assignToId': new FormControl(null),
      'comment': new FormControl(null),
      'multipleTicket': new FormControl('YES'),
      'document': new FormArray([
        new FormGroup({
          'path': new FormControl(null),
          'filename': new FormControl(null),
          'title': new FormControl(null)
        })
      ])
    });
    this.formUnmatch = new FormGroup({
      'title': new FormControl(''),
      'unMatchTrxnTag': new FormControl(''),
      'unMatchTrxnTagColumn': new FormControl(''),
      'date': new FormControl(''),
      'dateColumn': new FormControl(''),
      'type': new FormControl('INTERNAL'),
      'assignToId': new FormControl(null),
      'dataSourceId': new FormControl(null),
      'comment': new FormControl(null),
      'multipleTicket': new FormControl('YES'),
      'document': new FormArray([
        new FormGroup({
          'path': new FormControl(null),
          'filename': new FormControl(null),
          'title': new FormControl(null)
        })
      ])
    });
    this.httpService.get('v1/appusers', true).subscribe(
      (data: any) => {
        this.internalappusers = data.data;
        this.appusers = data.data;
      });

    this.httpService.get('v1/appusers/externals', true).subscribe(
      (data: any) => {
        this.externalappusers = data.data;
      });
  }

  public selectAppUser(appUserId: number) {
    this.appUserId = appUserId;
  }

  public selectType(type: string) {
    this.appusers =  type === 'INTERNAL' ? this.internalappusers : this.externalappusers;
  }

  public selectDataSource(datasourceId: number) {
    let table = '';
    this.popUpData.dataSources.forEach((item, index) => {
      if(item.datasourceVo.id == datasourceId) {
        table = item.datasourceVo.table;
      }
    });
    this.http.get('v1/rules?Find=UnMatchTags&dataSourceId='+datasourceId, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.length > 0) {
          this.unMatchTags = data;
        } else {
          this.unMatchTags = [];
        }
      }
    );

    this.httpService.get('v1/datatables/columns?table=' + table + '&start=0', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.length > 0) {
          this.columns = data;
        }
      }
    );
  }

  public fileChangeEvent(event: any, index: number) {
    this.isFileAttached = true;
    if (this.isUnMatchTag) {
      (<FormArray>this.formUnmatch.get('document')).at(index).patchValue({path: event.filePath, filename: event.fileName});
    } else {
      (<FormArray>this.form.get('document')).at(index).patchValue({path: event.filePath, filename: event.fileName});
    }
  }

  public setDate(val: string): void {
    this.formUnmatch.get('date').patchValue(val);
  }

  public onAssignSubmit() {
    if (this.appUserId !== 0) {
      if(this.isUnMatchTag){
        const savedata = this.popUpData.data;
        savedata['assignToId'] = this.appUserId;
        savedata['type'] = this.formUnmatch.value.type;
        savedata['comment'] = this.formUnmatch.value.comment;
        savedata['title'] = this.formUnmatch.value.title;
        savedata['dateColumn'] = this.formUnmatch.value.dateColumn;
        savedata['date'] = this.formUnmatch.value.date;
        savedata['unMatchTrxnTag'] = this.formUnmatch.value.unMatchTrxnTag;
        savedata['unMatchTrxnTagColumn'] = this.formUnmatch.value.unMatchTrxnTagColumn;
        savedata['dataSourceId'] = this.formUnmatch.value.dataSourceId;
        savedata['multipleTicket'] = this.formUnmatch.value.multipleTicket;
        if (this.isFileAttached) {
          savedata['document'] = this.formUnmatch.value.document;
        }
        this.httpService.post('v1/tickets?OperationType=UnMatchTrnTicket', savedata, true).subscribe(
          (data: any) => {
            this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
            this.close();
          },
          (errorResponse: HttpErrorResponse) => {
          }
        );
      } else {
        const savedata = this.popUpData.data;
        savedata['assignToId'] = this.appUserId;
        savedata['type'] = this.form.value.type;
        savedata['comment'] = this.form.value.comment;
        savedata['title'] = this.form.value.title;
        savedata['multipleTicket'] = this.form.value.multipleTicket;
        if (this.isFileAttached) {
          savedata['document'] = this.form.value.document;
        }
        this.httpService.post('v1/tickets', savedata, true).subscribe(
          (data: any) => {
            this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
            this.close();
          },
          (errorResponse: HttpErrorResponse) => {
          }
        );
      }
    } else {
       this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_USER);
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
