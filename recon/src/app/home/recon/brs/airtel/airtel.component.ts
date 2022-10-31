import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-airtel',
  templateUrl: './airtel.component.html',
  styleUrls: ['./airtel.component.css']
})
export class AirtelComponent implements OnInit {

  public form: FormGroup;
  public recons: any[] = [];
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public reportData: any = [];

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      'reconId': new FormControl(null),
      'asOnDate': new FormControl(null)
    });

    this.getRecons();
  }

  getRecons() {
    this.httpService.get('v1/recons', true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
  }

  getReport(reconId,date) {
    let errorMsg = '';
    if (!reconId || reconId === 'null') {
      errorMsg += 'Recon is required.' + '<br>';
    }
    if (!date || date === 'null') {
      errorMsg += 'Date is required.' + '<br>';
    }
    if (errorMsg) {
      this.httpService.displayErrorOnPopUp(errorMsg);
    }
    if (reconId) {
      this.httpService.get('v1/brsreports?airtel&reconId=' + reconId+'&date=' + date, true).subscribe(
        (data: any) => {
          this.reportData = data;
        }
      );
    }
  }

  public downloadReport(id: number): any {
    this.httpService.get('v1/brsreports/download?reconId=' + id, true).subscribe(
      (data: any) => {
        FileSaver.saveAs(AppConstants.base64ToExcel(data.filePath), 'Brs Report ' + new Date());
      }
    );
  }


}
