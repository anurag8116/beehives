import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {Location} from '@angular/common';
import {isNullOrUndefined} from "util";


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public id: Number;
  public tableColumns: any;
  public filters: any;
  public isLoading: boolean;
  public masterDataElements: any;
  public invalidDataSource: any;
  public isEditMode = false;

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.form = new FormGroup({
      'id': new FormControl(null),
      'invalidData': new FormGroup({
        'id': new FormControl(null)
      }),
      'tableColumns': new FormArray([]),
      'filters': new FormArray([]),
    });
    this.addTableColumn();

    this.httpService.get('v1/invaliddatas', true).subscribe(
      (data: any) => {
        this.invalidDataSource = data.data;
      }
    );
    if (this.id) {
      this.isEditMode = true;
      this.onEdit();
    }
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
      'id': new FormControl(null),
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

  addTableColumn(): void {
    const control = new FormGroup({
      'id': new FormControl(null),
      'label': new FormControl(null),
      'fieldName': new FormControl(null),
      'dataElementId': new FormControl(null),
      'sorter': new FormControl(null),
    });
    (<FormArray>this.form.get('tableColumns')).push(control);
  }

  removeTableColumn(i: number): void {
    (<FormArray>this.form.get('tableColumns')).removeAt(i);
  }

  cancel(): void {
    this.router.navigate(['/home/etl', 'invalid-data-view', {
      outlets: {
        'fullBodyOutlet': ['list']
      }
    }]);
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

  onSubmit(): void {
    if (this.id) {
      this.isLoading = true;
      this.httpService.put('v1/invaliddataviews', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Invalid data View Successfully Updated !');
          this.router.navigate(['/home/etl', 'invalid-data-view', {
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
      this.isLoading = true;
      this.httpService.post('v1/invaliddataviews', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Invalid data View Successfully Created !');
          this.router.navigate(['/home/etl', 'invalid-data-view', {
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

  public onEdit(): void {
    this.httpService.get('v1/invaliddataviews/' + this.id, true).subscribe(
      (data: any) => {
        this.form.removeControl('tableColumns');
        this.form.addControl('tableColumns', new FormArray([]));
        this.form.removeControl('filters');
        this.form.addControl('filters', new FormArray([]));
        this.onDataSourceTypeChange(data.invalidData.id);
        this.form.get('invalidData').patchValue(data.invalidData);
        if (data.tableColumns.length > 0) {
          for (let i = 0; i < data.tableColumns.length; i++) {
            this.addTableColumn();
          }
          this.form.get('tableColumns').patchValue(data.tableColumns);
        }
        if (data.filters !== null) {
          if (data.filters.length > 0) {
            for (let i = 0; i < data.filters.length; i++) {
              this.addFilter();
            }
            this.form.get('filters').patchValue(data.filters);
          }
        }
      },
    );
  }

}
