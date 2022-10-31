import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { ReportComponent } from './report/report.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {BlankComponent} from '../../../shared/blank/blank.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'report', component: ReportComponent, outlet: 'fullBodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  providers: [DatePipe],
  declarations: [ReportComponent]
})
export class RahejaModule { }
