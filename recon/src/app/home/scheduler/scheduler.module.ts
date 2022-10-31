import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {schedulerRouting} from './scheduler.routing';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    schedulerRouting
  ],
  declarations: [FullLayoutComponent]
})
export class SchedulerModule {
}
