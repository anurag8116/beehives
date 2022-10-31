import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FullLayoutComponent} from './full-layout/full-layout.component';

export const routes: Routes = [
  {
    path: '', component: FullLayoutComponent, children: [
      {path: 'job', loadChildren: 'app/home/scheduler/job/job.module#JobModule'},
      {path: 'job-execution', loadChildren: 'app/home/scheduler/job-execution/job-execution.module#JobExecutionModule'},
    ]
  },

];

export const schedulerRouting: ModuleWithProviders = RouterModule.forChild(routes);
