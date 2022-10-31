import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormComponent} from './form/form.component';
import {ListComponent} from './list/list.component';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DetailComponent} from './detail/detail.component';
import {GlBalancingReportComponent} from './gl-balancing-report/gl-balancing-report.component';
import { GlConfigDetailComponent } from './gl-config-detail/gl-config-detail.component';
import { RcGlBalancingReportComponent } from './rc-gl-balancing-report/rc-gl-balancing-report.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'form', component: FormComponent, outlet: 'fullBodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'fullBodyOutlet'},
  {path: 'edit/:id', component: FormComponent, outlet: 'fullBodyOutlet'},
  {path: 'gl-report', component: GlBalancingReportComponent, outlet: 'fullBodyOutlet'},
  {path: 'rc-gl-report', component: RcGlBalancingReportComponent, outlet: 'fullBodyOutlet'},
  {path: 'gl-detail', component: GlConfigDetailComponent, outlet: 'fullBodyOutlet'},
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
  declarations: [FormComponent, ListComponent, DetailComponent, GlBalancingReportComponent, GlConfigDetailComponent, RcGlBalancingReportComponent]
})
export class GlConfigModule {
}
