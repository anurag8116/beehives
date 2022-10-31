import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {settingRouting} from './setting.routing';
import {SharedModule} from '../../shared/shared.module';
import {LayoutComponent} from './layout/layout.component';

@NgModule({
  imports: [
    CommonModule,
    settingRouting,
    SharedModule
  ],
  declarations: [LayoutComponent]
})
export class SettingModule {
}
