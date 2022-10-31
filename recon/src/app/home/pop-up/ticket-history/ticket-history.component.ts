import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {isNullOrUndefined} from 'util';
import {DomSanitizer} from '@angular/platform-browser';
import {AppConstants} from '../../../shared/services/app.constants';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html'
})
export class TicketHistoryComponent implements OnInit {

  public ticketHistory: any = {transitions: []} ;
  public dataSourceRecord: any = [];
  public showTransactionTable: any = false;
  public Url: any = null;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<TicketHistoryComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.httpService.get('v1/tickets/' + this.popUpData.id, true).subscribe(
      (data: any) => {
        this.ticketHistory = data;

        if (this.ticketHistory.rowIds.length === 1) {
          this.httpService.get('v1/datasources?FindBy=TRANSACTION_DATA&dataSourceId=' + this.ticketHistory.dataSourceId + '&dataRowId=' + this.ticketHistory.rowIds[0], true).subscribe(
            (datadata: any) => {
              if (isNullOrUndefined(datadata)) {
                this.showTransactionTable = false;
              } else {
                console.log(datadata);
                const toKey = Object.keys(datadata);
                for (let j = 0; j < toKey.length; j++) {
                  this.dataSourceRecord.push({name: toKey[j], value: datadata[toKey[j]]});
                }
                this.showTransactionTable = true;
              }
            }
          );
        }
      }
    );

    this.Url = 'v1/ticketdocuments/';
  }

  public close() {
    this.dialogRef.close();
  }

  showDoc(idProofId: number) {
    this.httpService.downloadFile(this.Url + idProofId).subscribe(response => {
      console.log('====response===', response);
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });
  }

  public downloadFile(id: number): any {
    this.httpService.downloadFile(this.Url + id).subscribe(
      (response: any) => {
        console.log('===data====', response);
        const blob = new Blob([response.body], {type: 'application/octet-stream'});
        FileSaver.saveAs(blob, new  Date());
      }
    );
  }

}
