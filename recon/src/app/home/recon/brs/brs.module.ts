import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {IrctcBrsComponent} from './irctc-brs/irctc-brs.component';
import {ReportComponent} from './report/report.component';
import {AirtelComponent} from './airtel/airtel.component';
import {InvoiceReportComponent} from './invoice-report/invoice-report.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import {InvoiceReportFormComponent} from '../../pop-up/invoice-report-form/invoice-report-form.component';


export const routes: Routes = [
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'irctc-bar', component: IrctcBrsComponent, outlet: 'fullBodyOutlet'},
  {path: 'report', component: ReportComponent, outlet: 'fullBodyOutlet'},
  {path: 'irctc', component: IrctcBrsComponent, outlet: 'fullBodyOutlet'},
  {path: 'airtel', component: AirtelComponent, outlet: 'fullBodyOutlet'},
  {path: 'invoice-report', component: InvoiceReportComponent, outlet: 'fullBodyOutlet'},

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    PopUpModule,
    SharedModule
  ],
  providers: [DatePipe],
  declarations: [IrctcBrsComponent, ReportComponent, AirtelComponent, InvoiceReportComponent],
  entryComponents: [InvoiceReportFormComponent]
})
export class BrsModule {
}


/*
{
  "_args": [
    [
      {
        "raw": "@angular/compiler@^5.1.0",
        "scope": "@angular",
        "escapedName": "@angular%2fcompiler",
        "name": "@angular/compiler",
        "rawSpec": "^5.1.0",
        "spec": ">=5.1.0 <6.0.0",
        "type": "range"
      },
      "F:\\auto_recon\\java\\trunk\\cbms"
    ]
  ],
  "_from": "@angular/compiler@>=5.1.0 <6.0.0",
  "_hasShrinkwrap": false,
  "_id": "@angular/compiler@5.2.11",
  "_inCache": true,
  "_location": "/@angular/compiler",
  "_nodeVersion": "8.9.2",
  "_npmOperationalInternal": {
    "host": "s3://npm-registry-packages",
    "tmp": "tmp/compiler_5.2.11_1526507687648_0.015307049084785973"
  },
  "_npmUser": {
    "name": "angular",
    "email": "devops+npm@angular.io"
  },
  "_npmVersion": "5.5.1",
  "_phantomChildren": {},
  "_requested": {
    "raw": "@angular/compiler@^5.1.0",
    "scope": "@angular",
    "escapedName": "@angular%2fcompiler",
    "name": "@angular/compiler",
    "rawSpec": "^5.1.0",
    "spec": ">=5.1.0 <6.0.0",
    "type": "range"
  },
  "_requiredBy": [
    "/"
  ],
  "_resolved": "https://registry.np*/
