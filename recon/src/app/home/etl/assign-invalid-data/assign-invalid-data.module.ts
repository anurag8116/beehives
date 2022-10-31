import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ListComponent} from './list/list.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsBootstrapUIModule} from '@ng-dynamic-forms/ui-bootstrap';
import {EditEtlDataComponent} from '../../pop-up/edit-etl-data/edit-etl-data.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {SubmitMultipleRowsComponent} from "../../pop-up/submit-multiple-rows/submit-multiple-rows.component";

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'list', component: ListComponent, outlet: 'sideOutlet'},
  {path: 'form/:id', component: FormComponent, outlet: 'bodyOutlet'},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    PopUpModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [FormComponent, ListComponent],
  entryComponents: [EditEtlDataComponent, SubmitMultipleRowsComponent]
})
export class AssignInvalidDataModule {
}
