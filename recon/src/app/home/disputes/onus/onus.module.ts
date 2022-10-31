import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {OnusQueueComponent} from './onus-queue/onus-queue.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {HistoryComponent} from '../../pop-up/history/history.component';
import {TransactionComponent} from '../../pop-up/transaction/transaction.component';
import {ProcessComponent} from '../../pop-up/process/process.component';
import {AssignDisputeToRoleComponent} from '../../pop-up/assign-dispute-to-role/assign-dispute-to-role.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'queue', component: OnusQueueComponent, outlet: 'fullBodyOutlet'}
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
  declarations: [ListComponent, OnusQueueComponent],
  entryComponents: [HistoryComponent, TransactionComponent, ProcessComponent, AssignDisputeToRoleComponent]
})
export class OnusModule {
}
