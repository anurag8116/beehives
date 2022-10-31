import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {SharedModule} from '../../shared/shared.module';
import {disputesRouting} from './disputes.routing';
import { SettingComponent } from './setting/setting.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    disputesRouting
  ],
  declarations: [LayoutComponent, FullLayoutComponent, SettingComponent],
})
export class DisputesModule {
}
