import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../shared/services/app.constants';
import {HttpService} from '../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import * as FileSaver from 'file-saver';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dispute-form',
  templateUrl: './dispute-form.component.html'
})
export class DisputeFormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public dataSourceId: number;
  public transactionId: number;
  public isArchive = false;
  public isReversalDispute = false;
  public isDualDispute = false;
  public disputeCategories = [];
  public disputeTypes = [];
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public formattedReplyBsConf: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public disputeType = null;
  disputeId = null;
  stage = null;
  isEditMode = false;
  cbHoverTitle = '';
  goodFaithHoverTitle = '';
  trxnTimeMsg = '';


  get formattedReplyTypeControl(): FormControl {
    return this.form.controls.formattedReplyType as FormControl;
  }

  get formattedReplyFileNameControl(): FormControl {
    return this.form.controls.formattedReplyFileName as FormControl;
  }

  get formattedReplyFilePathControl(): FormControl {
    return this.form.controls.formattedReplyFilePath as FormControl;
  }

  get firFileNameControl(): FormControl {
    return this.form.controls.firFileName as FormControl;
  }

  get firFilePathControl(): FormControl {
    return this.form.controls.firFilePath as FormControl;
  }

  get customerDocumentFileNameControl(): FormControl {
    return this.form.controls.customerDocumentFileName as FormControl;
  }

  get customerDocumentFilePathControl(): FormControl {
    return this.form.controls.customerDocumentFilePath as FormControl;
  }

  get reversalDocumentFileNameControl(): FormControl {
    return this.form.controls.reversalDocumentFileName as FormControl;
  }

  get reversalDocumentFilePathControl(): FormControl {
    return this.form.controls.reversalDocumentFilePath as FormControl;
  }

  get stageControl(): FormControl {
    return this.form.controls.stage as FormControl;
  }

  get disputeCategoryIdControl(): FormControl {
    return (this.form.controls.disputeCategory as FormGroup).controls.id as FormControl;
  }

  get disputeTypeIdControl(): FormControl {
    return (this.form.controls.disputeType as FormGroup).controls.id as FormControl;
  }

  constructor(private httpService: HttpService, private router: Router, private activatedRout: ActivatedRoute,
              private datePipe: DatePipe, @Inject(MAT_DIALOG_DATA) public popUpData: any,
              private dialogRef: MatDialogRef<DisputeFormComponent>) {
  }

  ngOnInit() {
    this.getDisputeCategories();
    this.disputeId = this.popUpData.disputeId || null;
    this.dataSourceId = this.popUpData.dataSourceId || null;
    this.transactionId = this.popUpData.transactionId || null;
    this.isArchive = this.popUpData.isArchive || false;
    this.isReversalDispute = this.popUpData.isReversalDispute ? JSON.parse(this.popUpData.isReversalDispute) : false;
    this.isDualDispute = this.popUpData.isDualDispute ? JSON.parse(this.popUpData.isDualDispute) : false;
    this.disputeType = this.popUpData.disputeType || null;
    if (this.disputeId) {
      this.isEditMode = true;
    }

    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(this.disputeId),
      dataSource: new FormGroup({
        id: new FormControl(this.dataSourceId)
      }),
      ticketNumber: new FormControl(null),
      isArchive: new FormControl(null),
      isReversalDispute: new FormControl(null),
      isDualDispute: new FormControl(null),
      disputeAmount: new FormControl(null),
      formattedReplyFileName: new FormControl(null),
      formattedReplyFilePath: new FormControl(null),
      firFileName: new FormControl(null),
      firFilePath: new FormControl(null),
      customerDocumentFileName: new FormControl(null),
      customerDocumentFilePath: new FormControl(null),
      reversalDocumentFileName: new FormControl(null),
      reversalDocumentFilePath: new FormControl(null),
      formattedReplyDate: new FormControl(null),
      disputeCategory: new FormGroup({
        id: new FormControl(null)
      }),
      disputeType: new FormGroup({
        id: new FormControl(null)
      }),
      issueType: new FormControl(null),
      disputeReason: new FormControl(null),
      formattedReplyType: new FormControl(null),
      cardNumber: new FormControl(null),
      customerName: new FormControl(null),
      customerEmail: new FormControl(null),
      customerAddress: new FormControl(null),
      customerTelephone: new FormControl(null),
      transactionId: new FormControl(null),
      transactionDateAndTime: new FormControl(null),
      transactionAmount: new FormControl(null),
      billingAmount: new FormControl(null),
      transactionCode: new FormControl(null),
      kitNumber: new FormControl(null),
      merchantId: new FormControl(null),
      merchantName: new FormControl(null),
      settlementDate: new FormControl(null),
      transactionStatus: new FormControl(null),
      settlementStatus: new FormControl(null),
      networkData: new FormControl(null),
      rrn: new FormControl(null),
      settlementAmount: new FormControl(null),
      authorizeTransactionAmount: new FormControl(null),
      authorizeTransactionOn: new FormControl(null),
      transactionDuplicatedOn: new FormControl(null),
      incorrectTransactionAmount: new FormControl(null),
      notProcessedOn: new FormControl(null),
      cancelledOn: new FormControl(null),
      contactedMerchantOn: new FormControl(null),
      serviceExpectedOn: new FormControl(null),
      stage: new FormControl('CHARGE_BACK'),
      type: new FormControl(this.disputeType)
    });
    this.form.patchValue({isReversalDispute: this.isReversalDispute});
    this.form.patchValue({isDualDispute: this.isDualDispute});

    if (!this.isEditMode) { this.getTransactionDetail(); } else { this.getDisputeDetail(); }
  }

  getDisputeDetail() {
    this.httpService.get(`v1/disputes/${this.disputeId}`, true).subscribe(
      (data: any) => {
        this.isReversalDispute = data.isReversalDispute;
        this.isDualDispute = data.isDualDispute;
        if (data.disputeCategory && data.disputeCategory.id) { this.assignDisputeType(data.disputeCategory.id); }
        const txnDate = this.datePipe.transform(data.transactionDateAndTime, 'dd-MM-yyyy hh:mm');
        this.formattedReplyBsConf = AppConstants.getDatePickerOnlyFuture(new Date(data.transactionDateAndTime).toString());
        const formData = {
          ...data,
          disputeCategory: (data.disputeCategory && data.disputeCategory.id) ? data.disputeCategory : {},
          disputeType: (data.disputeType && data.disputeType.id) ? data.disputeType : {},
          formattedReplyDate: this.datePipe.transform(data.formattedReplyDate, 'dd-MM-yyyy'),
          authorizeTransactionOn: this.datePipe.transform(data.authorizeTransactionOn, 'dd-MM-yyyy'),
          transactionDuplicatedOn: this.datePipe.transform(data.transactionDuplicatedOn, 'dd-MM-yyyy'),
          notProcessedOn: this.datePipe.transform(data.notProcessedOn, 'dd-MM-yyyy'),
          cancelledOn: this.datePipe.transform(data.cancelledOn, 'dd-MM-yyyy'),
          contactedMerchantOn: this.datePipe.transform(data.contactedMerchantOn, 'dd-MM-yyyy'),
          serviceExpectedOn: this.datePipe.transform(data.serviceExpectedOn, 'dd-MM-yyyy'),
          transactionDateAndTime: txnDate,
          settlementDate: this.datePipe.transform(data.settlementDate, 'dd-MM-yyyy')
        };
        this.form.patchValue(formData);
        this.stage = this.stageControl.value;
        this.stageControl.disable();
      });
  }

  getTransactionDetail() {
    this.httpService.get(`v1/ntrtransaction/${this.transactionId}?dataSourceId=${this.dataSourceId}&isArchive=${this.isArchive}`, true).subscribe(
      (data: any) => {
        const currentDate = new Date();
        const txnDate = new Date(data.TXN_DATE_AND_TIME);
        const dateDiff = AppConstants.getDateDiff(currentDate, txnDate);
        this.formattedReplyBsConf = AppConstants.getDatePickerOnlyFuture(txnDate.toString());
        if (dateDiff < 115) {
          this.stageControl.setValue('CHARGE_BACK');
          this.stageControl.disable();
          this.cbHoverTitle = '';
          this.goodFaithHoverTitle = 'Transaction date is within 120 days';
          this.trxnTimeMsg = '(Transaction date is within 120 days, you can only raise chargeback)';
        } else if (dateDiff > 120) {
          this.stageControl.setValue('GOOD_FAITH');
          this.stageControl.disable();
          this.cbHoverTitle = 'Transaction date exceeds 120 days';
          this.goodFaithHoverTitle = '';
          this.trxnTimeMsg = '(Transaction date exceeds 120 days, you can only raise goodfaith)';
        } else {
          this.stageControl.setValue(null);
          this.stageControl.enable();
          this.cbHoverTitle = '';
          this.goodFaithHoverTitle = '';
          this.trxnTimeMsg = '(Dispute time frame is near)';
          this.httpService.displaySuccessOnPopUp('Dispute Time Frame is Near !');
        }
        this.stage = this.stageControl.value;

        const formData = {
          isArchive: this.isArchive,
          cardNumber: data.CARD_NUMBER,
          transactionId: data.ID,
          transactionDateAndTime: this.datePipe.transform(data.TXN_DATE_AND_TIME, 'dd-MM-yyyy hh:mm'),
          transactionAmount: data.TXN_AMOUNT,
          billingAmount: data.BILLING_AMOUNT,
          transactionCode: data.TXN_CODE,
          kitNumber: data.PROXY_CARD_NUMBER,
          merchantId: data.MERCHANT_ID,
          merchantName: data.MERCHANT_NAME_LOCATION,
          settlementDate: this.datePipe.transform(data.SETTLEMENT_DATE, 'dd-MM-yyyy'),
          transactionStatus: data.TXN_STATUS_ACK,
          settlementStatus: data.SETTLEMENT_STATUS,
          networkData: data.NWDATA,
          rrn: data.RRN,
          settlementAmount: data.SETTLEMENT_AMOUNT
        };
        this.form.patchValue(formData);
      });
  }

  getDisputeCategories() {
    this.httpService.get('v1/disputes/category', true).subscribe(
      (data: any) => {
        this.disputeCategories = data;
        if (this.disputeCategoryIdControl.value) { this.assignDisputeType(this.disputeCategoryIdControl.value); }
      });
  }

  onDisputeCategoryChange(disputeCategoryId) {
    this.disputeTypeIdControl.setValue(null);
    this.form.patchValue({firFilePath: null, firFileName: null});
    if (disputeCategoryId) {
      this.assignDisputeType(disputeCategoryId);
    } else {
      this.disputeTypes = [];
    }
  }

  assignDisputeType(disputeCategoryId) {
    if (disputeCategoryId) {
      const index = this.getDisputeCategoryIndex(disputeCategoryId);
      if (index >= 0) {
        this.disputeTypes = this.disputeCategories[index].types;
      } else {
        this.disputeTypes = [];
      }
    }
  }

  getDisputeCategoryIndex(id: number): number {
    return this.disputeCategories.findIndex((category) => category.id == id);
  }

  onFormattedReplyTypeChange(formattedReplyType) {
    const formValue = {
      authorizeTransactionAmount: null,
      authorizeTransactionOn: null,
      transactionDuplicatedOn: null,
      incorrectTransactionAmount: null,
      notProcessedOn: null,
      cancelledOn: null,
      contactedMerchantOn: null,
      serviceExpectedOn: null
    };
    this.form.patchValue(formValue);
  }

  public onFormattedReplyFileSelect(files: any[]) {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({formattedReplyFilePath: (reader.result as any).split(',')[1], formattedReplyFileName: file.name});
      };
    } else {
      this.form.patchValue({formattedReplyFilePath: null, formattedReplyFileName: null});
    }
  }

  public onFirFileSelect(files: any[]) {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({firFilePath: (reader.result as any).split(',')[1], firFileName: file.name});
      };
    } else {
      this.form.patchValue({firFilePath: null, firFileName: null});
    }
  }

  public onCustomerDocumentSelect(files: any[]) {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({customerDocumentFilePath: (reader.result as any).split(',')[1], customerDocumentFileName: file.name});
      };
    } else {
      this.form.patchValue({customerDocumentFilePath: null, customerDocumentFileName: null});
    }
  }

  public onReversalDocumentSelect(files: any[]) {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({reversalDocumentFilePath: (reader.result as any).split(',')[1], reversalDocumentFileName: file.name});
      };
    } else {
      this.form.patchValue({reversalDocumentFileName: null, reversalDocumentFilePath: null});
    }
  }

  onSubmit(sendForApprove = false) {
    this.isLoading = true;
    let rawForm = this.form.getRawValue();
    rawForm = {...rawForm, sendForApprove: sendForApprove};
    this.stage = this.stageControl.value;
    if  (this.disputeId) {
      this.httpService.put('v1/disputes', rawForm, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Dispute Successfully Updated !');
          this.dialogRef.close('refresh');
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.httpService.post('v1/disputes', rawForm, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp(sendForApprove ? 'Dispute successfully created and send for approval !' : 'Dispute successfully created !');
          this.dialogRef.close('refresh');
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  onDownload(fileName, filePath) {
    const blob = AppConstants.base64ToBlob(filePath, fileName);
    FileSaver.saveAs(blob, fileName);
  }

  public close() {
    this.dialogRef.close();
  }
}
