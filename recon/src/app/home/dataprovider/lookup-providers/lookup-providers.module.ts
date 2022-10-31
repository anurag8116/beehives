import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupproviderListComponent } from './lookupprovider-list/lookupprovider-list.component';
import { LookupDetailComponent } from './lookup-detail/lookup-detail.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export const routes: Routes = [
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'lookupprovider-list', component: LookupproviderListComponent, outlet: 'sideOutlet'},
  {path: 'look-pro-detail/:id', component: LookupDetailComponent, outlet: 'bodyOutlet'},
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [LookupproviderListComponent, LookupDetailComponent]
})
export class LookupProvidersModule { }
