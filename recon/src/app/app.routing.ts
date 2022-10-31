import {ModuleWithProviders} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {ErrorComponent} from './error/error.component';

export const routes: Routes = [
  {path: '', redirectTo: 'authentication', pathMatch: 'full'},
  {path: 'authentication', loadChildren: 'app/authentication/authentication.module#AuthenticationModule'},
  {path: 'home', loadChildren: 'app/home/home.module#HomeModule'},
  {path: '**', pathMatch: 'full', component: ErrorComponent}
];

export const appRouting: ModuleWithProviders = RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules, enableTracing: false
//  useHash: true
});
