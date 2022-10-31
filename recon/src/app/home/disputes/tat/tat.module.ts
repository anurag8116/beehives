import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {FormComponent} from './form/form.component';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'bodyOutlet'},
  {path: 'form', component: FormComponent, outlet: 'bodyOutlet'},
  {path: 'form/:id', component: FormComponent, outlet: 'bodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [ListComponent, FormComponent]
})
export class TatModule {
}
