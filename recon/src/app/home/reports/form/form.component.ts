import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';

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
  public allSorters: any;
  public isLoading: boolean;
  public isPadding: boolean;
  public dataproviders: any;
  public dataprovider: any;
  public isHeader = false;
  public isTemplate = false;
  public numbers = new Array(100).fill(0).map((x, i) => i);

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      this.moduleId = +params['groupId'] || null;
    });
    this.allSorters = [];
    this.dataprovider = {'filters': [], 'sorters': [], 'metaData': []};
    this.form = new FormGroup({
      'id': new FormControl(null),
      'name': new FormControl(),
      'module': new FormGroup({
        'id': new FormControl(this.moduleId)
      }),
      'reportType': new FormControl(),
      'dataProvider': new FormControl(),
      'formatter': new FormGroup({
        'maxRecord': new FormControl(),
        'header': new FormControl(),
        'sheetNumber': new FormControl(),
        'headerRowNumber': new FormControl(),
        'dataRowNumber': new FormControl(),
        'template': new FormControl(),
        'templateFilePath': new FormControl(),
        'templateFileName': new FormControl(),
        'separator': new FormControl(),
        'tableColumns': new FormArray([
          new FormGroup({
            'columnNumber': new FormControl(null),
            'label': new FormControl(null),
            'fieldName': new FormControl(null),
            'padding': new FormControl(true),
            'peddingType': new FormControl(null),
            'fieldLength': new FormControl(null),
          }),
        ]),
      }),
      'filters': new FormArray([
        new FormGroup({
          'constantValue': new FormControl(null),
          'fieldName': new FormControl(null)
        })
      ]),
      'sorters': new FormArray([]),
      'deliverTo': new FormArray([])
    });

    this.httpService.get('v1/datasets/all', true).subscribe(
      (data: any) => {
        this.dataproviders = data;
      }
    );
    if (this.id) {
      this.onEdit();
    }

  }

  public onHeaderChange(value: boolean): void {
    if (this.isHeader) {
      this.isHeader = false;
    } else {
      this.isHeader = true;
    }
  }

  public onTemplateChange(value: boolean): void {
    if (this.isTemplate) {
      this.isTemplate = false;
    } else {
      this.isTemplate = true;
    }
  }

  public fileChangeEvent(event: any, index: number): void {
    /*console.log('file data ' + event.fileName);*/
    (this.form.get('formatter')).patchValue({templateFilePath: event.filePath, templateFileName: event.fileName});
  }

  public onDataProviderChange(id: string): void {
    const control = <FormArray>this.form.controls['sorters'];
    for (let i = control.length - 1; i >= 0; i--) {
      control.removeAt(i);
    }
    this.httpService.get('v1/datasets/' + id, true).subscribe(
      (data: any) => {
        this.dataprovider = data;
        this.allSorters = data.sorters;
        if (data.sorters) {
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
      'sortOrder': new FormControl(null)
    });
    (<FormArray>this.form.get('sorters')).push(control);
  }

  removeSorter(i: number): void {
    (<FormArray>this.form.get('sorters')).removeAt(i);
  }

  addFilter(): void {
    const control = new FormGroup({
      'constantValue': new FormControl(null),
      'fieldName': new FormControl(null)
    });
    (<FormArray>this.form.get('filters')).push(control);
  }

  removeFilter(i: number): void {
    (<FormArray>this.form.get('filters')).removeAt(i);
  }

  addTableColumn(): void {
    const control = new FormGroup({
      'columnNumber': new FormControl(null),
      'label': new FormControl(null),
      'fieldName': new FormControl(null),
      'padding': new FormControl(true),
      'peddingType': new FormControl(null),
      'fieldLength': new FormControl(null),
    });
    (<FormArray>this.form.get('formatter').get('tableColumns')).push(control);
  }

  removeTableColumn(i: number): void {
    (<FormArray>this.form.get('formatter').get('tableColumns')).removeAt(i);
  }

  removeDeliverTo(i: number): void {
    (<FormArray>this.form.get('deliverTo')).removeAt(i);
  }

  addDeliverTo(): void {
    const control = new FormGroup({
      'name': new FormControl(null),
      'email': new FormControl(null)
    });
    (<FormArray>this.form.get('deliverTo')).push(control);
  }

  cancel(): void {
    this.router.navigate(['/home/reports/part', {
      outlets: {
        'sideOutlet': ['list'],
        'bodyOutlet': ['bodyOutlet']
      }
    }]);
  }

  onSubmit(): void {
    if (this.id) {
      this.isLoading = true;
      this.httpService.put('v1/reports', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Report Successfully Updated !');
          this.router.navigate(['/home/reports', 'part', {outlets: {'sideOutlet': ['list'], 'bodyOutlet': ['detail', data.id]}}]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = true;
      this.httpService.post('v1/reports', this.form.value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Report Successfully Created !');
          this.router.navigate(['/home/reports', 'part', {outlets: {'sideOutlet': ['list'], 'bodyOutlet': ['detail', data.id]}}]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  public onEdit(): void {
    this.httpService.get('v1/reports/' + this.id, true).subscribe(
      (data: any) => {
        if (data.formatter.tableColumns.length > 1) {
          for (let i = 1; i < data.formatter.tableColumns.length; i++) {
            this.addTableColumn();
          }
        }
        this.isHeader = data.formatter.header;
        this.isTemplate = data.formatter.template;
        if (data.filters) {
          if (data.filters.length > 1) {
            for (let i = 1; i < data.filters.length; i++) {
              this.addFilter();
            }
          }
        } else {
          data.filters = [];
          this.removeFilter(0);
        }
        if (data.sorters) {
          data.sorters.forEach((item, index) => {
            this.addSorter(item.name);
          });
        } else {
          data.sorters = [];
        }

        if (data.deliverTo != null) {
          for (let i = 1; i < data.deliverTo.length; i++) {
            this.addDeliverTo();
          }
        } else {
          data.deliverTo = [];
        }
        this.form.patchValue(data);
        this.onDataProviderChange(data.dataProvider);
      },
    );
  }
}

