import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {FileUploadComponent} from '../../pop-up/file-upload/file-upload.component';
import {SubmitMultipleRowsComponent} from '../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {TimelineCharComponent} from '../../pop-up/timeline-char/timeline-char.component';
import {PopUpModule} from '../../pop-up/pop-up.module';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'duplicate-list', component: ListComponent, outlet: 'fullBodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    PopUpModule
  ],
  declarations: [ListComponent],
  entryComponents: [SubmitMultipleRowsComponent, TimelineCharComponent]
})
export class MatchedTransactionsModule { }
