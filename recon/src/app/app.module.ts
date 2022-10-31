import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {appRouting} from './app.routing';
import {SharedModule} from './shared/shared.module';
import {MenuService} from './shared/menu.service';
import {FilterService} from './shared/services/filter.service';
import {MenuItemService} from './shared/menu-item.service';
import {DataTableService} from './shared/services/data-table-service';
import {HttpService} from './shared/services/http-service';
import {AuthService} from './shared/services/auth.service';
import {DatePipe} from '@angular/common';
import {StremSetHttpService} from './shared/services/stream-set-http-service';
import {NgxSpinnerModule} from 'ngx-spinner';
import {
  MatProgressBarModule,
  MatFormFieldModule,
  MatInputModule,
  MatSidenavModule,
  MatMenuModule,
  MatDialogModule,
  MatSnackBarModule,
  MatButtonModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {LoaderService} from './shared/services/loader.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import { ErrorComponent } from './error/error.component';
import {OAuthModule} from 'angular-oauth2-oidc';
import * as bootstrap from 'bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent
  ],
  imports: [
    appRouting,
    SharedModule,
    NgxSpinnerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule,
    OAuthModule.forRoot()
  ],
  providers: [MenuService, MenuItemService, DataTableService, HttpService, StremSetHttpService, AuthService, DatePipe, LoaderService, FilterService],
  bootstrap: [AppComponent],
  exports: [MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule, MatSidenavModule, MatMenuModule, BrowserAnimationsModule, MatDialogModule, MatButtonModule, MatSnackBarModule]
})
export class AppModule {
}
