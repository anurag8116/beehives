import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './layout/layout.component';


export const routes: Routes = [
  {
    path: 'part',  component: LayoutComponent, children: [
      {path: 'captcha', loadChildren: 'app/home/setting/captcha/captcha.module#CaptchaModule'},
      {path: 'file-avail', loadChildren: 'app/home/setting/file-availability/file-availability.module#FileAvailabilityModule'},
    ]
  }
];

export const settingRouting: ModuleWithProviders = RouterModule.forChild(routes);
