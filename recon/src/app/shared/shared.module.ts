import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {LeftMenuComponent} from './left-menu/left-menu.component';
import {RouterModule} from '@angular/router';
import {BlankComponent} from './blank/blank.component';
import {DataTablesModule} from 'angular-datatables';
import {HttpClientModule} from '@angular/common/http';
import {LaddaModule} from 'angular2-ladda';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown';
import {FileInputComponent} from './file-upload/file-input.component';
import {NgxTypeaheadModule} from 'ngx-typeahead';
import {BsDatepickerModule, TimepickerModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PipeComponent} from './pipe/pipe.component';
import {UploadImageComponent} from './upload-image/upload-image.component';
import {LoaderComponent} from './loader/loader.component';
import {
  MatProgressBarModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSidenavModule,
  MatSnackBarModule
} from '@angular/material';
import {LoaderService} from './services/loader.service';
import {CoustomErrorComponent} from './coustom-error/coustom-error.component';
import {CustomSnackbarComponent} from './custom-snackbar/custom-snackbar.component';
import {TruncatePipe} from './pipe/truncate.pipe';
import {OnlyNumberDirective} from './directive/only-number.directive';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    DataTablesModule,
    LaddaModule.forRoot({
      spinnerLines: 100,
      spinnerColor: '#1f667b'
    }),
    AngularMultiSelectModule,
    NgxTypeaheadModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    MatSnackBarModule
  ],
  declarations: [
    FileInputComponent,
    HeaderComponent,
    LeftMenuComponent,
    BlankComponent,
    PipeComponent,
    UploadImageComponent,
    LoaderComponent,
    CoustomErrorComponent,
    CustomSnackbarComponent,
    TruncatePipe,
    OnlyNumberDirective
  ],
  exports: [
    FileInputComponent,
    HeaderComponent,
    LeftMenuComponent,
    BlankComponent,
    HttpClientModule,
    DataTablesModule,
    LaddaModule,
    AngularMultiSelectModule,
    NgxTypeaheadModule,
    BsDatepickerModule,
    TimepickerModule,
    PipeComponent,
    TruncatePipe,
    UploadImageComponent,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSidenavModule,
    MatSnackBarModule,
    LoaderComponent,
    OnlyNumberDirective
  ],
  providers: [],
  entryComponents: [CoustomErrorComponent, CustomSnackbarComponent]
})
export class SharedModule {
}
