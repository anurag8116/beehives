import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean;
  public modules = [];
  public fieldsForCheck = [];
  public id: number;
  public isEditMode = false;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      'name': new FormControl(null),
      'module': new FormGroup({
        'id': new FormControl(null)
      }),
      'id': new FormControl(),
      'fields': new FormArray([])
    });

    this.addFields();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );

    this.httpService.get('v1/datatables/columns?table=' + 'dispute' + '&start=0', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.length > 0) {
          this.fieldsForCheck = data;
        }
      }
    );

    if (this.id) {
      this.onEdit(this.id);
      this.isEditMode = true;
    }
  }

  public addFields(): void {
    const control = new FormGroup({
      'field': new FormControl(null),
      'type': new FormControl(null),
      'viewOrder': new FormControl(null)
    });
    (<FormArray>this.form.get('fields')).push(control);
  }

  public removefields(i: number): void {
    (<FormArray>this.form.get('fields')).removeAt(i);

  }

  // onModuleSelect(id: number) {}

  onSubmit() {
    const formArrayConditions = <FormArray>this.form.controls['fields'];
    if (formArrayConditions.length > 0) {
      for (let i = 0; i < formArrayConditions.length; i++) {
        formArrayConditions.at(i).get('viewOrder').setValue(i + 1);
      }
    }
    if (this.id) {
      this.httpService.put('v1/duplicatecriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('DuplicateCriteria Successfully updated !');
          this.router.navigate(['/home/disputes/part', 'duplicate-criteria', {
            outlets: {
              'bodyOutlet': ['list'],
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.httpService.post('v1/duplicatecriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('DuplicateCriteria Successfully Created !');
          this.router.navigate(['/home/disputes/part', 'duplicate-criteria', {
            outlets: {
              'bodyOutlet': ['list'],
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
    this.httpService.get('v1/duplicatecriterias/' + this.id, true).subscribe(
      (data: any) => {
        this.form.patchValue({module: {name: data.module.name}});
        this.form.removeControl('fields');
        this.form.addControl('fields', new FormArray([]));
        for (const obj of data.fields) {
          this.addFields();
        }
        this.form.patchValue(data);
        this.changeDef.detectChanges();
      }
    );
  }

}
