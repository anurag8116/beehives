import { RaisePreArbComponent } from './../../pop-up/raise-pre-arb/raise-pre-arb.component';
import { ProcessDisputeComponent } from './../../pop-up/process-dispute/process-dispute.component';
import { DisputeAdvanceComponent } from './../../pop-up/dispute-advance/dispute-advance.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DisputeformComponent} from './form/disputeform.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {ListComponent} from './list/list.component';
import {DisputeQueueComponent} from './dispute-queue/dispute-queue.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {HistoryComponent} from '../../pop-up/history/history.component';
import {TransactionComponent} from '../../pop-up/transaction/transaction.component';
import {ChangeStatusComponent} from '../../pop-up/change-status/change-status.component';
import {DocumentUploadComponent} from '../../pop-up/document-upload/document-upload.component';
import {ViewResponseComponent} from '../../pop-up/view-response/view-response.component';
import {AssignDisputeToRoleComponent} from '../../pop-up/assign-dispute-to-role/assign-dispute-to-role.component';
import { NtrTransactionComponent } from './ntr-transaction/ntr-transaction.component';
import {DisputeFormComponent} from '../../pop-up/dispute-form/dispute-form.component';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list/:processType', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'ntr-transaction', component: NtrTransactionComponent, outlet: 'fullBodyOutlet'},
  {path: 'disputeform/:dataSourceId/:transactionId/:isArchive/:disputeType/:isReversalDispute/:isDualDispute', component: DisputeformComponent, outlet: 'fullBodyOutlet'},
  {path: 'queue', component: DisputeQueueComponent, outlet: 'fullBodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PopUpModule
  ],
  declarations: [ListComponent, DisputeformComponent, DisputeQueueComponent, NtrTransactionComponent],
  entryComponents: [HistoryComponent, TransactionComponent, ChangeStatusComponent, DocumentUploadComponent, ViewResponseComponent, AssignDisputeToRoleComponent, DisputeAdvanceComponent, ProcessDisputeComponent, RaisePreArbComponent, DisputeFormComponent]
})
export class IssuerDisputesModule {
}
