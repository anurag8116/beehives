import { RaisePreArbComponent } from './../../pop-up/raise-pre-arb/raise-pre-arb.component';
import { TransactionComponent } from './../../pop-up/transaction/transaction.component';
import { HistoryComponent } from './../../pop-up/history/history.component';
import { DocumentUploadComponent } from './../../pop-up/document-upload/document-upload.component';
import { ChangeStatusComponent } from './../../pop-up/change-status/change-status.component';
import { PopUpModule } from './../../pop-up/pop-up.module';
import { DisputeAdvanceComponent } from './../../pop-up/dispute-advance/dispute-advance.component';
import { ProcessDisputeComponent } from './../../pop-up/process-dispute/process-dispute.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailComponent } from './detail/detail.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'fullBodyOutlet'}
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
  declarations: [DetailComponent],
  entryComponents: [
    ProcessDisputeComponent, 
    DisputeAdvanceComponent, 
    ChangeStatusComponent, 
    DocumentUploadComponent, 
    HistoryComponent, 
    TransactionComponent,
    RaisePreArbComponent
  ]
})
export class SharedDisputeModule { }
