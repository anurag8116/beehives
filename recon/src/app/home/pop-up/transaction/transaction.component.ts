import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {isNullOrUndefined} from 'util';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html'
})
export class TransactionComponent implements OnInit {

  public dataSourceRecord: any = [];
  public showTransactionTable: any = false;
  public tableCoumnsOrders = [
    {
        "title": "ID",
        "data": "ID"
    },
    {
        "title": "STATUS",
        "data": "STATUS"
    },
    {
        "title": "ACK STATUS",
        "data": "ACK_STATUS"
    },
    {
        "title": "CH",
        "data": "CH"
    },
    {
        "title": "TXN_DATE_AND_TIME",
        "data": "TXN_DATE_AND_TIME"
    },
    {
        "title": "CARD_NUMBER",
        "data": "CARD_NUMBER"
    },
    {
        "title": "PROXY_CARD_NUMBER",
        "data": "PROXY_CARD_NUMBER"
    },
    {
        "title": "ACTIVATION_DATE",
        "data": "ACTIVATION_DATE"
    },
    {
        "title": "MTI",
        "data": "MTI"
    },
    {
        "title": "PRODUCT_CODE",
        "data": "PRODUCT_CODE"
    },
    {
        "title": "TXN_CODE",
        "data": "TXN_CODE"
    },
    {
        "title": "BIN",
        "data": "BIN"
    },
    {
        "title": "TXN_POSTAL_DATE",
        "data": "TXN_POSTAL_DATE"
    },
    {
        "title": "TXN_REF_NO",
        "data": "TXN_REF_NO"
    },
    {
        "title": "TXN_DESCRIPTION",
        "data": "TXN_DESCRIPTION"
    },
    {
        "title": "TXN_CURRENCY",
        "data": "TXN_CURRENCY"
    },
    {
        "title": "TXN_AMOUNT",
        "data": "TXN_AMOUNT"
    },
    {
        "title": "BILLING_CURRENCY",
        "data": "BILLING_CURRENCY"
    },
    {
        "title": "BILLING_AMOUNT",
        "data": "BILLING_AMOUNT"
    },
    {
        "title": "DEBIT_CREDIT_INDICATOR",
        "data": "DEBIT_CREDIT_INDICATOR"
    },
    {
        "title": "EXCHANGE_RATE",
        "data": "EXCHANGE_RATE"
    },
    {
        "title": "AUTH_ID",
        "data": "AUTH_ID"
    },
    {
        "title": "NETWORK",
        "data": "NETWORK"
    },
    {
        "title": "MCC",
        "data": "MCC"
    },
    {
        "title": "EXCHANGE_RATE_1",
        "data": "EXCHANGE_RATE_1"
    },
    {
        "title": "MERCHANT_ID",
        "data": "MERCHANT_ID"
    },
    {
        "title": "MERCHANT_NAME_LOCATION",
        "data": "MERCHANT_NAME_LOCATION"
    },
    {
        "title": "TERMINAL_ID",
        "data": "TERMINAL_ID"
    },
    {
        "title": "MERCHANT_COUNTRY_CODE",
        "data": "MERCHANT_COUNTRY_CODE"
    },
    {
        "title": "RESP_CODE",
        "data": "RESP_CODE"
    },
    {
        "title": "TXN_STATUS",
        "data": "TXN_STATUS"
    },
    {
        "title": "RRN",
        "data": "RRN"
    },
    {
        "title": "STAN",
        "data": "STAN"
    },
    {
        "title": "DESCRIPTION",
        "data": "DESCRIPTION"
    },
    {
        "title": "NWDATA",
        "data": "NWDATA"
    },
    {
      "title": "TXN_STATUS_ACK",
      "data": "TXN_STATUS_ACK"
    },
    {
      "title": "SETTLEMENT_STATUS",
      "data": "SETTLEMENT_STATUS"
    },
    {
      "title": "SETTLEMENT_DATE",
      "data": "SETTLEMENT_DATE"
    },
    {
      "title": "SETTLEMENT_AMOUNT",
      "data": "SETTLEMENT_AMOUNT"
    },
    {
      "title": "SOURCE",
      "data": "SOURCE"
    },
    {
      "title": "AUTH_TCC",
      "data": "AUTH_TCC"
    }
    ];

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<TransactionComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any, private datePipe: DatePipe) { }

  ngOnInit() {
    this.httpService.get('v1/ntrtransaction?Find=ByDispute&disputeId=' + this.popUpData.id, true).subscribe(
      (data: any) => {
        if (isNullOrUndefined(data)) {
          this.showTransactionTable = false;
        } else {
          this.tableCoumnsOrders.forEach(columnData => {
            let value = data[columnData.data];
            if(value && columnData.data && columnData.data == 'TXN_DATE_AND_TIME') {
              value = this.datePipe.transform(value, 'dd-MM-yyyy hh:mm a');
            } else if(value && columnData.data && columnData.data == 'SETTLEMENT_DATE') {
              value = this.datePipe.transform(value, 'dd-MM-yyyy');
          }
            this.dataSourceRecord.push({name: columnData.title, value: value});
          });
          this.showTransactionTable = true;
        }
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
