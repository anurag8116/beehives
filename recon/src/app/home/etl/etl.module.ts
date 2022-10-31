import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {etlRouting} from './etl.routing';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {LayoutComponent} from './layout/layout.component';
import {PopUpModule} from '../pop-up/pop-up.module';
import {NgxDocViewerModule} from 'ngx-doc-viewer';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    etlRouting,
    PopUpModule,
    NgxDocViewerModule,
  ],
  declarations: [LayoutComponent, FullLayoutComponent]
})
export class EtlModule {
}
