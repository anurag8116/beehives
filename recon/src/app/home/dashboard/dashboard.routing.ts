import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {FormComponent} from './form/form.component';
import {ConfigComponent} from './config/config.component';
import {BlankComponent} from '../../shared/blank/blank.component';
import {ConfigTabLayoutComponent} from './config-tab-layout/config-tab-layout.component';
import {DownloadReportComponent} from './download-report/download-report.component';


export const routes: Routes = [{
  path: '', component: LayoutComponent, children: [
    {path: 'dashlet', loadChildren: 'app/home/dashboard/dashlet/dashlet.module#DashletModule'},
    {path: 'export', loadChildren: 'app/home/dashboard/export/export.module#ExportModule'},

  ]
},
  {
    path: 'part', component: LayoutComponent, children: [
      {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
      {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'}
    ]
  },
  {
    path: 'full', component: FullLayoutComponent, children: [
      {path: 'new', component: FormComponent, outlet: 'fullBodyOutlet'},
      {path: 'dashlet', loadChildren: 'app/home/dashboard/dashlet/dashlet.module#DashletModule'},
      {path: 'config/:id', component: ConfigComponent, outlet: 'fullBodyOutlet'},
      {path: 'config-tab-layout/:id', component: ConfigTabLayoutComponent, outlet: 'fullBodyOutlet'},
      {path: 'config', component: ConfigComponent, outlet: 'fullBodyOutlet'},
      {path: 'config-tab-layout', component: ConfigTabLayoutComponent, outlet: 'fullBodyOutlet'},
      {path: 'export', loadChildren: 'app/home/dashboard/export/export.module#ExportModule'},
      {path: 'import', loadChildren: 'app/home/dashboard/import/import.module#ImportModule'},
      {path: 'download-report', component: DownloadReportComponent, outlet: 'fullBodyOutlet'},
    ]
  }
];

export const dashboardRouting: ModuleWithProviders = RouterModule.forChild(routes);
