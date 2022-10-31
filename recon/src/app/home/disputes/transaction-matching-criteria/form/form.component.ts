import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isEditMode = false;
  public id: number;
  public fieldsForCheck = [];
  public items = [{name: 'Card Number', value: 'CARD_NUMBER'}, {name: 'Account Number', value: 'ACCOUNT_NUMBER'},
    {name: 'Expiry Date', value: 'CARD_EXPIRY_DATE'}, {name: 'Card Type', value: 'CARD_TYPE'},
    {name: 'Customer Name', value: 'CUSTOMER_NAME'}, {name: 'Customer Email', value: 'CUSTOMER_EMAIL'}];
  public modules = [];
  public dataSources = [];
  public dataElementMap: Map<number, [{}]> = new Map<number, [{}]>();

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      moduleVo: new FormGroup({
        id: new FormControl(null)
      }),
      dataSourceVo: new FormGroup({
        id: new FormControl(null)
      }),
      name: new FormControl(null),
      itemVos: new FormArray([])
    });
    this.addDataElement();
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

  public addDataElement(): void {
    const control = new FormGroup({
      id: new FormControl(null),
      dataSourceElement: new FormControl(null),
      disputeField: new FormControl(null),
      jointType: new FormControl(null),
      viewOrder: new FormControl(null)
    });
    (<FormArray>this.form.get('itemVos')).push(control);
  }

  public removeElement(i: number): void {
    (<FormArray>this.form.get('itemVos')).removeAt(i);
  }

  onModuleChange(id: number) {
    if (id > 0) {
      this.httpService.get('v1/datasources?Find=ByModule&moduleId=' + id, true).subscribe(
        (data: any) => {
          this.dataSources = data.data;
          if (!isNullOrUndefined(this.dataSources) && this.dataSources.length > 0) {
            for (let i = 0; i < this.dataSources.length; i++) {
              this.dataElementMap.set(this.dataSources[i].id, this.dataSources[i].dataElements);
            }
            this.changeDef.detectChanges();
          }
        }
      );
    }
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
      this.httpService.put('v1/transactionmatchingcriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Transaction Matching Criteria Successfully Updated !');
          this.router.navigate(['/home/disputes/part', 'transaction-matching-criteria', {
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
      this.httpService.post('v1/transactionmatchingcriterias', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Transaction Matching Criteria Successfully Created !');
          this.router.navigate(['/home/disputes/part', 'transaction-matching-criteria', {
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
    console.log(id);
    this.httpService.get('v1/transactionmatchingcriterias/' + this.id, true).subscribe(
      (data: any) => {
        this.form.removeControl('itemVos');
        this.form.addControl('itemVos', new FormArray([]));
        for (const obj of data.itemVos) {
          const control = new FormGroup({
            id: new FormControl(obj.id),
            dataSourceElement: new FormControl(obj.dataSourceElement),
            disputeField: new FormControl(obj.disputeField),
            jointType: new FormControl(obj.jointType),
            viewOrder: new FormControl(null)
          });
          (<FormArray>this.form.get('itemVos')).push(control);
        }
        this.form.patchValue(data);
        this.onModuleChange(data.moduleVo.id);
        // this.changeDef.detectChanges();
      }
    );
  }
}
