import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DisputeQueueComponent} from './dispute-queue/dispute-queue.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {HistoryComponent} from '../../pop-up/history/history.component';
import {TransactionComponent} from '../../pop-up/transaction/transaction.component';
import {ProcessComponent} from '../../pop-up/process/process.component';
import {ChangeStatusComponent} from '../../pop-up/change-status/change-status.component';
import {AssignDisputeToRoleComponent} from '../../pop-up/assign-dispute-to-role/assign-dispute-to-role.component';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list/:processType', component: ListComponent, outlet: 'fullBodyOutlet'},
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
  declarations: [ListComponent, DisputeQueueComponent],
  entryComponents: [HistoryComponent, TransactionComponent, ProcessComponent, AssignDisputeToRoleComponent]
})
export class AcquirerArbitrationModule {
}
