import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ListComponent} from './list/list.component';
import {FormComponent} from './form/form.component';
import {DndListModule} from 'ngx-drag-and-drop-lists';
import {ContainerComponent} from './container/container.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsBootstrapUIModule} from '@ng-dynamic-forms/ui-bootstrap';
import {DetailComponent} from './detail/detail.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {CreatePipelineComponent} from '../../pop-up/create-pipeline/create-pipeline.component';
import {LogsComponent} from './logs/logs.component';
import {PreviewPipelineErrorComponent} from '../../pop-up/preview-pipeline-error/preview-pipeline-error.component';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'list', component: ListComponent, outlet: 'fullBodyOutlet'},
  {path: 'edit', component: FormComponent, outlet: 'fullBodyOutlet'},
  {path: 'detail', component: DetailComponent, outlet: 'fullBodyOutlet'},
  {path: 'logs/:pipelineId/:type', component: LogsComponent, outlet: 'fullBodyOutlet'}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DndListModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    PopUpModule
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [ListComponent, FormComponent, ContainerComponent, DetailComponent, LogsComponent],
  entryComponents: [CreatePipelineComponent, PreviewPipelineErrorComponent]
})
export class PipelineModule {
}
