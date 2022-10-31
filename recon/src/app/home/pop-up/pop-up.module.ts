import {CommonModule} from '@angular/common';
import {AssignToUserComponent} from './assign-to-user/assign-to-user.component';
import {MatDialogModule} from '@angular/material/dialog';
import {EditEtlDataComponent} from './edit-etl-data/edit-etl-data.component';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsBootstrapUIModule} from '@ng-dynamic-forms/ui-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SubmitMultipleRowsComponent} from './submit-multiple-rows/submit-multiple-rows.component';
import {FileUploadComponent} from './file-upload/file-upload.component';
import {SharedModule} from '../../shared/shared.module';
import {HistoryComponent} from './history/history.component';
import {CreatePipelineComponent} from './create-pipeline/create-pipeline.component';
import {TimelineCharComponent} from './timeline-char/timeline-char.component';
import {ProposeMatchComponent} from './propose-match/propose-match.component';
import {TransactionComponent} from './transaction/transaction.component';
import {ProcessComponent} from './process/process.component';
import {ChangeStatusComponent} from './change-status/change-status.component';
import {DocumentUploadComponent} from './document-upload/document-upload.component';
import {ViewResponseComponent} from './view-response/view-response.component';
import {AssignDisputeToRoleComponent} from './assign-dispute-to-role/assign-dispute-to-role.component';
import {PreviewPipelineErrorComponent} from './preview-pipeline-error/preview-pipeline-error.component';
import {RaiseTicketComponent} from './raise-ticket/raise-ticket.component';
import {TicketDocumentUploadComponent} from './ticket-document-upload/ticket-document-upload.component';
import {ChangeTicketStatusComponent} from './change-ticket-status/change-ticket-status.component';
import {AddTicketCommentComponent} from './add-ticket-comment/add-ticket-comment.component';
import {TicketHistoryComponent} from './ticket-history/ticket-history.component';
import { RegisterUserComponent } from './register-user/register-user.component';
import { DisputeAdvanceComponent } from './dispute-advance/dispute-advance.component';
import { ProcessDisputeComponent } from './process-dispute/process-dispute.component';
import { RaisePreArbComponent } from './raise-pre-arb/raise-pre-arb.component';
import { DisputeFormComponent } from './dispute-form/dispute-form.component';
import { CashbackFileUploadComponent } from './cashback-file-upload/cashback-file-upload.component';
import { InvoiceReportFormComponent } from './invoice-report-form/invoice-report-form.component';


@NgModule({
  declarations: [AssignToUserComponent, EditEtlDataComponent, SubmitMultipleRowsComponent, FileUploadComponent, HistoryComponent,
    CreatePipelineComponent, TimelineCharComponent, ProposeMatchComponent, TransactionComponent, ProcessComponent, ChangeStatusComponent,
    DocumentUploadComponent, ViewResponseComponent, AssignDisputeToRoleComponent, PreviewPipelineErrorComponent, RaiseTicketComponent,
    TicketDocumentUploadComponent, ChangeTicketStatusComponent, AddTicketCommentComponent, TicketHistoryComponent, RegisterUserComponent,
     DisputeAdvanceComponent, ProcessDisputeComponent, RaisePreArbComponent, DisputeFormComponent, CashbackFileUploadComponent, InvoiceReportFormComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    AssignToUserComponent, CreatePipelineComponent, AssignDisputeToRoleComponent, PreviewPipelineErrorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class PopUpModule {
}
