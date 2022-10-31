import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isEditMode = false;
  public id: number;
  public dataSources = [];
  public modules = [];
  public dataSourceMap: Map<number, [{}]> = new Map<number, [{}]>();

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      module: new FormGroup({
        id: new FormControl(null)
      }),
      dataElementMapping: new FormArray([])
    });
    this.addDataElement();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );

    if (this.id) {
      this.onEdit(this.id);
      this.isEditMode = true;
    }
  }

  onModuleSelect(id: number) {
    if (id > 0) {
      this.httpService.get('v1/datasources?Find=ByModule&moduleId=' + id, true).subscribe(
        (data: any) => {
          this.dataSources = data.data;
          if (!isNullOrUndefined(this.dataSources) && this.dataSources.length > 0) {
            for (let i = 0; i < this.dataSources.length; i++) {
              this.dataSourceMap.set(this.dataSources[i].id, this.dataSources[i].dataElements);
            }
            this.changeDef.detectChanges();
          }
        }
      );
    }
  }

  public addDataElement(): void {
    const control = new FormGroup({
      name: new FormControl(null),
      id: new FormControl(null),
      dataSourcePrimary: new FormGroup({
        id: new FormControl(null)
      }),
      dataSourceSecondary: new FormGroup({
        id: new FormControl(null)
      }),
      dataElementPrimary: new FormGroup({
        id: new FormControl(null)
      }),
      dataElementSecondary: new FormGroup({
        id: new FormControl(null)
      })
    });
    (<FormArray>this.form.get('dataElementMapping')).push(control);
  }

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('dataElementMapping')).removeAt(i);
  }

  onSubmit() {
    this.isLoading = true;

    if (this.id) {
      this.httpService.put('v1/recondataelements', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Data Element Successfully Updated !');
          this.router.navigate(['/home/recon', 'data-element', {
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
      this.httpService.post('v1/recondataelements', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Data Element Successfully Created !');
          this.router.navigate(['/home/recon', 'data-element', {
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

  public onEdit(id: number) {
    this.httpService.get('v1/recondataelements/data/' + this.id, true).subscribe(
      (data: any) => {
        this.onModuleSelect(data.module.id);
        this.form.removeControl('dataElementMapping');
        this.form.addControl('dataElementMapping', new FormArray([]));
        for (const obj of data.dataElementMapping) {
          this.addDataElement();
        }
        this.form.patchValue(data);
        this.changeDef.detectChanges();
      }
    );
  }
}
