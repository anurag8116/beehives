import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', loadChildren: 'app/home/dashboard/dashboard.module#DashboardModule'},
      {path: 'setting', loadChildren: 'app/home/setting/setting.module#SettingModule'},
      {path: 'recon', loadChildren: 'app/home/recon/recon.module#ReconModule'},
      {path: 'etl', loadChildren: 'app/home/etl/etl.module#EtlModule'},
      {path: 'disputes', loadChildren: 'app/home/disputes/disputes.module#DisputesModule'},
      {path: 'scheduler', loadChildren: 'app/home/scheduler/scheduler.module#SchedulerModule'},
      {path: 'user', loadChildren: 'app/home/user/user.module#UserModule'},
      {path: 'reports', loadChildren: 'app/home/reports/reports.module#ReportsModule'},
      {path: 'dataprovider', loadChildren: 'app/home/dataprovider/dataprovider.module#DataproviderModule'},

    ]
  }
];

export const homeRouting: ModuleWithProviders = RouterModule.forChild(routes);
