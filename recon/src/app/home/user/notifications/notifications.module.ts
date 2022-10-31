import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationsListComponent} from './notifications-list/notifications-list.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: NotificationsListComponent, outlet: 'fullBodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [NotificationsListComponent]
})
export class NotificationsModule { }
