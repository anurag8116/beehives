import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {AppConstants} from '../../../../shared/services/app.constants';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';
import {AuthService} from '../../../../shared/services/auth.service';
import {environment} from '../../../../../environments/environment.poc';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit, AfterViewChecked {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dataSources = [];
  recons = [];
  selectedFiles = [];
  isLoading = false;
  public roleName: string;
  dataSourceId = null;
  public filesName = '';
  public showTable = false;
  accept = '.xlsx,.xls,.csv';
  hasRoleM2P = false;

  sliceClient: Boolean = environment.sliceClient;

  constructor(private dateTableService: DataTableService, private http: HttpService, private datePipe: DatePipe,
              private elRef: ElementRef, public changeDef: ChangeDetectorRef, private filter: FilterService,
              private authService: AuthService) {
    this.hasRoleM2P = this.authService.hasRoleM2p();
  }

  ngOnInit() {
    this.roleName = localStorage.getItem(AppConstants.USER_ROLE);
    this.isLoading = false;
    this.getRecons();
  }

  getRecons() {
    this.recons = [];
    this.http.get('v1/recons?start=0', true).subscribe(
      (data: any) => {
        if (this.sliceClient) {
          this.recons = data.data.filter((recon: any) => this.hasRoleM2P ? recon.id === 42 : true);
        } else {
          this.recons = data.data;
        }
      }
    );
  }

  onFileSelect(files: any) {
    this.filesName = '';
    this.selectedFiles = files;
    if (files && files.length > 0) {
      this.filesName = files.length + ' files are selected : ';
      for (let i = 0; i < files.length; i++) {
        this.filesName = this.filesName + files[i].name;
        if (i !== files.length - 1) {
          this.filesName = this.filesName + ',';
        }
      }
    }
  }

  onDataSourceChange(dataSourceId) {
    if (this.sliceClient) {
      this.dataSourceId = dataSourceId;

      if (String(dataSourceId) === '100') {
        this.accept = '.jpeg,.jpg,.csv,.pdf';
      } else {
        this.accept = '.csv';
      }

      if (!this.showTable) {
        this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/fileupload', this.getColumnsDefinition()),
          {searchCols: [null, null, null, null, {search: this.dataSourceId}]});

        this.showTable = true;
      } else {
        this.filter.search(this.dataSourceId, 4, this.dtElement);
      }
      this.changeDef.detectChanges();
    }
  }

  uploadFile() {
    let errorMsg = '';
    let isError = false;
    if (this.dataSourceId == null || this.dataSourceId === 'null') {
      isError = true;
      errorMsg += 'filename is required.' + '<br>';
    }

    if (this.selectedFiles.length < 1) {
      isError = true;
      errorMsg += 'file is required.' + '<br>';
    }
    if (errorMsg) {
      this.http.displayErrorOnPopUp(errorMsg);
    }

    if (!isError) {
      this.isLoading = true;
      const formdata: FormData = new FormData();
      for (const file of this.selectedFiles) {
        formdata.append('files', file);
      }
      this.http.post('v1/fileupload?dataSourceId=' + this.dataSourceId,
        formdata, true).subscribe((res: any) => {
        this.isLoading = false;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
        this.http.displaySuccessOnPopUp('File successfully uploaded', 100000000);
      }, err => {
        this.isLoading = false;
      });
    }
  }

  reset(files) {
    this.dataSources = [];
    this.dataSourceId = null;
    this.filesName = '';
  }

  getDataSourceConfig(recon) {
    this.dataSourceId = null;
    this.http.get('v1/datasources?Find=ByRecon&reconId=' + recon.value, true).subscribe(
      (dataSourceList: any) => {
        this.dataSources = dataSourceList.data;
      }
    );
  }

  deleteFileByName(fileName) {
    this.http.delete('v1/fileupload?dataSourceId=' + this.dataSourceId + '&fileName=' + fileName, true).subscribe(
      (dataSourceList: any) => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      }
    );
  }


  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'File_name', data: 'filePath', bSortable: false});
    columns.push({
      title: 'Upload_time', data: 'fileLastUpdatedTime', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }, bSortable: false
    });
    columns.push({
      title: 'File_size(Kb)', data: 'fileSize', render: (data, type, full) => {
        return data / 1000;
      }, bSortable: false
    });
    columns.push({
      title: 'Action', data: 'filePath', render: (data, type, full) => {
        const actionHtml = '<a id ="downBtn" #downBtn data-id="' + data + '" href="javascript:void(0);" >' +
          '<i class="cursor fa fa-trash col-1" aria-hidden="true" style="font-size: 15px;"></i></a>';
        return actionHtml;
      }, bSortable: false
    });
    columns.push({
      title: 'datasource', data: 'dataSourceId', render: (data, type, full) => {
        return '';
      }, bSortable: false, visible: false
    });
    return columns;
  }

  ngAfterViewChecked(): void {
    const self = this;
    setTimeout(() => {
      this.elRef.nativeElement.querySelectorAll('a#downBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.deleteFileByName($(item).data('id'));
        });
      });
    }, 100);
  }
}
