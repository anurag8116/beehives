import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {FormComponent} from './form/form.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'bodyOutlet'},
  {path: 'new', component: FormComponent, outlet: 'bodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  declarations: [ListComponent, FormComponent]
})
export class AssignmentRulesModule {
}
