import { RaisePreArbComponent } from './../../../pop-up/raise-pre-arb/raise-pre-arb.component';
import { TransactionComponent } from './../../../pop-up/transaction/transaction.component';
import { DocumentUploadComponent } from './../../../pop-up/document-upload/document-upload.component';
import { ChangeStatusComponent } from './../../../pop-up/change-status/change-status.component';
import { HistoryComponent } from './../../../pop-up/history/history.component';
import { AuthService } from './../../../../shared/services/auth.service';
import { MatDialog } from '@angular/material';
import { DisputeAdvanceComponent } from './../../../pop-up/dispute-advance/dispute-advance.component';
import { ProcessDisputeComponent } from './../../../pop-up/process-dispute/process-dispute.component';
import { AppConstants } from './../../../../shared/services/app.constants';
import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  public id: number;
  public dispute: any = {};
  public disputeHistory: any = {activity: []};
  public Url: any = null;
  public disputeDocument: any = [];
  hasRoleCardOps = false;
  hasRoleCX = false;
  hasRoleM2p = false;

  constructor(private httpService: HttpService, private activatedRout: ActivatedRoute, private _location: Location, 
    private dialog: MatDialog, private authService: AuthService) {
      this.hasRoleCardOps = this.authService.hasRoleCardOps();
      this.hasRoleCX = this.authService.hasRoleCX();
      this.hasRoleM2p = this.authService.hasRoleM2p();
  }

  ngOnInit() {
    this.activatedRout.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      this.getDisputeData();
    });
    this.Url = 'v1/disputedocuments/';
  }

  getDisputeData() {
      if (this.id) {
        this.httpService.get('v1/disputes/' + this.id, true).subscribe(
          (data: any) => {
            this.dispute = data;

            this.httpService.get('v1/dispute/' + this.id + '/histories/', true).subscribe(
              (res: any) => {
                this.disputeHistory = res.data;
              }
            );
          // this.httpService.get('v1/disputedocuments?Find=ByDispute&disputeId=' + this.id, true).subscribe(
          //   (response: any) => {
          //     this.disputeDocument = response.data;
          //   }
          // );
              }
            );
          }
  }

  export() {
    if (!this.dispute || !this.dispute.id)
      return;
    this.httpService.downloadFile('v1/disputes/export/' + this.dispute.id).subscribe(
      (fileData: any) => {
        FileSaver.saveAs(fileData, this.dispute.rrn + '_CONSUMER_FORM.pdf');
      }
        );
      }

  showDoc(idProofId: number, fileName: string) {
    this.httpService.downloadFile(this.Url + idProofId).subscribe(response => {
      FileSaver.saveAs(response, fileName);
    });
  }

  onDownload(fileName: string, filePath: string) {
    const blob = AppConstants.base64ToBlob(filePath, fileName);
    FileSaver.saveAs(blob, fileName);
  }

  public onHistory() {
    let disputeId = this.dispute.id;
    const data = {id: disputeId};
    this.dialog.open(HistoryComponent, {width: '900px', height: '568px', data});
  }

  public onProcess() {
    const disputeId = this.dispute.id;
    const stage = this.dispute.stage;
    const status = this.dispute.status;
    const data = {rowList: [{ids: disputeId}], stage: stage, status: status};
    
    const dialogRef = this.dialog.open(ChangeStatusComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onRaiseByM2P() {
    let disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}], status: 'RAISED_BY_M2P', heading: 'M2P Response'};
    const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  public onTransactionClick() {
    const disputeId = this.dispute.id;
    const data = {id: disputeId};
    this.dialog.open(TransactionComponent, {width: '600px', height: '354px', data});
  }

  public onDocument() {
    const disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}]};
    const dialogRef = this.dialog.open(DocumentUploadComponent, {width: '600px', height: '229px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onRaisePreArb() {
    const disputeId = this.dispute.id;
    const data = {id: disputeId};
    const dialogRef = this.dialog.open(RaisePreArbComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onSendForApproval() {
    let disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}], status: 'SEND_FOR_APPROVAL', heading: 'Send for Approval'};
    const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onApprove() {
    let disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}], status: 'APPROVED', heading: 'Approve'};
    const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onReject() {
    let disputeId = this.dispute.id;
      const data = {rowList: [{ids: disputeId}], status: this.hasRoleM2p ? 'REJECTED_BY_M2P' : 'REJECTED', heading: 'Reject'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.getDisputeData();
      });
  }

  onCloseDispute() {
    let disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}], status: 'CLOSED', heading: 'Close Dispute'};
    const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '450px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onAdvancePayment() {
    let disputeId = this.dispute.id;
    const data = {id: disputeId};
    const dialogRef = this.dialog.open(DisputeAdvanceComponent, {width: '600px', height: '317px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  onRefundProcess() {
    let disputeId = this.dispute.id;
    const data = {rowList: [{ids: disputeId}], status: 'REFUND_PROCESSED', heading: 'Process Refund'};
    const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '450', data});
    dialogRef.afterClosed().subscribe(result => {
      this.getDisputeData();
    });
  }

  backClick() {
    this._location.back();
  }

  downloadAll() {
    let zip = new JSZip();
    const name = this.dispute.rrn + '.zip';
    this.dispute.customerDocumentFileName != null ? zip.file(this.dispute.customerDocumentFileName, AppConstants.base64ToBlob(this.dispute.customerDocumentFilePath, this.dispute.customerDocumentFileName)) : null;
    this.dispute.reversalDocumentFileName != null ? zip.file(this.dispute.reversalDocumentFileName, AppConstants.base64ToBlob(this.dispute.reversalDocumentFilePath, this.dispute.reversalDocumentFileName)) : null;
    this.dispute.firFileName != null ? zip.file(this.dispute.firFileName, AppConstants.base64ToBlob(this.dispute.firFilePath, this.dispute.firFileName)) : null;
    this.dispute.formattedReplyFileName != null ? zip.file(this.dispute.formattedReplyFileName, AppConstants.base64ToBlob(this.dispute.formattedReplyFilePath, this.dispute.formattedReplyFileName)) : null;

    if (this.dispute.merchantProofFiles != null) {
      this.dispute.merchantProofFiles.forEach(file => {
        file.merchantProofFileName != null ? zip.file(file.merchantProofFileName, AppConstants.base64ToBlob(file.merchantProofFilePath, file.merchantProofFileName)) : null;
      });
    }

    this.dispute.merchantProofFileName != null ? zip.file(this.dispute.merchantProofFileName, AppConstants.base64ToBlob(this.dispute.merchantProofFilePath, this.dispute.merchantProofFileName)) : null;
    this.dispute.advanceRefundFileName != null ? zip.file(this.dispute.advanceRefundFileName, AppConstants.base64ToBlob(this.dispute.advanceRefundFilePath, this.dispute.advanceRefundFileName)) : null;

    if (!(this.dispute.isReversalDispute || this.dispute.isDualDispute)) {
      this.httpService.downloadFile('v1/disputes/export/' + this.dispute.id).subscribe(
        (fileData: any) => {
          zip.file(this.dispute.rrn + '_CONSUMER_FORM.pdf', fileData);
          setTimeout(() => {
            zip.generateAsync({ type: 'blob' })
              .then(function (content) {
                FileSaver.saveAs(content, name);
              });
          }, 3000);
        }
      );
    } else {
      setTimeout(() => {
        zip.generateAsync({ type: 'blob' })
          .then(function (content) {
            FileSaver.saveAs(content, name);
          });
      }, 3000);
    }
  }
}
