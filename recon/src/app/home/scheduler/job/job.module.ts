import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ListComponent} from './list/list.component';
import {FormComponent} from './form/form.component';
import {DetailComponent} from './detail/detail.component';
import {CronEditorModule} from 'cron-editor';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'edit/:id', component: FormComponent, outlet: 'fullBodyOutlet'},
  {path: 'new', component: FormComponent, outlet: 'fullBodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'fullBodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    CronEditorModule
  ],
  providers: [DatePipe],
  declarations: [FormComponent, ListComponent, DetailComponent]
})
export class JobModule {
}
