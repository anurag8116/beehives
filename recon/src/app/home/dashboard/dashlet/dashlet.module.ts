import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {ListComponent} from './list/list.component';
import {DetailComponent} from './detail/detail.component';
import {TreeModule} from 'ng2-tree';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'list', component: ListComponent, outlet: 'sideOutlet'},
  {path: 'detail/:id', component: DetailComponent, outlet: 'bodyOutlet'},
  {path: 'new', component: FormComponent, outlet: 'fullBodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    TreeModule
  ],
  declarations: [FormComponent, ListComponent, DetailComponent]
})
export class DashletModule {
}

