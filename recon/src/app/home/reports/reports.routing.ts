import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {BlankComponent} from '../../shared/blank/blank.component';
import {LayoutComponent} from './layout/layout.component';
import {ListComponent} from './list/list.component';
import {FormComponent} from './form/form.component';
import {DetailComponent} from './detail/detail.component';

export const routes: Routes = [
  {
    path: '', component: FullLayoutComponent, children: [
      {path: 'report-execution', loadChildren: 'app/home/reports/report-execution/report-execution.module#ReportExecutionModule'},
      {path: 'export', loadChildren: 'app/home/reports/export/export.module#ExportModule'},
      {path: 'import', loadChildren: 'app/home/reports/import/import.module#ImportModule'}
    ]
  },
  {
    path: 'full', component: FullLayoutComponent, children: [
      {path: 'new', component: FormComponent, outlet: 'fullBodyOutlet'}
    ]
  }
  , {
    path: 'part', component: LayoutComponent, children: [
      {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
      {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
      {path: 'list', component: ListComponent, outlet: 'sideOutlet'},
      {path: 'detail/:id', component: DetailComponent, outlet: 'bodyOutlet'}
    ]
  }

];

export const reportsRouting: ModuleWithProviders = RouterModule.forChild(routes);
