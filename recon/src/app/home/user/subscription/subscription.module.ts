import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form/form.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';

export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'form', component: FormComponent, outlet: 'fullBodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [FormComponent]
})
export class SubscriptionModule { }
