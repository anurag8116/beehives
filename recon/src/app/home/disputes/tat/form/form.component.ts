import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public modules: any[];
  public isLoading: boolean;
  public id: number = null;
  public form: FormGroup;
  public editMode: boolean;
  public numbers: number[] = [];
  public approvalTypes = [{
    value: 'EDIT_INVALID_DATA',
    name: 'Edit invalid data'
  }, {
    value: 'RECONCILED',
    name: 'Reconcile'
  }, {
    value: 'UNRECONCILED',
    name: 'Unreconcile'
  }, {
    value: 'REPORTS',
    name: 'Reports'
  }, {
    value: 'KNOCK_OFF',
    name: 'Knock Off'
  }, {
    value: 'MASTER_DATA',
    name: 'Master Data'
  }, {
    value: 'RELAX_MATCH',
    name: 'Relax Match'
  }, {
    value: 'CHARGE_BACK',
    name: 'Charge Back'
  }, {
    value: 'DISCARD_INVALID_DATA',
    name: 'Discard Invalid Data'
  }, {
    value: 'PRE_ARBITRATION',
    name: 'Pre arbitration'
  }];
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dateTableService: DataTableService, private httpService: HttpService,
              private activatedRout: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activatedRout.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      'disputeTatVo': new FormArray([]),
    });

    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.addDataElement();
    if (this.id) {
      this.isEdit(this.id);
      this.editMode = true;
    }
    Array(24).fill(0).map((x, i) => {
      this.numbers.push(i + 1);
    });
  }

  public isEdit(id: number) {
    this.httpService.get('v1/manualactiontats/' + id, true).subscribe(
      (data: any) => {
        this.form.removeControl('disputeTatVo');
        this.form.addControl('disputeTatVo', new FormArray([]));
        const control = new FormGroup({
          'id': new FormControl(id),
          'moduleId': new FormControl(data.moduleId),
          'type': new FormControl(data.type),
          'days': new FormControl(data.days),
          'cutOffTime': new FormControl(data.cutOffTime)
        });
        (<FormArray>this.form.get('disputeTatVo')).push(control);
        this.form.patchValue(data);
      }
    );
  }

  public addDataElement(): void {
    const control = new FormGroup({
      'id': new FormControl(null),
      'moduleId': new FormControl(null),
      'type': new FormControl(null),
      'days': new FormControl(null),
      'cutOffTime': new FormControl(null)
    });
    (<FormArray>this.form.get('disputeTatVo')).push(control);
    console.log('form' + this.form);
  }

  public onSubmit() {
    this.isLoading = true;
    if (this.id) {
      const formArrayConditions = <FormArray>this.form.controls['disputeTatVo'].value;
      this.httpService.put('v1/manualactiontats', this.form.controls['disputeTatVo'].value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('tat Successfully Updated !');
          this.router.navigate(['/home/disputes/part', 'tat', {
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
      this.httpService.post('v1/manualactiontats', this.form.controls['disputeTatVo'].value, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('tat Successfully stored !');
          this.router.navigate(['/home/disputes/part', 'tat', {
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

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('disputeTatVo')).removeAt(i);

  }
}
