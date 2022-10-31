import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit, AfterViewChecked {

  public form: FormGroup;
  public isLoading: boolean;
  public modules = [];
  public recons = [];
  public tables = [];
  public columns = [];
  public historyTable = [];
  public InvalidTable = [];
  public id: number;
  public editMode: boolean;
  public dataElementTypes = ['VARCHAR', 'BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT'];
  public maskTypes = ['NONE', 'FIRST_X_CHAR', 'LAST_X_CHAR', 'FIRST_AND_LAST_CHAR'];
  public dataSource: any = {module: {name: ''}, dataElements: []};
  public pipelines = [];
  public dropDownSettings = ServiceConstant.getDropDownDefaultSetting();

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute,
              private ssHttpService: StremSetHttpService) {
  }

  ngAfterViewChecked(): void {
    if (this.form.get('maxInvalidRecord').value === null) {
      this.form.removeControl('maxInvalidRecordCountUnit');
      this.form.addControl('maxInvalidRecordCountUnit', new FormControl());
    }
    if (this.form.get('maxDuplicateRecordLimit').value === null) {
      this.form.removeControl('maxDuplicateRecordCountUnit');
      this.form.addControl('maxDuplicateRecordCountUnit', new FormControl());
    }
  }

  ngOnInit() {
    this.editMode = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null),
      maxInvalidRecord: new FormControl(null),
      amountColumn: new FormControl(null),
      statusColumn: new FormControl(null),
      iterationIdColumn: new FormControl(null),
      manualMark: new FormControl(false),
      maxDuplicateRecordLimit: new FormControl(null),
      maxInvalidRecordCountUnit: new FormControl(null),
      maxDuplicateRecordCountUnit: new FormControl(null),
      pipelineId: new FormControl(null),
      reconId: new FormControl(null),
      invalidTable: new FormControl(null),
      historyTable: new FormControl(null),
      table: new FormControl(null),
      sourceElementType: new FormControl('EXISTING'),
      module: new FormGroup({
        id: new FormControl(null)
      }),
      cutOffTime: new FormControl(null),
      agreedTime: new FormControl(null),
      dataElements: new FormArray([
        new FormGroup({
          id: new FormControl(null),
          name: new FormControl(null),
          tableColumn: new FormControl(null),
          usedForDuplicateCheck: new FormControl(false),
          type: new FormControl(null),
          encrypted: new FormControl(false),
          maskChar: new FormControl(null),
          maskLength: new FormControl(null),
          maskType: new FormControl(null)
        })
      ]),
    });
    // this.addDataElement();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.httpService.get('v1/datatables?start=0&type=RECON_DATA', true).subscribe(
      (data: any) => {
        this.tables = data.data;
      }
    );
    this.httpService.get('v1/datatables?start=0&type=HISTORY_TABLE', true).subscribe(
      (data: any) => {
        this.historyTable = data.data;
      }
    );
    this.httpService.get('v1/datatables?start=0&type=INVALID_DATA', true).subscribe(
      (data: any) => {
        this.InvalidTable = data.data;
      }
    );
    if (this.id) {
      this.onEdit(this.id);
      this.editMode = true;
    }
  }

  public onEdit(id: number) {
    this.httpService.get('v1/datasources/' + this.id, true).subscribe(
      (data: any) => {
        this.onModuleChange(data.module.id);
        const moduleName = this.getModuleNameById(data.module.id);
        this.ssHttpService.get('v1/pipelines?filterText=' + moduleName + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
          (reponse: any) => {
            if (!isNullOrUndefined(reponse[0])) {

              const formArrayPipelines = data.pipelineId.split(',');
              const pipelineArray = [];
              if (formArrayPipelines.length > 0) {
                for (let i = 0; i < formArrayPipelines.length; i++) {
                  pipelineArray.push({
                    id: formArrayPipelines[i],
                    itemName: this.getPipelineNameByPipelineId(formArrayPipelines[i], reponse)
                  });
                }
                data.pipelineId = pipelineArray;
                this.dataSource = data;
                this.form.patchValue(data);
              }
            }
          });
        this.tables = [{name: data.table}];
        this.InvalidTable = [{name: data.invalidTable}];
        this.historyTable = [{name: data.historyTable}];
        this.onTableChange(data.table);
        this.form.removeControl('dataElements');
        this.form.addControl('dataElements', new FormArray([]));
        for (const obj of data.dataElements) {
          const control = new FormGroup({
            id: new FormControl(obj.id),
            name: new FormControl(obj.name),
            tableColumn: new FormControl(obj.tableColumn),
            type: new FormControl(obj.type),
            usedForDuplicateCheck: new FormControl(obj.usedForDuplicateCheck),
            encrypted: new FormControl(obj.encrypted),
            maskChar: new FormControl(obj.maskChar),
            maskLength: new FormControl(obj.maskLength),
            maskType: new FormControl(obj.maskType)
          });
          (<FormArray>this.form.get('dataElements')).push(control);
        }
        this.historyTable = [{name: data.historyTable}];
        this.InvalidTable = [{name: data.invalidTable}];
        this.tables = [{name: data.table}];
        this.form.patchValue({historyTable: data.historyTable});
        this.form.patchValue({invalidTable: data.invalidTable});
        this.form.patchValue({table: data.table});
        if (data.sourceElementType === 'TABLE') {
          this.form.get('table').disable();
          this.form.get('invalidTable').disable();
          this.form.get('historyTable').disable();
        }
      }
    );
  }

  public addDataElement(): void {
    const control = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null),
      tableColumn: new FormControl(null),
      usedForDuplicateCheck: new FormControl(false),
      type: new FormControl(null),
      encrypted: new FormControl(null),
      maskChar: new FormControl(null),
      maskLength: new FormControl(null),
      maskType: new FormControl(null)
    });
    (<FormArray>this.form.get('dataElements')).push(control);
  }

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('dataElements')).removeAt(i);

  }

  onSubmit() {
    const formData = this.form.getRawValue();
    const formArrayPipelines = formData.pipelineId;
    let pipelineid = '';
    if (formArrayPipelines && formArrayPipelines.length > 0) {
      for (let i = 0; i < formArrayPipelines.length; i++) {
        pipelineid = pipelineid + formArrayPipelines[i].id;
        if (i !== formArrayPipelines.length - 1) {
          pipelineid = pipelineid + ',';
        }
      }
      formData.pipelineId = pipelineid;
    }
    this.isLoading = true;
    if (this.id) {
      this.httpService.put('v1/datasources', formData, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Data Source Successfully Updated !');
          this.router.navigate(['/home/recon', 'data-source', {
            outlets: {
              'fullBodyOutlet': ['list'],
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.httpService.post('v1/datasources', formData, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Data Source Successfully Created !');
          this.router.navigate(['/home/recon', 'data-source', {
            outlets: {
              'fullBodyOutlet': ['list'],
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  onTableChange(tableName) {
    this.httpService.get('v1/datatables/columns?table=' + tableName + '&start=0', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.length > 0) {
          this.columns = data;
        }
      }
    );
  }

  autoGenrateColName(colName, i) {
    if (colName) {
      const name = colName.replace(new RegExp('_', 'g'), ' ');
      (<FormArray>this.form.get('dataElements')).at(i).patchValue({name: name});
    }
  }

  onModuleChange(moduleId: number) {
    const moduleName = this.getModuleNameById(moduleId);
    this.pipelines = [];
    this.ssHttpService.get('v1/pipelines?filterText=' + moduleName + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (reponse: any) => {
        // this.pipelines = reponse[0];
        if (!isNullOrUndefined(reponse[0])) {
          this.pipelines = [];
          for (let i = 0; i < reponse[0].length; i++) {
            this.pipelines.push({id: reponse[0][i].pipelineId, itemName: reponse[0][i].description});
          }
        }
      });
    this.recons = [];
    this.httpService.get('v1/recons?Find=ByModule&module=' + moduleId, true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
  }

  getModuleNameById(moduleId: number): string {
    for (const module of this.modules) {
      if (module.id === Number(moduleId)) {
        return module.name;
      }
    }
  }

  encryptedChange(value: string, i) {
    (<FormArray>this.form.get('dataElements')).at(i).patchValue({maskChar: null, maskLength: null, maskType: null});
  }

  getPipelineNameByPipelineId(pipelienId, existingPipelines: any): string {
    let name = null;
    if (existingPipelines[0].length > 0) {
      for (const pipeline of existingPipelines[0]) {
        if (pipeline.pipelineId === pipelienId) {
          name = pipeline.description;
          break;
        }
      }

    }

    return name;
  }
}
