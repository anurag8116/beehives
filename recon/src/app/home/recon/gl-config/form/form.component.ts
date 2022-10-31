import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public id: number;
  public isForm = false;
  public isEditMode = false;
  public dataSourceMap: Map<number, [{}]> = new Map<number, [{}]>();
  public dataElements = [];
  /*  public operators = ['EQUAL', 'LESS_THAN', 'LESS_THAN_EQUAL', 'GREATER_THAN', 'GREATER_THAN_EQUAL',
      'NOT_EQUAL', 'IN', 'NOT_IN', 'LIKE', 'NOT_LIKE', 'BETWEEN', 'NOT_BETWEEN', 'IS_NULL', 'IS_NOT_NULL'];*/
  public valueTypes = ['VARIANCE', 'STATIC'];
  public varianceTypes = ['PERCENTAGE', 'ADD', 'ADD_PERCENTAGE', 'SUBTRACT', 'SUBTRACT_PERCENTAGE'];
  public dataSources = [];
  public formulaTypes = ['PERCENTAGE', 'ADD', 'MULTIPLY', 'DIVIDE', 'SUBTRACT', 'CONSTANT_VALUE', 'FIX_VALUE'];

  public filterValueTypes: Map<string, any[]> = new Map<string, any[]>();
  public filterOperators: Map<string, any[]> = new Map<string, any[]>();
  public filterSlabCondOperators: Map<string, any[]> = new Map<string, any[]>();
  public operators = [
    {id: 'EQUAL', value: 'Equals To', type: ['ALL']},
    {id: 'LESS_THAN', value: 'Less Than', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'LESS_THAN_EQUAL', value: 'Less Than Equals To', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'GREATER_THAN', value: 'Greater Than', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'GREATER_THAN_EQUAL', value: 'Greater Than Equals To', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'NOT_EQUAL', value: 'Not Equals To', type: ['ALL']},
    {id: 'IN', value: 'In', type: ['ALL']},
    {id: 'NOT_IN', value: 'Not In', type: ['ALL']}, {id: 'LIKE', value: 'Like', type: ['VARCHAR']},
    {id: 'NOT_LIKE', value: 'Not Like', type: ['VARCHAR']},
    {id: 'BETWEEN', value: 'Between', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'NOT_BETWEEN', value: 'Not Between', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'IS_NULL', value: 'Is Null', type: ['ALL']},
    {id: 'IS_NOT_NULL', value: 'Is Not Null', type: ['ALL']}];

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.isForm = true;
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      if (this.id) {
        this.isForm = false;
      }
    });
    this.isLoading = false;
    this.form = new FormGroup({
      'glNumber': new FormControl(null),
      'glName': new FormControl(null),
      'id': new FormControl(null),
      'configDetails': new FormArray([])
    });


    this.addConfiguration(true);
    if (this.id) {
      this.httpService.get('v1/datasources/', true).subscribe(
        (data: any) => {
          this.dataSources = data.data;
          if (!isNullOrUndefined(this.dataSources) && this.dataSources.length > 0) {
            for (let i = 0; i < this.dataSources.length; i++) {
              this.dataSourceMap.set(this.dataSources[i].id, this.dataSources[i].dataElements);
            }
            this.onEdit(this.id);
            this.isEditMode = true;
          }
        }
      );
    } else {
      this.httpService.get('v1/datasources/', true).subscribe(
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
    $('.panel-collapse').on('show.bs.collapse', function () {
      $(this).siblings('.panel-heading').addClass('active');
    });

    $('.panel-collapse').on('hide.bs.collapse', function () {
      $(this).siblings('.panel-heading').removeClass('active');
    });
  }

  public addConfiguration(isNew: boolean = false): void {
    const control = new FormGroup({
      'id': new FormControl(null),
      'transactionType': new FormControl(null),
      'description': new FormControl(''),
      'dataSourceId': new FormControl(null),
      'trxnDateColumnId': new FormControl(null),
      'sequence': new FormControl(null),
      'conditions': new FormArray([]),
      'glSlabs': new FormArray([])
    });
    const configDetails = (<FormArray>this.form.get('configDetails'));
    configDetails.push(control);
    if (isNew) {
      this.addCommanConditions(configDetails.length - 1);
      this.addGlSlab(configDetails.length - 1, true);
    }
  }

  public removeconfig(i: number): void {
    (<FormArray>this.form.get('configDetails')).removeAt(i);
  }

  public addCommanConditions(a: number): void {
    const control = new FormGroup({
      'matchingOperator': new FormControl(null),
      'valueType': new FormControl(null),
      'value': new FormControl(null),
      'varianceType': new FormControl(null),
      'dataElement': new FormControl(null),
      'sequence': new FormControl(null),
      'conditionJointType': new FormControl('AND')

    });
    (<FormArray>(<FormArray>this.form.get('configDetails')).at(a).get('conditions')).push(control);
  }

  public removeCondition(i: number, a: number): void {
    (<FormArray>(<FormArray>this.form.get('configDetails')).at(i).get('conditions')).removeAt(a);

  }

  updateFormSlapCondition(conditionType: string, i, b, c) {
    if (conditionType) {
      (<FormArray>(<FormArray>(<FormArray>this.form.get('configDetails')).at(i).get('glSlabs')).at(b).get('slabConditions')).at(c).patchValue({conditionJointType: conditionType});
    }
  }

  updateFormConditionType(conditionType: string, i, b) {
    if (conditionType) {
      (<FormArray>(<FormArray>this.form.get('configDetails')).at(i).get('conditions')).at(b).patchValue({conditionJointType: conditionType});
    }
  }

  public addGlSlab(i: number, isNew: boolean = false): void {
    const control = new FormGroup({
      'formulaSelect': new FormControl(null),
      'value': new FormControl(null),
      'field': new FormControl(null),
      'sequence': new FormControl(null),
      'conditionJointType': new FormControl('AND'),
      'slabConditions': new FormArray([])
    });
    const glSlabs = (<FormArray>(<FormArray>this.form.get('configDetails')).at(i).get('glSlabs'));
    glSlabs.push(control);
    if (isNew) {
      this.addSlabConditions(i, glSlabs.length - 1);
    }
  }

  public removSlab(configDetailIndex, slabIndex) {
    (<FormArray>((<FormArray>this.form.get('configDetails')).at(configDetailIndex)).get('glSlabs')).removeAt(slabIndex);

  }

  public addSlabConditions(i: number, b: number): void {
    const control = new FormGroup({
      'dataElement': new FormControl(null),
      'matchingOperator': new FormControl(null),
      'value': new FormControl(null),
      'conditionJointType': new FormControl('AND'),
      'sequence': new FormControl(null)

    });
    (<FormArray>(<FormArray>(<FormArray>this.form.get('configDetails')).at(i).get('glSlabs')).at(b)
      .get('slabConditions')).push(control);
  }

  public removeSlabConditions(configDetailIndex, slabIndex, slabConditionIndex) {
    (<FormArray>((<FormArray>((<FormArray>this.form.get('configDetails')).at(configDetailIndex))
      .get('glSlabs')).at(slabIndex)).get('slabConditions')).removeAt(slabConditionIndex);

  }

  public onSelectMultipleCondition(event: any, condition: any, i: number, a: number) {
    if (event.target.checked === true) {
      const detailForm = (<FormArray>this.form.get('configDetails')).at(i);
      (<FormArray>(detailForm.get('conditions'))).at(a).get('field').reset();
      (<FormArray>(detailForm.get('conditions'))).at(a).get('matchingOperator').reset();
      (<FormArray>(detailForm.get('conditions'))).at(a).get('constantValue').reset();

      this.addSlabConditions(i, a);
    } else {
      const detailForm = (<FormArray>this.form.get('configDetails')).at(i);
      (<FormGroup>(<FormArray>(detailForm.get('conditions'))).at(a)).removeControl('multiConditions');
      (<FormGroup>(<FormArray>(detailForm.get('conditions'))).at(a)).addControl('multiConditions', new FormArray([]));
    }
  }

  setOperators(elementId: number, sourceId: number, configDetailId: number, conditionIndex: number) {
    let elements = [];
    elements = this.dataSourceMap.get(sourceId);
    let elementType = null;
    for (const ele of elements) {
      if (+elementId === +ele.id) {
        elementType = ele.type;
      }
    }
    const operaters = this.operators.filter((operator: any) => operator.type.indexOf('ALL') !== -1 || operator.type.indexOf(elementType) !== -1);
    this.filterOperators.set(configDetailId + '_' + conditionIndex, operaters);
    this.filterValueTypes.set(configDetailId + '_' + conditionIndex, (elementType === 'VARCHAR' ? ['STATIC'] : ['STATIC', 'VARIANCE']));
  }

  setSlabCondOperators(elementId: number, sourceId: number, slabConditionIndex: number) {
    let elements = [];
    elements = this.dataSourceMap.get(sourceId);
    let elementType = null;
    for (const val of elements) {
      if (+elementId === +val.id) {
        elementType = val.type;
      }
    }
    const operaters = this.operators.filter((operator: any) => operator.type.indexOf('ALL') !== -1 || operator.type.indexOf(elementType) !== -1);
    this.filterSlabCondOperators.set(sourceId + '_' + elementId, operaters);
  }

  onSubmit() {
    const formArrayConditions = <FormArray>this.form.controls['configDetails'];
    if (formArrayConditions.length > 0) {
      for (let i = 0; i < formArrayConditions.length; i++) {
        formArrayConditions.at(i).get('sequence').setValue(i + 1);
        const condition = (<FormArray>formArrayConditions.at(i).get('conditions'));
        for (let j = 0; j < condition.length; j++) {
          condition.at(j).get('sequence').setValue(j + 1);
        }
        const glSlabs = (<FormArray>formArrayConditions.at(i).get('glSlabs'));
        for (let k = 0; k < glSlabs.length; k++) {
          glSlabs.at(k).get('sequence').setValue(k + 1);
          const slabConditions = (<FormArray>glSlabs.at(k).get('slabConditions'));
          for (let l = 0; l < slabConditions.length; l++) {
            slabConditions.at(l).get('sequence').setValue(l + 1);
          }
        }
      }
    }
    if (this.id) {
      this.httpService.put('v1/glconfigrations', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('GLConfig Successfully Updated !');
          this.router.navigate(['/home/recon', 'gl-config', {
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
      this.httpService.post('v1/glconfigrations', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('GLConfig Successfully Created !');
          this.router.navigate(['/home/recon', 'gl-config', {
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

  private onEdit(id: number) {
    let dataSourceId;
    this.httpService.get('v1/glconfigrations/' + id, true).subscribe(
      (data: any) => {
        this.form.removeControl('configDetails');
        this.form.addControl('configDetails', new FormArray([]));
        for (let k = 0; k < data.configDetails.length; k++) {
          this.addConfiguration();
          dataSourceId = data.configDetails[k].dataSourceId;
          for (let i = 0; i < data.configDetails[k].conditions.length; i++) {
            this.addCommanConditions(k);
            this.setOperators(data.configDetails[k].conditions[i].dataElement, dataSourceId, k, i);
          }
          for (let j = 0; j < data.configDetails[k].glSlabs.length; j++) {
            this.addGlSlab(k);
            for (let l = 0; l < data.configDetails[k].glSlabs[j].slabConditions.length; l++) {
              this.addSlabConditions(k, j);
              this.setSlabCondOperators(data.configDetails[k].glSlabs[j].slabConditions[l].dataElement, dataSourceId, l);
            }
          }
        }
        this.isForm = true;
        this.form.patchValue(data);
        this.changeDef.detectChanges();
      }
    );
  }

  public onFormulaTypeSelect(formulaType, configDetailIndex, fieldsIndex) {
    const fieldForm = (<FormArray>((<FormArray>this.form.get('configDetails')).at(configDetailIndex)).get('glSlabs')).at(fieldsIndex);
    if (formulaType === 'CONSTANT_VALUE') {
      fieldForm.get('field').patchValue(null);
      fieldForm.get('field').disable();
      fieldForm.get('value').patchValue(null);
      fieldForm.get('value').enable();
    } else if (formulaType === 'FIX_VALUE') {
      fieldForm.get('value').patchValue(null);
      fieldForm.get('value').disable();
      fieldForm.get('field').patchValue(null);
      fieldForm.get('field').enable();
    } else {
      fieldForm.get('field').patchValue(null);
      fieldForm.get('field').enable();
      fieldForm.get('value').patchValue(null);
      fieldForm.get('value').enable();
    }
  }


}
