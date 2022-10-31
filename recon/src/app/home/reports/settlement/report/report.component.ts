import {isNullOrUndefined} from 'util';
import {AppConstants} from './../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {MatDialog} from '@angular/material';
import {AuthService} from '../../../../shared/services/auth.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  public settlementDataSources: any[] = [];
  public cashbackDataSources: any[] = [];
  public pipelineId = new FormControl(null);
  public pipelineExecutions: any[] = [];
  public pipelineExecutionId = new FormControl(null);
  public cbPipelineExecutions: any[] = [];
  public cbPipelineExecutionId = new FormControl(null);
  public deliveryPipelineExecutions: any[] = [];
  public deliveryPipelineExecutionId = new FormControl(null);
  public reconIterations: any[] = [];
  public reconIterationId = new FormControl(null);
  public dataSourceId = null;
  public ntrDataSources: any[] = [];
  public ntrDataSourceId = null;
  public fromDate = new FormControl(null);
  public toDate = new FormControl(null);
  public isReversalDispute = new FormControl(false);
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  hasRoleCardOps = false;
  hasRolePartnershipTeam = false;
  hasRoleM2p = false;

  constructor(private httpService: HttpService, private authService: AuthService, private datePipe: DatePipe) {
    this.hasRoleCardOps = this.authService.hasRoleCardOps();
    this.hasRolePartnershipTeam = this.authService.hasRolePartnershipTeam();
    this.hasRoleM2p = this.authService.hasRoleM2p();
  }

  ngOnInit() {
    this.getDataSources();
  }

  getDataSources() {
    this.httpService.get('v1/datasources', true).subscribe(
      (data: any) => {
        this.settlementDataSources = data.data.filter((dataSource: any) => 89 === dataSource.id || dataSource.id === 93).map((dataSource: any) => {
          if (dataSource.id === 89) {
            dataSource.name = 'Old Bin (4844)';
          } else if (dataSource.id === 93) {
            dataSource.name = 'New Bin (4251)';
          }
          return dataSource;
        });
        this.ntrDataSources = data.data.filter((dataSource: any) => dataSource.id === 87 || dataSource.id === 91).map((dataSource: any) => {
          if (dataSource.id === 87) {
            dataSource.name = 'Old Bin (4844)';
          } else if (dataSource.id === 91) {
            dataSource.name = 'New Bin (4251)';
          }
          return dataSource;
        });

        this.cashbackDataSources = data.data.filter((dataSource: any) => dataSource.id === 96);
        if(this.cashbackDataSources !== null && this.cashbackDataSources.length > 0) {
          this.getCashbackPipelineExecution(this.cashbackDataSources[0].pipelineId);
        }

        const deliveryDataSources = data.data.filter((dataSource: any) => dataSource.id === 98);
        if(deliveryDataSources !== null && deliveryDataSources.length > 0) {
          this.getDeliveryPipelineExecution(deliveryDataSources[0].pipelineId);
        }
      }
    );
  }

  onDataSourceChange(dataSource) {
    if (dataSource) {
      this.dataSourceId = dataSource.id;
      this.pipelineId.setValue(dataSource.pipelineId);
    } else {
      this.dataSourceId = null;
      this.pipelineId.setValue(null);
    }

    this.pipelineExecutionId.setValue(null);
    this.pipelineExecutions = [];
    this.reconIterationId.setValue(null);
    this.reconIterations = [];

    if (this.pipelineId.value) {
      this.getPipelineExecutions();
    }
    if (dataSource && dataSource.reconId) {
      this.getReconIterations(dataSource.reconId);
    }
  }

  getPipelineExecutions() {
    this.httpService.get('v1/pipelineexecutions?pipeLine=' + this.pipelineId.value + '&start=0&descendingOrder=true', true).subscribe(
      (data: any) => {
        this.pipelineExecutions = [];
        for (const executionData of data) {
          const fileName = executionData.name.substr(executionData.name.lastIndexOf('/') + 1);
          const pipelineExecutionData = {id: executionData.id, name: fileName, date: executionData.date};
          this.pipelineExecutions.push(pipelineExecutionData);
        }
      }
    );
  }

  getReconIterations(reconId) {
    this.httpService.get('v1/reconiterations?Find=ByRecon&reconId=' + reconId + '&descendingOrder=true', true).subscribe(
      (data: any) => {
        this.reconIterations = data;
      }
    );
  }

  prepareReport() {
    if (!this.dataSourceId) {
      this.httpService.displayErrorOnPopUp('Select report module');
      return;
    }
    if (!this.pipelineExecutionId.value) {
      this.httpService.displayErrorOnPopUp('Select Settlement Report');
      return;
    }
    const reconIterationId = this.reconIterationId.value ? this.reconIterationId.value : '';
    this.httpService.get('v1/settlementreport/prepare?dataSourceId=' + this.dataSourceId + '&pipelineExecutionId=' + this.pipelineExecutionId.value + '&reconIterationId=' + reconIterationId, true).subscribe(
      () => {
        this.httpService.displaySuccessOnPopUp('Report submitted successfully.');
      }
    );
  }

  misReportPrepare() {
    if (!this.dataSourceId) {
      this.httpService.displayErrorOnPopUp('Select report module');
      return;
    }
    if (!this.pipelineExecutionId.value) {
      this.httpService.displayErrorOnPopUp('Select Settlement Report');
      return;
    }
    
    const reconIterationId = this.reconIterationId.value ? this.reconIterationId.value : '';
    const pipelineExecutionId = this.pipelineExecutionId.value ? this.pipelineExecutionId.value : '';
    this.httpService.get('v1/settlementreport/mis-report?dataSourceId=' + this.dataSourceId +
      '&pipelineExecutionId=' + pipelineExecutionId +
      '&reconIterationId=' + reconIterationId, true).subscribe(
      () => {
        this.httpService.displaySuccessOnPopUp('Mis Report submitted successfully.');
      }
    );
  }

  getCashbackPipelineExecution(pipelineId) {
    this.httpService.get('v1/pipelineexecutions?pipeLine=' + pipelineId + '&start=0&descendingOrder=true', true).subscribe(
      (data: any) => {
        this.cbPipelineExecutions = [];
        for (const executionData of data) {
          const fileName = executionData.name.substr(executionData.name.lastIndexOf('/') + 1);
          const pipelineExecutionData = {id: executionData.id, name: fileName, date: executionData.date};
          this.cbPipelineExecutions.push(pipelineExecutionData);
        }
      }
    );
  }

  getDeliveryPipelineExecution(pipelineId) {
    this.httpService.get('v1/pipelineexecutions?pipeLine=' + pipelineId + '&start=0&descendingOrder=true', true).subscribe(
      (data: any) => {
        this.deliveryPipelineExecutions = [];
        for (const executionData of data) {
          const fileName = executionData.name.substr(executionData.name.lastIndexOf('/') + 1);
          const pipelineExecutionData = {id: executionData.id, name: fileName, date: executionData.date};
          this.deliveryPipelineExecutions.push(pipelineExecutionData);
        }
      }
    );
  }

  prepareCashbackReport() {
    if (!this.cbPipelineExecutionId.value) {
      this.httpService.displayErrorOnPopUp('Select Cashback Report');
      return;
    }
    this.httpService.get('v1/settlementreport/cashback-report?pipelineExecutionId=' + this.cbPipelineExecutionId.value, true).subscribe(
      () => {
        this.httpService.displaySuccessOnPopUp('Report submitted successfully.');
      }
    );
  }

  prepareDeliveryReport() {
    if (!this.deliveryPipelineExecutionId.value) {
      this.httpService.displayErrorOnPopUp('Select Delivery Report');
      return;
    }
    this.httpService.get('v1/settlementreport/delivery-report?pipelineExecutionId=' + this.deliveryPipelineExecutionId.value, true).subscribe(
      () => {
        this.httpService.displaySuccessOnPopUp('Report submitted successfully.');
      }
    );
  }

  onNtrDataSourceChange(dataSource) {
    this.ntrDataSourceId = (dataSource && dataSource.id) ? dataSource.id : null;
    this.fromDate.setValue(null);
    this.toDate.setValue(null);
  }

  public getToDatePickerConfig(fromDate: string): void {
    let pastDate = null;
    if (fromDate) {
      const date = AppConstants.getDateFromString(fromDate);
      const newFromDate = new Date(date.setDate(date.getDate() - 1));
      pastDate = this.datePipe.transform(newFromDate, 'MM-dd-yyyy');
    }
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, pastDate);
  }

  prepareDisputeReport() {
    const fromDate = this.fromDate.value;
    const toDate = this.toDate.value;
    if (isNullOrUndefined(fromDate)) {
      this.httpService.displayErrorOnPopUp('Select from date !');
      return;
    }
    if (isNullOrUndefined(toDate)) {
      this.httpService.displayErrorOnPopUp('Select to date !');
      return;
    }

    const queryParam = '?columns[0][data]=fromApprovalDate&columns[0][search][value]=' + fromDate
      + '&columns[1][data]=toApprovalDate&columns[1][search][value]=' + toDate
      + '&columns[2][data]=isReversalDispute&columns[2][search][value]=' + this.isReversalDispute.value;
    const url = encodeURI('v1/disputereport/prepare' + queryParam);
    this.httpService.get(url, true).subscribe(
      () => {
        this.httpService.displaySuccessOnPopUp('Report submitted successfully.');
      }
    );
  }
}
