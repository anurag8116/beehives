import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {HttpErrorResponse} from '@angular/common/http';
import { E } from '@angular/core/src/render3';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public modules = [];
  public recons = [];
  public dataSources = [];
  public secDataSource = [];
  public mergeDataElements = [];
  public secondColumnMap: Map<number, any[]> = new Map<number, any[]>();
  public secondColumnVisibility: Map<number, boolean> = new Map<number, boolean>();
  public dataElementsPri = [];
  public dataElementsSec = [];
  public columns = [];
  public id: number;
  public isEditMode = false;
  public operators = [
    {id: 'EQUAL', value: 'Equals To', type: ['ALL']}, {
      id: 'LESS_THAN',
      value: 'Less Than', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']
    }, {
      id: 'LESS_THAN_EQUAL', value: 'Less Than Equals To', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']
    }, {id: 'GREATER_THAN', value: 'Greater Than', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {
      id: 'GREATER_THAN_EQUAL',
      value: 'Greater Than Equals To',
      type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']
    }, {id: 'NOT_EQUAL', value: 'Not Equals To', type: ['ALL']},
    {id: 'IN', value: 'In', type: ['ALL']},
    {id: 'NOT_IN', value: 'Not In', type: ['ALL']}, {id: 'LIKE', value: 'Like', type: ['VARCHAR']},
    {id: 'NOT_LIKE', value: 'Not Like', type: ['VARCHAR']},
    {id: 'BETWEEN', value: 'Between', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'NOT_BETWEEN', value: 'Not Between', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']},
    {id: 'IS_NULL', value: 'Is Null', type: ['ALL']},
    {id: 'IS_NOT_NULL', value: 'Is Not Null', type: ['ALL']}];
  public filterOperators: Map<number, any[]> = new Map<number, any[]>();
  public valueTypes = [
      {id: 'NONE', value: 'NONE', type: ['ALL']},
      {id: 'VARIANCE', value: 'VARIANCE', type: ['BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT']}
    ];
  public filterValueTypes: Map<string, any[]> = new Map<string, any[]>();
  public varianceTypes = ['PERCENTAGE', 'ADD', 'ADD_PERCENTAGE', 'SUBTRACT', 'SUBTRACT_PERCENTAGE'];
  public ruleTypes = ['KNOCK_OFF', 'SAME_SIDE_REVERSAL', 'MATCHING', 'UNMATCH_RULE'];
  public matchingTypes = ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY'];
  public dropDownSettings = ServiceConstant.getDropDownDefaultSetting();
  public groupedFieldCondition = 'ONE_TO_ONE';
  public conditionGroupFormula = ['SUM', 'AVERAGE'];
  public multiSelectDataElementPri: any[];
  public multiSelectDataElementSec: any[];
  public priSource = null;
  public secSource = null;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, public   changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
    });
    this.isLoading = false;
    this.form = new FormGroup({
      name: new FormControl(null),
      id: new FormControl(null),
      ruleType: new FormControl('MATCHING'),
      shortName: new FormControl(null),
      discription: new FormControl(null),
      reconId: new FormControl(null),
      matchingType: new FormControl('ONE_TO_ONE'),
      priGroupByFields: new FormControl(null),
      secGroupByFields: new FormControl(null),
      useReconcield: new FormControl(false),
      preventDuplicateMatch: new FormControl(false),
      bulkdata: new FormControl(false),
      unMatchTrxnTag: new FormControl(null),
      module: new FormGroup({
        id: new FormControl(null)
      }),
      primaryDataSource: new FormGroup({
        id: new FormControl(null)
      }),
      secondaryDataSource: new FormGroup({
        id: new FormControl(null)
      }),
      conditions: new FormArray([])
    });

    for (let i = 0; i < 2; i++) {
      this.addCondition();
    }

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

  public onChangeRuleType(ruleType: any) {
    this.form.get('primaryDataSource').get('id').reset();
    this.form.get('secondaryDataSource').get('id').reset();
    this.form.get('unMatchTrxnTag').reset();
    this.secDataSource = [];
    this.dataElementsPri = [];
    this.dataElementsSec = [];
  }

  public addCondition(index = null): void {
    const control = new FormGroup({
      id: new FormControl(null),
      elementOne: new FormGroup({
        id: new FormControl(null),
        valueType: new FormControl('NONE'),
        value: new FormControl(null),
        varianceType: new FormControl(null),
        dataElement: new FormControl(null),
        uiElement: new FormControl(null),
        dataSourceId: new FormControl(null),
        formula: new FormControl('SUM')
      }),
      elementSecond: new FormGroup({
        id: new FormControl(null),
        valueType: new FormControl('NONE'),
        value: new FormControl(null),
        varianceType: new FormControl(null),
        dataElement: new FormControl(null),
        uiElement: new FormControl(null),
        dataSourceId: new FormControl(null),
        formula: new FormControl('SUM')
      }),
      matchingOperator: new FormControl(null),
      sequence: new FormControl(null),
      conditionJointType: new FormControl('AND'),

    });
    if (index >= 1) {
      (<FormArray>this.form.get('conditions')).insert(index, control);
    } else {
      (<FormArray>this.form.get('conditions')).push(control);
    }
  }

  public removeCondition(i: number): void {
    (<FormArray>this.form.get('conditions')).removeAt(i);
    this.secondColumnVisibility.forEach((value, key) => {
      const index = key >= i ? key + 1 : key;
      if (key < this.secondColumnVisibility.size - 1) {
        this.secondColumnVisibility.set(key, this.secondColumnVisibility.get(index));
      }
    });
    this.secondColumnVisibility.delete(this.secondColumnVisibility.size - 1);

    this.filterOperators.forEach((value, key) => {
      const index = key >= i ? key + 1 : key;
      if (key < this.filterOperators.size - 1) {
        this.filterOperators.set(key, this.filterOperators.get(index));
      }
    });
    this.filterOperators.delete(this.filterOperators.size - 1);

    this.secondColumnMap.forEach((value, key) => {
      const index = key >= i ? key + 1 : key;
      if (key < this.secondColumnMap.size - 1) {
        this.secondColumnMap.set(key, this.secondColumnMap.get(index));
      }
    });
    this.secondColumnMap.delete(this.secondColumnMap.size - 1);
  }

  onModuleSelect(id: number) {
    this.recons = [];
    this.httpService.get('v1/recons?Find=ByModule&module=' + id, true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
  }

  onSubmit() {
    this.isLoading = true;
    const formArrayConditions = <FormArray>this.form.controls['conditions'];
    if (formArrayConditions.length > 0) {
      for (let i = 0; i < formArrayConditions.length; i++) {
        formArrayConditions.at(i).get('sequence').setValue(i + 1);
      }
    }
    const form = this.form.getRawValue();
    if (isNullOrUndefined(form.secondaryDataSource.id)) {
      form.secondaryDataSource = null;
    }
    if (this.id) {
      this.httpService.put('v1/rules', form, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Rule Successfully updated !');
          this.router.navigate(['/home/recon', 'rule', {
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
      this.httpService.post('v1/rules', form, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Rule Successfully Created !');
          this.router.navigate(['/home/recon', 'rule', {
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
    this.httpService.get('v1/rules/' + this.id, true).subscribe(
      (data: any) => {
        this.onModuleSelect(data.module.id);
        this.dataSources = [];
        this.httpService.get('v1/datasources?Find=ByRecon&reconId=' + data.reconId, true).subscribe(
          (dataSourceList: any) => {
            
            if(data.matchingType === 'ONE_TO_MANY'){
              this.dataElementsSec = data.secGroupByFields
            }
            this.dataSources = dataSourceList.data;
            this.onChangeRuleType(data.ruleType);
            this.form.patchValue({primaryDataSource: {id: data.primaryDataSource.id}});
            this.priSource = data.primaryDataSource;
            this.onPrimaryDataSourceSelect(data.ruleType, 'PRI', data.primaryDataSource.id);
            this.editRuleSecodSourceData(data.primaryDataSource.id, 'SEC', data.primaryDataSource.name, data);
          }
        );
      }
    );
  }

  public getAllDataElement(ruleType: string, dataSourceType: string): string[] {
    const sourcePri = this.form.get('primaryDataSource').get('id').value;
    this.onPrimaryDataSourceSelect(ruleType, dataSourceType, sourcePri);
    const sourceSec = this.form.get('secondaryDataSource').get('id').value;
    const conditions = (<FormArray>this.form.get('conditions'));
    for (let i = 0; i < conditions.length; i++) {
      conditions.at(i).reset({conditionJointType: 'AND', elementOne: {valueType: 'NONE'}, elementSecond: {valueType: 'NONE'}});
    }
    this.dataElementsPri = [];
    this.dataElementsSec = [];
    this.mergeDataElements = [];
    for (const source of this.dataSources) {
      if (+source.id === +sourcePri) {
        this.priSource = source;
      }
    }
    this.singleDataSourceElement(sourcePri, 'PRI', this.priSource.name);

    if (ruleType === 'KNOCK_OFF') {

    } else if (ruleType === 'SAME_SIDE_REVERSAL') {
      if (!isNullOrUndefined(sourcePri) && !isNullOrUndefined(sourceSec) && sourcePri && sourceSec) {
        for (const source of this.dataSources) {
          if (+source.id === +sourceSec) {
            this.secSource = source;
          }
        }
        this.singleDataSourceElement(sourceSec, 'SEC', this.secSource.name);
      }
    } else {
      if (!isNullOrUndefined(sourcePri) && !isNullOrUndefined(sourceSec) && sourcePri && sourceSec) {
        for (const source of this.dataSources) {
          if (+source.id === +sourceSec) {
            this.secSource = source;
          }
        }
        this.singleDataSourceElement(sourceSec, 'SEC', this.secSource.name);
      }
    }
    return this.dataElementsPri;
  }

  private onPrimaryDataSourceSelect(ruleType: string, dataSourceType: string, sourcePri) {
    if (dataSourceType === 'PRI' && sourcePri) {
      this.form.get('secondaryDataSource').get('id').reset();
      this.secDataSource = [];
      if (ruleType === 'SAME_SIDE_REVERSAL') {
        for (const source of this.dataSources) {
          if (+source.id === +sourcePri) {
            this.secDataSource.push(source);
          }
        }
      }
      if (ruleType === 'MATCHING' || ruleType === 'UNMATCH_RULE') {
        for (const source of this.dataSources) {
          if (+source.id !== +sourcePri) {
            this.secDataSource.push(source);
          }
        }
      }
    }
  }

  onReconSelect(reconId: string) {
    this.dataSources = [];
    this.httpService.get('v1/datasources?Find=ByRecon&reconId=' + reconId, true).subscribe(
      (data: any) => {
        this.dataSources = data.data;
      }
    );
  }

  private singleDataSourceElement(sourcePri, sourceType, sourceName): any {
    this.httpService.get('v1/invaliddatas/' + sourcePri + '?find=DataElements',
      true).subscribe(
      (data: any) => {
        for (const element of data.data) {
          this.mergeDataElements.push({id: (sourcePri + ',' + element.id + ',' + element.type), name: (sourceName + '> ' + element.name)});
        }
        switch (sourceType) {
          case 'PRI':
            this.multiSelectDataElementPri = [];
            for (const element of data.data) {
              this.dataElementsPri.push({id: (sourcePri + ',' + element.id + ',' + element.type), name: element.name});
              this.multiSelectDataElementPri.push({id: element.id, itemName: element.name});
            }
            break;
          case 'SEC':
            this.multiSelectDataElementSec = [];
            for (const element of data.data) {
              this.dataElementsSec.push({id: (sourcePri + ',' + element.id + ',' + element.type), name: element.name});
              this.multiSelectDataElementSec.push({id: element.id, itemName: element.name});
            }
            break;

        }
        return data;
      }
    );
  }


  onRuleMatchingTypeChange(matchingType: string) {
    switch (matchingType) {
      case 'ONE_TO_ONE':
        if (this.groupedFieldCondition === 'ONE_TO_MANY' || this.groupedFieldCondition === 'MANY_TO_ONE') {
          this.removeCondition(0);
        }
        if (this.groupedFieldCondition === 'MANY_TO_MANY') {
          this.removeCondition(0);
          this.removeCondition(0);
        }
        break;
      case 'ONE_TO_MANY':
      case 'MANY_TO_ONE':
        if (this.groupedFieldCondition === 'ONE_TO_ONE') {
          this.addCondition(0);
        }
        if (this.groupedFieldCondition === 'MANY_TO_MANY') {
          this.removeCondition(0);
        }
        break;
      case 'MANY_TO_MANY':
        if (this.groupedFieldCondition === 'ONE_TO_ONE') {
          this.addCondition(0);
          this.addCondition(1);
        }
        if (this.groupedFieldCondition === 'ONE_TO_MANY' || this.groupedFieldCondition === 'MANY_TO_ONE') {
          this.addCondition(0);
        }
        break;

    }
    this.groupedFieldCondition = matchingType;
  }

  getLableOfGroupedCondition(i): string {
    switch (this.groupedFieldCondition) {
      case 'ONE_TO_MANY':
      case 'MANY_TO_ONE':
        return i === 0 ? 'Grouped Condition' : 'Condition ' + (i);
      case 'MANY_TO_MANY':
        return i <= 1 ? ('Grouped Condition ' + (i + 1)) : 'Condition ' + (i - 1);
      default:
        return 'Condition ' + (i + 1);

    }
  }

  isHiddenRemoveButton(i): boolean {
    switch (this.groupedFieldCondition) {
      case 'ONE_TO_MANY':
      case 'MANY_TO_ONE':
        return i === 0 ? true : false;
      case 'MANY_TO_MANY':
        return i <= 1 ? true : false;
      default:
        return false;

    }

  }

  updateFormConditionType(conditionType: string, i) {
    if (conditionType) {
      (<FormArray>this.form.get('conditions')).at(i).patchValue({conditionJointType: conditionType});
    }
  }

  getFilterValueType(i, isPrimary = true) {
    const fg: FormGroup = (<FormArray>this.form.get('conditions')).at(i) as FormGroup;
    const element = isPrimary ? fg.get('elementOne').get('uiElement').value : fg.get('elementSecond').get('uiElement').value;
    const dataType = this.getDataType(element);
    const values: any[] = this.valueTypes.filter((valueType: any) => valueType.type.indexOf('ALL') !== -1 || valueType.type.indexOf(dataType) !== -1);
    return values;
  }

  getDataType(value: string) {
    const dataType = (value &&  value.split(',').length >= 3) ? value.split(',')[2] : 'NA';
    return dataType;
  }

  getSecondDataElements(mergeSourceId: string, i: number) {
    const secFielDataElement = [];
    if (!isNullOrUndefined(mergeSourceId)) {
      let dataElements = [];
      secFielDataElement.push({id: 0, name: 'CONSTANT'});
      const mergeSourceIdAndColName = mergeSourceId.split(',');
      const operaters = this.operators.filter((operator: any) => operator.type.indexOf('ALL') !== -1 || operator.type.indexOf(mergeSourceIdAndColName[2]) !== -1);
      this.filterOperators.set(i, operaters);
      this.filterValueTypes.set('PRI' + i, (mergeSourceIdAndColName[2] === 'VARCHAR' ? ['NONE'] : ['NONE', 'VARIANCE']));
      if (+mergeSourceIdAndColName[0] === +this.priSource.id) {
        if(this.form.get('matchingType').value === 'ONE_TO_MANY') {
          if(i > 0){            
            if(this.form.value.secGroupByFields != null ){
          for (const groupby of this.form.controls['secGroupByFields'].value ){
            for (const seccolumn of this.dataElementsSec ){
              if(groupby.itemName === seccolumn.name){
                dataElements.push(seccolumn);
              }
            }
           }
          }
          }else{
            dataElements = this.dataElementsSec;
          }
        }else{
          dataElements = this.dataElementsSec;
        }
      } else {
        if(this.form.get('matchingType').value === 'ONE_TO_MANY') {
        } else {
          dataElements = this.dataElementsPri;
        }
      }
      for (const element of dataElements) {
        secFielDataElement.push(element);
      }
      if (this.secondColumnMap.has(i)) {
        this.secondColumnMap.set(i, secFielDataElement);
      } else {
        this.secondColumnMap.set(i, secFielDataElement);
      }

      (<FormArray>this.form.get('conditions')).at(i).get('elementOne').patchValue({
        dataElement: +mergeSourceIdAndColName[1],
        dataSourceId: +mergeSourceIdAndColName[0],
        valueType: 'NONE', value: null, varianceType: null,
      });

    }
  }

  updateFormControlForSecCol(mergeSourceId: string, index: number) {
    if (+mergeSourceId === 0) {
      (<FormArray>this.form.get('conditions')).at(index).get('elementSecond').patchValue({
        dataElement: null,
        valueType: 'NONE',
        varianceType: null,
        dataSourceId: null
      });
    } else {
      const mergeSourceIdAndColName = mergeSourceId.split(',');
      this.filterValueTypes.set('SEC' + index, (mergeSourceIdAndColName[2] === 'VARCHAR' ? ['NONE'] : ['NONE', 'VARIANCE']));
      (<FormArray>this.form.get('conditions')).at(index).get('elementSecond').patchValue({
        dataElement: +mergeSourceIdAndColName[1],
        dataSourceId: +mergeSourceIdAndColName[0],
        valueType: 'NONE', value: null, varianceType: null,
      });
    }
  }

  isConditionIsHidden(matchingType: string, i: number): boolean {
    if (matchingType && i < 2) {

      switch (matchingType) {
        case 'ONE_TO_MANY':
        case 'MANY_TO_ONE':
          return i === 0 ? true : false;
        case 'MANY_TO_MANY':
          return i <= 1 ? true : false;
        default:
          return false;

      }


    }

  }


  updateSecondDataElementVisibility(operater: string, i: number) {
    const strings = ['IS_NULL', 'IS_NOT_NULL'];
    if (strings.indexOf(operater) === -1) {
      this.secondColumnVisibility.set(i, true);
    } else {
      (<FormArray>this.form.get('conditions')).at(i).get('elementSecond').patchValue({
        valueType: 'NONE',
        value: null,
        varianceType: null,
        dataElement: null,
        uiElement: null,
        dataSourceId: null
      });
      this.secondColumnVisibility.set(i, false);
    }

  }

  onPrimaryValueTypeChange(index: number) {
    (<FormGroup>(<FormArray>this.form.get('conditions')).at(index)).controls.elementOne.patchValue({varianceType: null, value: null});
  }

  onSecondaryValueTypeChange(index: number) {
    (<FormGroup>(<FormArray>this.form.get('conditions')).at(index)).controls.elementSecond.patchValue({varianceType: null, value: null});
  }

  private editRuleSecodSourceData(sourcePri, sourceType, sourceName, data): any {
    this.httpService.get('v1/invaliddatas/' + sourcePri + '?find=DataElements',
      true).subscribe(
      (elementsData: any) => {
        for (const element of elementsData.data) {
          this.mergeDataElements.push({id: (sourcePri + ',' + element.id + ',' + element.type), name: (sourceName + '> ' + element.name)});
        }

        this.multiSelectDataElementPri = [];
        for (const element of elementsData.data) {
          this.dataElementsPri.push({id: (sourcePri + ',' + element.id + ',' + element.type), name: element.name});
          this.multiSelectDataElementPri.push({id: element.id, itemName: element.name});
        }
        
        this.form.removeControl('conditions');
        this.form.addControl('conditions', new FormArray([]));
        if (isNullOrUndefined(data.secondaryDataSource)) {
          data.secondaryDataSource = {id: null};
          for (let i = 0; i < data.conditions.length; i++) {
            const obj = data.conditions[i];
            const uiElement = obj.elementOne.dataSourceId + ',' + obj.elementOne.dataElement + ',' + obj.elementOne.type;
            Object.assign(obj.elementOne, {uiElement: uiElement});
            this.addCondition();
            this.getSecondDataElements(uiElement, i);
            this.updateSecondDataElementVisibility(obj.matchingOperator, i);
            if (!isNullOrUndefined(obj.elementSecond.dataElement)) {
              const uiElementSec = obj.elementSecond.dataSourceId + ',' + obj.elementSecond.dataElement + ',' + obj.elementSecond.type;
              this.updateFormControlForSecCol(uiElementSec, i);
              Object.assign(obj.elementSecond, {uiElement: uiElementSec});
            } else {
              Object.assign(obj.elementSecond, {uiElement: 0});
              this.updateFormControlForSecCol('0', i);
            }
            this.secondColumnMap.set(i, [{id: 0, name: 'CONSTANT'}]);
          }
          this.form.patchValue(data);
          if (data.matchingType) {
            this.groupedFieldCondition = data.matchingType;
          }
          this.changeDef.detectChanges();
        } else {
          this.form.patchValue({secondaryDataSource: {id: data.secondaryDataSource.id}});
          this.secSource = data.secondaryDataSource;
          this.httpService.get('v1/invaliddatas/' + data.secondaryDataSource.id + '?find=DataElements',
            true).subscribe(
            (secElementData: any) => {
              console.log(data.secondaryDataSource.name + '=====Data element called');
              for (const secElement of secElementData.data) {
                this.mergeDataElements.push({
                  id: (data.secondaryDataSource.id + ',' + secElement.id + ',' + secElement.type),
                  name: (data.secondaryDataSource.name + '> ' + secElement.name)
                });
              }
              this.multiSelectDataElementSec = [];
              for (const element of secElementData.data) {
                this.dataElementsSec.push({id: (data.secondaryDataSource.id + ',' + element.id + ',' + element.type), name: element.name});
                this.multiSelectDataElementSec.push({id: element.id, itemName: element.name});
              }
              for (let i = 0; i < data.conditions.length; i++) {
                const obj = data.conditions[i];
                const uiElement = obj.elementOne.dataSourceId + ',' + obj.elementOne.dataElement + ',' + obj.elementOne.type;
                Object.assign(obj.elementOne, {uiElement: uiElement});
                this.addCondition();
                this.getSecondDataElements(uiElement, i);
                this.updateSecondDataElementVisibility(obj.matchingOperator, i);
                if (!isNullOrUndefined(obj.elementSecond.dataElement)) {
                  const uiElementSec = obj.elementSecond.dataSourceId + ',' + obj.elementSecond.dataElement + ',' + obj.elementSecond.type;
                  Object.assign(obj.elementSecond, {uiElement: uiElementSec});
                  this.updateFormControlForSecCol(uiElementSec, i);
                } else {
                  Object.assign(obj.elementSecond, {uiElement: 0});
                  this.updateFormControlForSecCol('0', i);
                }
              }
              this.form.patchValue(data);
              if (data.matchingType) {
                this.groupedFieldCondition = data.matchingType;
              }
              this.changeDef.detectChanges();
            });
        }
        return data;
      }
    );
  }
}
