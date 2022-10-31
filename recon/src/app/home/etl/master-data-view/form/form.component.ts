import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public id: Number;
  public tableColumns: any;
  public filters: any;
  public sorters: any;
  public isLoading: boolean;
  public isEditMode = false;
  public masterDataElements: any;
  public masterdatatypes: any;

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.form = new FormGroup({
      'id': new FormControl(null),
      'masterData': new FormGroup({
        'id': new FormControl(null)
      }),
      'tableColumns': new FormArray([]),
      'filters': new FormArray([]),
      'sorters': new FormArray([])
    });
    this.addTableColumn();
    this.addFilter();
    this.httpService.get('v1/masterdatatypes', true).subscribe(
      (data: any) => {
        this.masterdatatypes = data.data;
      }
    );
    if (this.id) {
      this.isEditMode = true;
      this.onEdit();
    }

  }

  public onMasterDataTypeChange(id: string): void {
    if (id) {
      this.httpService.get('v1/masterdatatypes/' + id, true).subscribe(
        (data: any) => {
          this.masterDataElements = data.masterDataElement;
          if (this.masterDataElements.length > 0) {
            this.form.removeControl('sorters');
            this.form.addControl('sorters', new FormArray([]));
            for (let i = 0; i < this.masterDataElements.length; i++) {
              this.addSorter();
            }
          }
        }
      );
    } else {
      this.masterDataElements = [];
    }
  }

  addSorter(): void {
    const control = new FormGroup({
      'name': new FormControl(null)
    });
    (<FormArray>this.form.get('sorters')).push(control);
  }

  removeSorter(i: number): void {
    (<FormArray>this.form.get('sorters')).removeAt(i);
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
    });
    (<FormArray>this.form.get('tableColumns')).push(control);
  }

  removeTableColumn(i: number): void {
    (<FormArray>this.form.get('tableColumns')).removeAt(i);
  }

  cancel(): void {
    this.router.navigate(['/home/etl', 'master-data-view', {
      outlets: {
        'fullBodyOutlet': ['list']
      }
    }]);
  }

  onSubmit(): void {
    if (this.id) {
      this.isLoading = true;
      this.httpService.put('v1/masterdataviews', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Master data Successfully Updated !');
          this.router.navigate(['/home/etl', 'master-data-view', {
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
      this.httpService.post('v1/masterdataviews', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Master data Successfully Created !');
          this.router.navigate(['/home/etl', 'master-data-view', {
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
    this.httpService.get('v1/masterdataviews/' + this.id, true).subscribe(
      (data: any) => {
        this.form.removeControl('tableColumns');
        this.form.addControl('tableColumns', new FormArray([]));
        this.form.removeControl('filters');
        this.form.addControl('filters', new FormArray([]));
        this.onMasterDataTypeChange(data.masterData.id);
        if (data.tableColumns.length > 0) {
          for (let i = 0; i < data.tableColumns.length; i++) {
            this.addTableColumn();
          }
        }
        if (data.filters.length > 0) {
          for (let i = 0; i < data.filters.length; i++) {
            this.addFilter();
          }
        }
        this.form.patchValue(data);
      },
    );
  }

  autoGenrateColName(colNameId, i) {
    if (colNameId) {
      for (const element of this.masterDataElements) {
        if (element.id === +colNameId) {
          const name = element.tableColumn.replace(new RegExp('_', 'g'), ' ');
          (<FormArray>this.form.get('tableColumns')).at(i).patchValue({label: name, fieldName: element.tableColumn});
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

}
