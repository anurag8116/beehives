import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataproviderListComponent } from './dataprovider-list/dataprovider-list.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import { DetailComponent } from './detail/detail.component';


export const routes: Routes = [
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'dataprovider-list', component: DataproviderListComponent, outlet: 'sideOutlet'},
  {path: 'da-pro-detail/:id', component: DetailComponent, outlet: 'bodyOutlet'},
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [DataproviderListComponent, DetailComponent]
})
export class DataprovidersModule { }
