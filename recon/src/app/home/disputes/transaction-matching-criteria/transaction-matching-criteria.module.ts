import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {ListComponent} from './list/list.component';
import {DetailComponent} from './detail/detail.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'bodyOutlet'},
  {path: 'new', component: FormComponent, outlet: 'bodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'bodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  declarations: [FormComponent, ListComponent, DetailComponent]
})
export class TransactionMatchingCriteriaModule {
}
