import {NgModule} from '@angular/core';
import {NgxSpinnerModule} from 'ngx-spinner';
import {SharedModule} from '../shared/shared.module';
import {MenuService} from '../shared/menu.service';
import {MenuItemService} from '../shared/menu-item.service';
import {DataTableService} from '../shared/services/data-table-service';
import {HttpService} from '../shared/services/http-service';
import {StremSetHttpService} from '../shared/services/stream-set-http-service';
import {AuthService} from '../shared/services/auth.service';
import {CommonModule, DatePipe} from '@angular/common';
import {HomeComponent} from './home.component';
import {homeRouting} from './home.routing';
import {FilterService} from '../shared/services/filter.service';
import {
  MatProgressBarModule,
  MatSidenavModule,
  MatMenuModule,
  MatDialogModule,
  MatButtonModule,
  MatSnackBarModule,
  MatSlideToggleModule
} from '@angular/material';
import {LoaderService} from '../shared/services/loader.service';
import {AssignToUserComponent} from './pop-up/assign-to-user/assign-to-user.component';
import {PopUpModule} from './pop-up/pop-up.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    homeRouting,
    CommonModule,
    SharedModule,
    NgxSpinnerModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    PopUpModule,
  ],
  providers: [MenuService, MenuItemService, DataTableService, HttpService, StremSetHttpService, AuthService, DatePipe, LoaderService, FilterService],
})
export class HomeModule {
}
