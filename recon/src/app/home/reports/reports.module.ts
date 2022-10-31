import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {SharedModule} from '../../shared/shared.module';
import {reportsRouting} from './reports.routing';
import {ListComponent} from './list/list.component';
import {LayoutComponent} from './layout/layout.component';
import {TreeModule} from 'ng2-tree';
import {FormComponent} from './form/form.component';
import {DetailComponent} from './detail/detail.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    reportsRouting,
    FormsModule,
    TreeModule
  ],
  declarations: [LayoutComponent, FullLayoutComponent, ListComponent, FormComponent, DetailComponent]
})
export class ReportsModule {
}
