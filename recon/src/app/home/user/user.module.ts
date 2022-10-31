import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from './layout/layout.component';
import {userRouting} from './user.routing';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    userRouting,
    SharedModule
  ],
  declarations: [LayoutComponent, FullLayoutComponent]
})
export class UserModule {
}
