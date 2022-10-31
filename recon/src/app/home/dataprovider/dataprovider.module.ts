import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {LayoutComponent} from './layout/layout.component';
import {FormsModule} from '@angular/forms';
import {dataProviderRouting} from './dataprovide.routing';

@NgModule({
  imports: [
    CommonModule,
    dataProviderRouting,
    SharedModule,
    FormsModule,
  ],
  declarations: [LayoutComponent]
})
export class DataproviderModule {
}
