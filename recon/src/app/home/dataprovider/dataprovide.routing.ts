import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/compiler/src/core';
import {LayoutComponent} from './layout/layout.component';

export const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {
        path: 'dataproviders', loadChildren: 'app/home/dataprovider/dataproviders/dataproviders.module#DataprovidersModule'
      },
    ]
  },
  {
    path: 'lookup', component: LayoutComponent, children: [
      {path: 'lookupproviders', loadChildren: 'app/home/dataprovider/lookup-providers/lookup-providers.module#LookupProvidersModule'},
    ]
    // path: 'lookupproviders', loadChildren: 'app/dataprovider/lookup-providers/lookup-providers.module#LookupProvidersModule'
  }
];
export const dataProviderRouting: ModuleWithProviders = RouterModule.forChild(routes);
