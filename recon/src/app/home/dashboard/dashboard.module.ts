import {Directive, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {dashboardRouting} from './dashboard.routing';
import {SharedModule} from '../../shared/shared.module';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {FormComponent} from './form/form.component';
import {DndModule} from 'ngx-drag-drop';
import {NgDraggableWidgetModule} from 'ngx-draggable-widget';
import {ChartsModule} from 'ng2-charts';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';
import {GridComponent} from './grid/grid.component';
import {GraphComponent} from './graph/graph.component';
import {TreeModule} from 'ng2-tree';
import {ConfigTabLayoutComponent} from './config-tab-layout/config-tab-layout.component';
import {TabsModule} from 'ngx-bootstrap/tabs';
import { GridTableComponent } from './grid-table/grid-table.component';
import { FilterModelComponent } from './filter-model/filter-model.component';
import {MatButtonModule, MatDialogModule, MatSlideToggle, MatSlideToggleModule, MatSnackBarModule} from '@angular/material';
import { GraphModelComponent } from './graph-model/graph-model.component';
import { KpiComponent } from './kpi/kpi.component';
import { DownloadReportComponent } from './download-report/download-report.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    dashboardRouting,
    ReactiveFormsModule,
    FormsModule,
    DndModule,
    NgDraggableWidgetModule,
    ChartsModule,
    TreeModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    TabsModule.forRoot()
  ],
  declarations: [LayoutComponent, FullLayoutComponent, FormComponent, ConfigComponent, GridComponent, GraphComponent, ConfigTabLayoutComponent, GridTableComponent, FilterModelComponent, GraphModelComponent, KpiComponent, DownloadReportComponent],
  entryComponents: [FilterModelComponent, GraphModelComponent]
})
export class DashboardModule {
}
