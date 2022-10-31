import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import { ViewComponent } from './view/view.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsBootstrapUIModule} from '@ng-dynamic-forms/ui-bootstrap';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {SubmitMultipleRowsComponent} from '../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {TimelineCharComponent} from '../../pop-up/timeline-char/timeline-char.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {RaiseTicketComponent} from '../../pop-up/raise-ticket/raise-ticket.component';
import {TicketHistoryComponent} from '../../pop-up/ticket-history/ticket-history.component';


export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'list', component: ListComponent, outlet: 'sideOutlet'},
  {path: 'view/:id', component: ViewComponent, outlet: 'bodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    PopUpModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [ListComponent, ViewComponent],
  entryComponents: [SubmitMultipleRowsComponent, TimelineCharComponent, RaiseTicketComponent, TicketHistoryComponent]
})
export class UnmatchedTransactionModule { }
