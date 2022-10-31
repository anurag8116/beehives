import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import { ListComponent } from './list/list.component';
import { PrivilegeComponent } from './privilege/privilege.component';
import { AssignPrivilegeComponent } from './assign-privilege/assign-privilege.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'privilege', component: PrivilegeComponent, outlet: 'fullBodyOutlet'},
  {path: 'assign-privilege', component: AssignPrivilegeComponent, outlet: 'fullBodyOutlet'},

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [ListComponent, PrivilegeComponent, AssignPrivilegeComponent]
})
export class RoleModule { }
