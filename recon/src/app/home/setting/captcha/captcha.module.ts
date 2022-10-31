import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {DetailComponent} from './detail/detail.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {SharedModule} from '../../../shared/shared.module';
import {FinancialInstitutionDetailComponent} from './financial-institution-detail/financial-institution-detail.component';
import {FinancialInstitutionFormComponent} from './financial-institution-form/financial-institution-form.component';
import {ReconCycleFormComponent} from './recon-cycle-form/recon-cycle-form.component';
import {ReconCycleDetailComponent} from './recon-cycle-detail/recon-cycle-detail.component';
import {ListComponent} from './list/list.component';
import {ReconSettingFormComponent} from './recon-setting-form/recon-setting-form.component';
import {ReconSettingDetailComponent} from './recon-setting-detail/recon-setting-detail.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserDetailComponent } from './user-detail/user-detail.component';

export const routes: Routes = [
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'sideOutlet'},
  {path: 'reconSettingForm', component: ReconSettingFormComponent, outlet: 'bodyOutlet'},
  {path: 'recon-cycle', component: ReconCycleFormComponent, outlet: 'bodyOutlet'},
  {path: 'user-form', component: UserFormComponent, outlet: 'bodyOutlet'},
  {path: 'financial-institution-form', component: FinancialInstitutionFormComponent, outlet: 'bodyOutlet'},

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [FormComponent, DetailComponent, FinancialInstitutionDetailComponent, FinancialInstitutionFormComponent, ReconCycleFormComponent, ReconCycleDetailComponent, ListComponent, ReconSettingFormComponent, ReconSettingDetailComponent, UserFormComponent, UserDetailComponent]
})
export class CaptchaModule {
}
