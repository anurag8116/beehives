import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {DetailComponent} from './detail/detail.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export const routes: Routes = [
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'bodyOutlet'},
  {path: 'new', component: FormComponent, outlet: 'bodyOutlet'}
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
  declarations: [FormComponent, DetailComponent]
})
export class FileAvailabilityModule {
}
