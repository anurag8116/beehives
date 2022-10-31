import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../shared/services/http-service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public id: Number;
  public moduleId: Number;
  public tableColumns: any;
  public filters: any;
  public sorters: any;
  public isLoading: boolean;
  public dataproviders: any;
  public lookUpProviders: any;
  public dataprovider: any;
  public isEditMode = false;
  public lookupDataFilter: Map<number, [{}]> = new Map<number, [{}]>();

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      this.moduleId = +params['groupId'] || null;
    });
    this.dataprovider = {'filters': [], 'sorters': [], 'metaData': []};
    this.form = new FormGroup({
      'id': new FormControl(null),
      'name': new FormControl(),
      'seriesColumn': new FormControl(),
      'labelColumn': new FormControl(),
      'countColumn': new FormControl(),
      'refreshType': new FormControl(),
      'refreshTime': new FormControl(),
      'kpiLabel': new FormControl(),
      'kpiLabelColumn': new FormControl(),
      'module': new FormGroup({
        'id': new FormControl(this.moduleId)
      }),
      'dashletType': new FormControl('LIST'),
      'defaultDashletType': new FormControl(),
      'dashletDownloadType': new FormControl(),
      'dataProvider': new FormControl(),
      'tableColumns': new FormArray([]),
      'filters': new FormArray([]),
      'sorters': new FormArray([]),
      'dashletTolerances': new FormArray([]),
      'colors': new FormArray([])
    });

    this.httpService.get('v1/datasets/all', true).subscribe(
      (data: any) => {
        this.dataproviders = data;
      }
    );
    this.httpService.get('v1/lookupproviders/all', true).subscribe(
      (data: any) => {
        this.lookUpProviders = data;
      }
    );
    if (this.id) {
      this.isEditMode = true;
      this.onEdit();
    }

  }

  public onDataProviderChange(id: string, fromEdit: boolean): void {
    this.httpService.get('v1/datasets/' + id, true).subscribe(
      (data: any) => {
        this.dataprovider = data;
        if (!fromEdit && data.sorters) {
          data.sorters.forEach((item, index) => {
            this.addSorter(item.name);
          });
        }
      }
    );
  }

  addSorter(name: string): void {
    const control = new FormGroup({
      'name': new FormControl(name),
      'enable': new FormControl(null)
    });
    (<FormArray>this.form.get('sorters')).push(control);
  }

  removeSorter(i: number): void {
    (<FormArray>this.form.get('sorters')).removeAt(i);
  }

  addDashletTolerance(): void {
    const control = new FormGroup({
      'label': new FormControl(null),
      'value': new FormControl(null),
      'position': new FormControl(null),
      'scale': new FormControl(null),
      'mode': new FormControl(null),
      'colorCode': new FormControl(null)
    });
    (<FormArray>this.form.get('dashletTolerances')).push(control);
  }

  removeDashletTolerance(i: number): void {
    (<FormArray>this.form.get('dashletTolerances')).removeAt(i);
  }

  addFilter(): void {
    const control = new FormGroup({
      'label': new FormControl(null),
      'fieldName': new FormControl(null),
      'inputType': new FormControl(null),
      'dateType': new FormControl('ALL'),
      'lookUpProvider': new FormControl(null),
      'staticValue': new FormControl(null),
      viewOrdring: new FormControl(null)
    });
    (<FormArray>this.form.get('filters')).push(control);
  }

  removeFilter(i: number): void {
    (<FormArray>this.form.get('filters')).removeAt(i);
  }

  addColor(): void {
    const control = new FormGroup({
      'fieldName': new FormControl(null),
      'conditionName': new FormControl(null),
      'conditionValue': new FormControl(null),
      'colorCode': new FormControl(null)
    });
    (<FormArray>this.form.get('colors')).push(control);
  }

  removeColor(i: number): void {
    (<FormArray>this.form.get('colors')).removeAt(i);
  }

  addTableColumn(): void {
    const control = new FormGroup({
      'label': new FormControl(null),
      'fieldName': new FormControl(null),
      viewOrdring: new FormControl(null),
    });
    (<FormArray>this.form.get('tableColumns')).push(control);
  }

  removeTableColumn(i: number): void {
    (<FormArray>this.form.get('tableColumns')).removeAt(i);
  }

  cancel(): void {
    this.router.navigate(['/home/dashboard', 'dashlet', {
      outlets: {
        'sideOutlet': ['list'],
        'bodyOutlet': ['bodyOutlet']
      }
    }]);
  }

  onSubmit(): void {
    const formArrayConditions = <FormArray>this.form.controls['tableColumns'];
    if (formArrayConditions.length > 0) {
      for (let i = 0; i < formArrayConditions.length; i++) {
        formArrayConditions.at(i).get('viewOrdring').setValue(i + 1);
      }
    }
    const filterArray = <FormArray>this.form.controls['filters'];
    if (filterArray.length > 0) {
      for (let i = 0; i < filterArray.length; i++) {
        filterArray.at(i).get('viewOrdring').setValue(i + 1);
      }
    }
    if (this.id) {
      this.isLoading = true;
      this.httpService.put('v1/dashlets', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Dashlet Successfully Updated !');
          this.router.navigate(['/home/dashboard', 'dashlet', {outlets: {'sideOutlet': ['list'], 'bodyOutlet': ['detail', data.id]}}]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = true;
      this.httpService.post('v1/dashlets', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Dashlet Successfully Created !');
          this.router.navigate(['/home/dashboard', 'dashlet', {outlets: {'sideOutlet': ['list'], 'bodyOutlet': ['detail', data.id]}}]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  public onEdit(): void {
    this.httpService.get('v1/dashlets/' + this.id, true).subscribe(
      (data: any) => {
        if (data.tableColumns.length > 0) {
          this.form.removeControl('tableColumns');
          this.form.addControl('tableColumns', new FormArray([]));
          for (let i = 0; i < data.tableColumns.length; i++) {
            this.addTableColumn();
          }
        }
        if (!isNullOrUndefined(data.filters) && data.filters.length > 0) {
          this.form.removeControl('filters');
          this.form.addControl('filters', new FormArray([]));
          for (let i = 0; i < data.filters.length; i++) {
            this.addFilter();
            const filter = data.filters[i];
            if (filter && filter.inputType === 'DROPDOWN') {
              this.getLookUpProviderValue(filter.lookUpProvider);
            }
          }
        } else {
          data.filters = [];
        }
        if (isNullOrUndefined(data.sorters)) {
          data.sorters = [];
        }
        if (!isNullOrUndefined(data.sorters) && data.sorters.length > 0) {
          this.form.removeControl('sorters');
          this.form.addControl('sorters', new FormArray([]));
          data.sorters.forEach((item, index) => {
            this.addSorter(item.name);
          });
        }
        if (!isNullOrUndefined(data.colors) && data.colors.length > 0) {
          this.form.removeControl('colors');
          this.form.addControl('colors', new FormArray([]));
          for (let i = 0; i < data.colors.length; i++) {
            this.addColor();
          }
        } else {
          data.colors = [];
        }
        if (!isNullOrUndefined(data.dashletTolerances) && data.dashletTolerances.length > 0) {
          this.form.removeControl('dashletTolerances');
          this.form.addControl('dashletTolerances', new FormArray([]));
          for (let i = 0; i < data.dashletTolerances.length; i++) {
            this.addDashletTolerance();
          }
        } else {
          data.dashletTolerances = [];
        }
        this.form.patchValue(data);
        this.onDataProviderChange(data.dataProvider, true);
      },
    );
  }


  private getLookUpProviderValue(lookUpProviderId) {
    if (lookUpProviderId) {
      this.httpService.get('v1/lookupproviders/' + lookUpProviderId + '/execute', true).subscribe(
        (lookUpProviderData: any) => {
          this.lookupDataFilter.set(lookUpProviderId, lookUpProviderData.data);
        }
      );
    }
  }


}

