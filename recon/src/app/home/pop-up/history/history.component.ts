import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {

  public disputeHistory: any = [];
  hasDisputeHistory = false;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<HistoryComponent>, @Inject(MAT_DIALOG_DATA) public popUpData: any) { }

  ngOnInit() {
    if(this.popUpData.id) {
    this.httpService.get('v1/dispute/' + this.popUpData.id + '/histories/', true).subscribe(
      (data: any) => {
        this.disputeHistory = data.data;
          this.hasDisputeHistory = true;
      }
    );
    } else if(this.popUpData.transactionId) {
      this.httpService.get('v1/ntrtransaction/' + this.popUpData.transactionId + '/history?dataSourceId=' + this.popUpData.dataSourceId, true).subscribe(
        (data: any) => {
          this.disputeHistory = data;
        }
      );
    }
  }

  public close() {
    this.dialogRef.close();
  }

}
