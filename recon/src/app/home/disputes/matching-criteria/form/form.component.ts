import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})

export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isEditMode = false;
  public id: number;
  public disputColumns = [];
  public repersermentColumns = [];
  public modules = [];

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      moduleId: new FormControl(null),
      name: new FormControl(null),
      itemVos: new FormArray([])
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
    this.httpService.get('v1/datatables/columns?table=dispute&start=0', true).subscribe(
      (data: any) => {
        this.disputColumns = data;
      }
    );
    this.httpService.get('v1/datatables/columns?table=t_nfs_dispute_issuer_valid&start=0', true).subscribe(
      (data: any) => {
        this.repersermentColumns = data;
      }
    );
  }

  public addDataElement(): void {
    const control = new FormGroup({
      id: new FormControl(null),
      disputeCol: new FormControl(null),
      represermentCol: new FormControl(null),
      jointType: new FormControl(null),
      viewOrder: new FormControl(null)
    });
    (<FormArray>this.form.get('itemVos')).push(control);
  }

  public removeElement(i: number): void {
    (<FormArray>this.form.get('itemVos')).removeAt(i);
  }

  onSubmit() {
    this.isLoading = true;
    const formArrayConditions = <FormArray>this.form.controls['itemVos'];
    if (formArrayConditions.length > 0) {
      for (let i = 0; i < formArrayConditions.length; i++) {
        formArrayConditions.at(i).get('viewOrder').setValue(i + 1);
      }
    }
    if (this.id) {
      this.httpService.put('v1/disputematchingcriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Dispute Criteria Successfully Updated !');
          this.router.navigate(['/home/disputes/part', 'matching-criteria', {
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
      this.httpService.post('v1/disputematchingcriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Dispute Criteria Successfully Created !');
          this.router.navigate(['/home/disputes/part', 'matching-criteria', {
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
    this.httpService.get('v1/disputematchingcriterias/' + this.id, true).subscribe(
      (data: any) => {
        this.form.removeControl('itemVos');
        this.form.addControl('itemVos', new FormArray([]));
        for (const obj of data.itemVos) {
          this.addDataElement();
        }
        this.form.patchValue(data);
        // this.changeDef.detectChanges();
      }
    );
  }

  getColumnByTableName(tableName): any {
    this.httpService.get('v1/datatables/columns?table=' + tableName + '&start=0', true).subscribe(
      (data: any) => {
        return data;
        /* if (!isNullOrUndefined(data) && data.length > 0) {
           return data;
         } else {
           return [];
         }*/
      }
    );
  }

}
