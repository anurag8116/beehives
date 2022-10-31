import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {Location} from '@angular/common';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public dataSourceViewId: Number;
  public isEditMode = false;
  public tableColumns: any;
  public filters: any;
  public isLoading: boolean;
  public masterDataElements: any[] = [];
  public dataSources: any;
  public recons: any[] = [];
  public isShow = false;

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.dataSourceViewId = +params['dataSourceViewId'] || null;
    });
    this.httpService.get('v1/recons', true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
    this.form = new FormGroup({
      'id': new FormControl(null),
      'recon': new FormGroup({
        'id': new FormControl(null)
      }),
      'dataSource': new FormGroup({
        'id': new FormControl(null)
      }),
      'tableColumns': new FormArray([]),
      'filters': new FormArray([]),
    });
    if (this.dataSourceViewId) {
      this.onEdit();
      this.isEditMode = true;
    } else {
      this.addTableColumn();
      this.addFilter();
    }
  }

  public onReconChange(id: number) {
    if (id > 0) {
      this.isShow = true;
    }
    this.httpService.get('v1/datasources?Find=ByRecon&reconId=' + id, true).subscribe(
      (data: any) => {
        this.dataSources = data.data;
      }
    );
  }

  public onDataSourceTypeChange(id: string): void {
    if (id) {
      this.httpService.get('v1/invaliddatas/' + id + '?find=DataElements', true).subscribe(
        (data: any) => {
          this.masterDataElements = data.data;
        }
      );
    } else {
      this.masterDataElements = [];
    }
  }

  addFilter(): void {
    const control = new FormGroup({
      'label': new FormControl(null),
      'fieldName': new FormControl(null),
      'inputType': new FormControl(null),
      'lookUpProvider': new FormControl(null)
    });
    (<FormArray>this.form.get('filters')).push(control);
  }

  removeFilter(i: number): void {
    (<FormArray>this.form.get('filters')).removeAt(i);
  }

  removeDataSource(a: number): void {
    (<FormArray>this.form.get('unmatched')).removeAt(a);
  }

  addTableColumn(): void {
    const control = new FormGroup({
      'label': new FormControl(null),
      'dataElementId': new FormControl(null),
      'fieldName': new FormControl(null),
      'sorter': new FormControl(null),
    });
    (<FormArray>this.form.get('tableColumns')).push(control);
  }

  removeTableColumn(i: number): void {
    (<FormArray>this.form.get('tableColumns')).removeAt(i);
  }

  cancel(): void {
    this.router.navigate(['/home/recon', 'unmatched-transaction-view', {
      outlets: {
        'fullBodyOutlet': ['list']
      }
    }]);
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.isEditMode) {
      this.httpService.put('v1/unmatchedtransactions', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Unmatched Transaction Successfully Updated !');
          this.router.navigate(['/home/recon', 'unmatched-transaction-view', {
            outlets: {
              'fullBodyOutlet': ['list']
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.httpService.post('v1/unmatchedtransactions', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Unmatched Transaction Successfully Created !');
          this.router.navigate(['/home/recon', 'unmatched-transaction-view', {
            outlets: {
              'fullBodyOutlet': ['list']
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  autoGenrateColName(colNameId, i) {
    if (colNameId) {
      for (const element of this.masterDataElements) {
        if (element.id === +colNameId) {
          const name = element.filedName.replace(new RegExp('_', 'g'), ' ');
          (<FormArray>this.form.get('tableColumns')).at(i).patchValue({label: name, fieldName: element.filedName});
          break;
        }
      }
    }
  }

  autoGenrateFilterLabel(colName, i) {
    if (colName) {
      const name = colName.replace(new RegExp('_', 'g'), ' ');
      (<FormArray>this.form.get('filters')).at(i).patchValue({label: name});
    }
  }

  public onEdit(): void {
    this.httpService.get('v1/unmatchedtransactions/' + this.dataSourceViewId, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          /*          this.form.removeControl('unmatched');
                    this.form.addControl('unmatched', new FormArray([]));*/
        }
        this.onReconChange(data.reconVo.id);
        this.onDataSourceTypeChange(data.datasourceVo.id);
        this.form.patchValue({id: data.id, recon: {id: data.reconVo.id}, dataSource: {id: data.datasourceVo.id}});
        for (let i = 0; i <= data.tableColumns.length - 1; i++) {
          this.addTableColumn();
        }
        this.form.get('tableColumns').patchValue(data.tableColumns);
        for (let j = 0; j <= data.filters.length - 1; j++) {
          this.addFilter();
        }
        this.form.get('filters').patchValue(data.filters);
      },
    );
  }

}
