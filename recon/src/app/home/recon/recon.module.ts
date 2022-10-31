import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {reconRouting} from './recon.routing';
import { LayoutComponent } from './layout/layout.component';
import {SharedModule} from '../../shared/shared.module';
import {SubmitMultipleRowsComponent} from '../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {PopUpModule} from '../pop-up/pop-up.module';
import {TimelineCharComponent} from '../pop-up/timeline-char/timeline-char.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    reconRouting,
    PopUpModule
  ],
  declarations: [FullLayoutComponent, LayoutComponent],
})
export class ReconModule {
}
