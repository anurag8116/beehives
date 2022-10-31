import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FileUploadComponent} from '../../pop-up/file-upload/file-upload.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {TicketDocumentUploadComponent} from '../../pop-up/ticket-document-upload/ticket-document-upload.component';
import {ChangeTicketStatusComponent} from '../../pop-up/change-ticket-status/change-ticket-status.component';
import {AddTicketCommentComponent} from '../../pop-up/add-ticket-comment/add-ticket-comment.component';
import {TicketHistoryComponent} from '../../pop-up/ticket-history/ticket-history.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
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
  declarations: [ListComponent],
  entryComponents: [FileUploadComponent, TicketDocumentUploadComponent, ChangeTicketStatusComponent, AddTicketCommentComponent, TicketHistoryComponent]
})
export class TicketsModule {
}
