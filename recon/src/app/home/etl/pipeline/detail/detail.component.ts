import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {Input, NodeEditor, Output} from 'rete';
import * as ConnectionPlugin from 'rete-connection-plugin';
import * as VueRenderPlugin from 'rete-vue-render-plugin';
import * as ContextMenuPlugin from 'rete-context-menu-plugin';
import {numSocket} from '../rete/socket';
import {NodeComponent} from '../rete/component/node-component';
import {isArray, isNullOrUndefined} from 'util';
import {StageComponent} from '../rete/component/stage-component';
import {
  DYNAMIC_FORM_CONTROL_INPUT_TYPE_PASSWORD,
  DynamicCheckboxModel,
  DynamicFormArrayGroupModel,
  DynamicFormArrayModel,
  DynamicFormGroupModel,
  DynamicFormLayout,
  DynamicFormService,
  DynamicInputModel,
  DynamicSelectModel
} from '@ng-dynamic-forms/core';
import {DYNAMIC_FORM_LAYOUT} from './dynamic-form.layout';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../../../shared/services/auth.service';
import { environment } from '../../../../../environments/environment.poc';


@Component({
  selector: 'app-form',
  templateUrl: './detail.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnInit, AfterViewInit {
  public pipelineGernalFormModel: any = [];
  configrationGroups: any = [];
  public showPipelineDetails:Boolean=environment.showPipelineDetails
  formLayout: DynamicFormLayout = DYNAMIC_FORM_LAYOUT;
  public addMoreFieldButtons: string[] = [];
  public stageAddMoreButtons: string[] = ['schemaRegistryUrls'];
  public listTypeControl: string[] = [];
  public mapTypeControl: string[] = [];
  public listBeanTypeControl: string[] = [];
  public predicatesTypeControl: string[] = [];
  public pipelineInfoModelIds: string[] = ['pipelineId', 'title', 'description'];
  public formGroup: FormGroup;
  public stageFormGroup: FormGroup;
  public dndAllowedTypes = ['SOURCE', 'PROCESSOR', 'EXECUTOR', 'TARGET'];
  public stageFormModel = [];
  public stageConfigration = [];
  public selectedStageConfig = null;
  public editStage = null;
  public selectedNode = null;
  public isLoading: boolean;
  public dataElementTypes = ['STRING', 'LONG', 'INTEGER'];
  public stages: any [] = [];
  public filteredStages: any[] = [];
  public stageTypes = [{name: 'Origins', value: 'SOURCE'}, {name: 'Processors', value: 'PROCESSOR'}, {
    name: 'Destinations',
    value: 'TARGET'
  }, {name: 'Executor', value: 'EXECUTOR'}];
  public selectedStages = [{
    'type': 'item',
    'id': '4'
  }];
  stageIconUrl = ServiceConstant.SS_URL + 'v1/definitions/stages/';
  public pipelineInfo: any = {stages: []};
  @ViewChild('nodeArea') el: ElementRef;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public modulesOption = [];
  private staticFields: Map<string, any> = new Map<string, any>();
  private pipelineDefinitions: any;
  private pipelineId = '';
  private editor: NodeEditor;
  private LIST_CONTROL_KEY = 'LIST_STRING_CONTROL';
  private temOutputKey = null;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private ssHttpService: StremSetHttpService,
              private router: Router, private authService: AuthService, private activeRoute: ActivatedRoute, private formService: DynamicFormService, private changeDectector: ChangeDetectorRef) {
    this.staticFields.set('badRecordsHandling', 'streamsets-datacollector-basic-lib::com_streamsets_pipeline_stage_destination_devnull_ToErrorNullDTarget::1');
  }

  async ngAfterViewInit() {
    const self = this;
    this.activeRoute.queryParams.subscribe(queryParams => {
      this.pipelineId = queryParams['pipelineId'] || null;
    });
    this.ssHttpService.get('v1/definitions', true).subscribe(
      (pipelineDefination: any) => {
        this.ssHttpService.get('v1/pipeline/' + this.pipelineId, true).subscribe(
          async (data: any) => {
            this.pipelineInfo = data;
            this.getPipelineDefaultCong(data, pipelineDefination);
            await this.createOrUpdatePipeLineUi();
          }
        );
      });
  }

  findNodeByName(nodes: any[], name: string) {
    if (nodes.length > 0) {
      for (const node of nodes) {
        if (node.name === name) {
          return node.outputs;
        }
      }
    }
  }

  async onDrop(event: any, list: any[]) {
    const iconUrl = '/assets/stages/' + event.item.library + '/' + event.item.name + '.png';
    const instanceName = event.item.label.replace(/\s/g, '') + '_' + (this.pipelineInfo.stages.length + 1);
    const outPutKey = instanceName + 'OutputLane' + (Math.floor(Math.random() * (9999999999999 - 1000000000000)) + 1000000000000);
    this.temOutputKey = outPutKey;
    const components = [new StageComponent(event.item.label, iconUrl, outPutKey, event.item.type)];
    components.map(c => {
      this.editor.register(c);
    });

    const n1 = await components[0].createNode();
    n1.position = [event.event.offsetX, event.event.offsetY];
    this.editor.addNode(n1);
    this.editor.view.resize();
    this.editor.trigger('process');
    const stage = this.getStagesIntialData(event.item, instanceName, outPutKey, event.event.offsetX, event.event.offsetY, true);
    n1.data = stage;
    console.log(stage);
  }

  ngOnInit() {
    this.formGroup = new FormGroup({});
    this.stageFormGroup = new FormGroup({});
    this.stageAddMoreButtons = [];
    this.formLayout = DYNAMIC_FORM_LAYOUT;
    this.isLoading = false;
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data.data) && data.data.length > 0) {
          this.modulesOption = [];
          for (const module of data.data) {
            this.modulesOption.push({label: module.name, value: module.name});
          }
        }
      }
    );
  }

  getOptionsData(lables: any[], values: any[]): any {
    const options = [];
    if (!isNullOrUndefined(lables) && !isNullOrUndefined(values) && lables.length > 0 && values.length > 0) {
      for (let i = 0; i < lables.length; i++) {
        options.push({label: lables[i], value: values[i]});
      }
    }
    return options;
  }

  searchStageName(name: any) {
    this.filteredStages = [];
    if (!isNullOrUndefined(name)) {
      this.filteredStages = this.stages.filter((stage: any) => {
        if (stage.label.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1) {
          return true;
        }
        return false;
      });
    } else {
      this.filteredStages = this.stages;
    }
  }

  searchByType(name: string) {
    this.filteredStages = [];
    if (name) {
      this.filteredStages = this.stages.filter((stage: any) => stage.type === name);
    } else {
      this.filteredStages = this.stages;
    }
  }

  public removeItem(item: any, list: any[]): void {
    list.splice(list.indexOf(item), 1);
  }

  log(selected) {
  }

  onStageClick(event: any) {
    console.log(event);
  }

  onFormChange($event: any) {
    console.log(this.formGroup.getRawValue());
    const form = this.formGroup.getRawValue()['configuration'];
    console.log(form);
    const configration = [];
    for (const model of Object.keys(form)) {
      if (this.listTypeControl.includes(model)) {
        const value = this.getListTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, this.pipelineDefinitions.pipeline[0].configDefinitions), value: value});
      } else if (this.mapTypeControl.includes(model)) {
        const value = this.getMapTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, this.pipelineDefinitions.pipeline[0].configDefinitions), value: value});
      } else if (this.pipelineInfoModelIds.includes(model)) {
        this.pipelineInfo[model] = form[model];
      } else {
        configration.push({name: this.getNameById(model, this.pipelineDefinitions.pipeline[0].configDefinitions), value: form[model]});
      }
    }
    console.log(configration);
    this.pipelineInfo.configuration = configration;
  }


  findModleById(modelId): any {
    return this.formService.findById(modelId, this.pipelineGernalFormModel);
  }

  onStageChange($event: any) {
    const form = this.stageFormGroup.getRawValue()['configuration'];
    const configration = [];
    for (const model of Object.keys(form)) {
      if (this.listTypeControl.includes(model)) {
        const value = this.getListTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, this.selectedStageConfig.configDefinitions), value: value});
      } else if (this.mapTypeControl.includes(model)) {
        const value = this.getMapTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, this.selectedStageConfig.configDefinitions), value: value});
      } else if (this.predicatesTypeControl.includes(model)) {
        const value = this.getPredicatesTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, this.selectedStageConfig.configDefinitions), value: value});
      } else {
        configration.push({name: this.getNameById(model, this.selectedStageConfig.configDefinitions), value: form[model]});
      }
    }
    this.editStage.configuration = configration;
    const pipeline = this.mergeStageInPipeline(this.pipelineInfo, this.editStage);
    this.pipelineInfo = pipeline;
    console.log(pipeline);
  }
  private async createOrUpdatePipeLineUi(refresh: boolean = false) {
    if (refresh) {
      this.el.nativeElement.innerHTML = '';
    }
    const container = this.el.nativeElement;
    const editor: NodeEditor = new NodeEditor('demo@0.3.0', container);
    this.editor = editor;
    editor.use(ConnectionPlugin, {curvature: 0.4});
    editor.use(VueRenderPlugin);
    //  editor.use(AlightRenderPlugin);
    editor.use(ContextMenuPlugin);
    if (this.pipelineInfo.stages.length > 0) {
      for (let i = 0; i < this.pipelineInfo.stages.length; i++) {
        const stage = this.pipelineInfo.stages[i];
        const iconUrl = '/assets/stages/' + stage.library + '/' + stage.stageName + '.png';
        const stageComponent = new NodeComponent(stage.instanceName, stage.uiInfo.label, iconUrl);
        editor.register(stageComponent);
        const node = await stageComponent.createNode();
        if (stage.inputLanes.length > 0) {
          node.addInput(new Input(stage.inputLanes[0], '', numSocket, true));
        }
        if (stage.outputLanes.length > 0) {
          if (stage.stageName === 'com_streamsets_pipeline_stage_processor_selector_SelectorDProcessor') {
            for (let k = 0; k < stage.outputLanes.length; k++) {
              node.addOutput(new Output(stage.outputLanes[k], '' + (k + 1), numSocket, true));
            }
          } else {
            node.addOutput(new Output(stage.outputLanes[0], '', numSocket, true));
          }
        } else if (stage.uiInfo.stageType !== 'TARGET' && stage.uiInfo.stageType !== 'EXECUTOR') {
          const outPutKey = stage.instanceName + 'OutputLane' + (Math.floor(Math.random() * (9999999999999 - 1000000000000)) + 1000000000000);
          node.addOutput(new Output(outPutKey, '', numSocket, true));
        }
        node.position = [stage.uiInfo.xPos, stage.uiInfo.yPos];
        node.data = stage;
        if (stage.inputLanes.length === 0 && stage.uiInfo.stageType !== 'SOURCE') {
          const input = new Input('input', '', numSocket, true);
          node.addInput(input);
        }
        if (stage.eventLanes.length > 0 && stage.uiInfo.stageType === 'SOURCE') {
          node.addOutput(new Output(stage.eventLanes[0], 'E', numSocket, true));
        }
        editor.addNode(node);
        if (stage.inputLanes.length > 0) {
          for (let j = 0; j < stage.inputLanes.length; j++) {
            let name;
            if ((stage.inputLanes[j]).match(/EventLane/)) {
              name = stage.inputLanes[j].split('_EventLane')[0];
            } else {
              name = stage.inputLanes[j].split('OutputLane')[0];
            }
            const output = this.findNodeByName(editor.nodes, name).get(stage.inputLanes[j]);
            const input = node.inputs.get(stage.inputLanes[0]);
            if (!isNullOrUndefined(output) && !isNullOrUndefined(input)) {
              editor.connect(output, input);
            }
          }
        }
      }
    }
    editor.on('process nodecreated translate zoom', async ($event) => {
      console.log($event);
    });
    editor.on('nodeselected', async ($event) => {
      this.onStageSelected($event);
    });
    editor.on('noderemoved', async ($event) => {
      this.onRemoveNode($event);
    });
    editor.on('connectioncreated', async ($event) => {
      this.onNodeConnectionChange($event, true);
    });
    editor.on('connectionremoved', async ($event) => {
      this.onNodeConnectionChange($event, false);
    });
    editor.on('nodetranslated', async ($event) => {
      this.onNodetranslated($event);
    });
    editor.view.area.zoom(0.5394464204243823);
    editor.view.area.translate(47.590168533325226, 40.76396120707173);
    editor.view.resize();
    editor.trigger('process');
  }

  private getListTypeControlValue(form, model) {
    const value = [];
    if (!isNullOrUndefined(form[model])) {
      for (const val of form[model]) {
        if (!isNullOrUndefined(val[this.LIST_CONTROL_KEY])) {
          value.push(val[this.LIST_CONTROL_KEY]);
        }
      }
    }
    return value;
  }

  private getMapTypeControlValue(form, model) {
    const value = [];
    if (!isNullOrUndefined(form[model])) {
      for (const val of form[model]) {
        if (!isNullOrUndefined(val['key'])) {
          value.push(val);
        }
      }
    }
    return value;
  }

  private getPredicatesTypeControlValue(form, model) {
    const value = [];
    if (!isNullOrUndefined(form[model])) {
      for (const val of form[model]) {
        if (!isNullOrUndefined(val['predicate'])) {
          value.push(val);
        }
      }
    }
    return value;
  }

  private createDynamicListFormModel(pipelineInfo, configrationInfo, relation, formModel) {
    const constantsValues = this.getValue(pipelineInfo, configrationInfo.name);
    const preDefineGroups = [];
    if (!isNullOrUndefined(constantsValues) && constantsValues.length > 0) {
      for (let i = 0; i < constantsValues.length; i++) {
        const constantsValue = constantsValues[i];
        const groupFormModel = [
          new DynamicInputModel({
            id: this.LIST_CONTROL_KEY,
            value: constantsValue
          })
        ];
        preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, groupFormModel, i));
      }
    } else {
      preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, [
        new DynamicInputModel({
          id: this.LIST_CONTROL_KEY
        })
      ], 0));
    }
    return new DynamicFormArrayModel({
      id: configrationInfo.fieldName,
      name: configrationInfo.name,
      label: configrationInfo.label,
      relation: relation,
      groupFactory: () => {
        return [
          new DynamicInputModel({
            id: this.LIST_CONTROL_KEY,
            relation: relation,
          })
        ];
      },
      initialCount: 0,
      groups: preDefineGroups
    });
  }

  private createDynamicPredicatesFormModel(pipelineInfo, configrationInfo, relation, formModel) {
    const constantsValues = this.getValue(pipelineInfo, configrationInfo.name);
    const preDefineGroups = [];
    if (!isNullOrUndefined(constantsValues) && constantsValues.length > 0) {
      // for (const constantsValue of constantsValues) {
      for (let i = 0; i < constantsValues.length; i++) {
        const constantsValue = constantsValues[i];
        const groupFormModel = [
          new DynamicInputModel({
            id: 'outputLane',
            value: constantsValue.outputLane,
            readOnly: true,
            disabled: true
          }),
          new DynamicInputModel({
            id: 'predicate',
            value: constantsValue.predicate,
            readOnly: constantsValue.predicate === 'default' ? true : false,
          }),
        ];
        preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, groupFormModel, i));
      }
    } else {
      preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, [
        new DynamicInputModel({
          id: 'outputLane',
          value: isNullOrUndefined(this.temOutputKey) ? this.temOutputKey : '',
          readOnly: true,
          disabled: true
        }),
        new DynamicInputModel({
          id: 'predicate',
          value: 'default',
          readOnly: true,
          disabled: true
        }),
      ]));
    }
    return new DynamicFormArrayModel({
      id: configrationInfo.fieldName,
      name: configrationInfo.name,
      label: configrationInfo.label,
      initialCount: 0,
      relation: relation,
      groups: preDefineGroups,
      groupFactory: () => {
        return [
          new DynamicInputModel({
            id: 'outputLane',
            readOnly: true,
            disabled: true
          }), new DynamicInputModel({
            id: 'predicate',
            value: '${}'
          })
        ];
      }
    });
  }

  private createDynamicListBeanFormModel(pipelineInfo, configrationInfo, relation, formModel) {
    const constantsValues = this.getValue(pipelineInfo, configrationInfo.name);
    const preDefineGroups = [];
    // this.sortByPosition(configrationInfo.model.configDefinitions);
    if (!isNullOrUndefined(constantsValues) && constantsValues.length > 0) {
      for (let i = 0; i < constantsValues.length; i++) {
        const constantsValue = constantsValues[i];

        preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, this.creatBeanOfForm(configrationInfo.model.configDefinitions, constantsValue), i));
      }
    } else {
      preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, this.creatBeanOfForm(configrationInfo.model.configDefinitions, null), 0));
    }
    return new DynamicFormArrayModel({
      id: configrationInfo.fieldName,
      name: configrationInfo.name,
      label: configrationInfo.label,
      relation: relation,
      groupFactory: () => {
        return this.creatBeanOfForm(configrationInfo.model.configDefinitions, null);
      },
      initialCount: 0,
      groups: preDefineGroups
    });
  }

  /*stages method */

  private creatBeanOfForm(configrations, modelInfo): any[] {
    const preDefineGroups = [];
    let value = null;
    if (!isNullOrUndefined(configrations) && configrations.length > 0) {
      for (const config of configrations) {
        if (!isNullOrUndefined(modelInfo)) {
          console.log(modelInfo[config['name']]);
          value = !isNullOrUndefined(modelInfo) ? modelInfo[config['name']] : config.defaultValue;
        } else {
          value = config.defaultValue;
        }
        const input = this.getModelFormControlByInputType(config, value);
        if (!isNullOrUndefined(input)) {
          preDefineGroups.push(input);
        }
      }
    }
    return preDefineGroups;
  }

  private getPipelineDefaultCong(pipelineInfo: any, pipelineDefination: any) {
    this.formGroup = new FormGroup({});
    this.formLayout = DYNAMIC_FORM_LAYOUT;
    this.activeRoute.queryParams.subscribe(queryParams => {
      this.pipelineId = queryParams['pipelineId'] || null;
    });
    this.isLoading = true;
    this.pipelineDefinitions = pipelineDefination;
    this.isLoading = false;
    this.stages = [];
    this.filteredStages = [];
    this.configrationGroups = [];
    this.pipelineGernalFormModel = [new DynamicFormGroupModel({
      id: 'configuration',
      group: this.configrationGroups,
    })];
    this.configrationGroups = this.defaultPipelineControls(pipelineInfo.info);
    this.addMoreFieldButtons = [];
    this.sortByPosition(this.pipelineDefinitions.pipeline[0].configDefinitions);
    for (let i = 0; i < this.pipelineDefinitions.pipeline[0].configDefinitions.length; i++) {
      const controlConfig = this.pipelineDefinitions.pipeline[0].configDefinitions[i];
      const input = this.getFormControlByInputType(controlConfig, pipelineInfo);
      if (!isNullOrUndefined(input)) {
        this.configrationGroups.push(input);
      }
      switch (controlConfig.group) {
        case '':
          break;
        case 'PARAMETERS':
          break;
        case 'CLUSTER':
          break;
        case 'BAD_RECORDS':
          break;
        case 'NOTIFICATIONS':
          break;
        case 'EMR':
          break;
        case 'STATS':
          break;
        default:
          console.log('new group' + controlConfig.group);
          break;
      }
    }
    this.pipelineGernalFormModel = [new DynamicFormGroupModel({
      id: 'configuration',
      group: this.configrationGroups,
    })];
    this.formGroup = this.formService.createFormGroup(this.pipelineGernalFormModel);
    this.changeDectector.detectChanges();
    for (let i = 0; i < this.pipelineDefinitions.stages.length; i++) {
      const stage = this.pipelineDefinitions.stages[i];
      if (stage.type === 'PROCESSOR' || stage.type === 'SOURCE' || stage.type === 'TARGET' || stage.type === 'EXECUTOR') {
        this.stages.push(stage);
        this.filteredStages.push(stage);
      }
    }
    this.formGroup.disable();
  }

  private getFormControlByInputType(info: any, pipelineInfo: any) {
    let input = null;
    const asignValue = this.getValue(pipelineInfo, info.name);
    const value = !isNullOrUndefined(asignValue) ? asignValue : info.defaultValue;
    const relation = this.getdependencyOfOtherControls(info);
    if (isArray(info.defaultValue)) {
      this.addMoreFieldButtons.push(info.fieldName);
    }
    switch (info.type) {
      case 'MODEL':
        if (info.model.modelType === 'VALUE_CHOOSER') {
          input = new DynamicSelectModel<string>({
            id: info.fieldName,
            name: info.name,
            label: info.label,
            relation: relation,
            options: (this.getOptionsData(info.model.labels, info.model.values)),
            value: value,
            placeholder: 'Select an option'
          });
        } else if (info.model.modelType === 'MULTI_VALUE_CHOOSER') {
          /* input = new DynamicSelectModel({
             id: info.fieldName,
             name: info.name,
             label: info.label,
             relation: relation,
             options: (this.getOptionsData(info.model.labels, info.model.values)),
             value: value,
             placeholder: 'Select an option'
           });*/
        }
        break;
      case 'VALUE_CHOOSER':
        input = new DynamicSelectModel<string>({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          options: (this.getOptionsData(info.model.labels, info.model.values)),
          value: value,
          placeholder: 'Select an option'
        });
        break;
      case 'STRING':
        input = new DynamicInputModel({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          value: value,
          inputType: info.type === 'STRING' ? 'text' : info.type,
          required: info.required
        });
        break;
      case 'NUMBER':
        input = new DynamicInputModel({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          value: value,
          inputType: info.type === 'STRING' ? 'text' : info.type,
          required: info.required
        });
        break;
      case 'BOOLEAN':
        input = new DynamicCheckboxModel({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          value: value,
        });
        break;
      case 'MAP':
        this.mapTypeControl.push(info.fieldName);
        input = this.createDynamicMapFormModel(pipelineInfo, info, relation, this.pipelineGernalFormModel);
        break;
      case 'LIST':
        this.listTypeControl.push(info.fieldName);
        input = this.createDynamicListFormModel(pipelineInfo, info, relation, this.pipelineGernalFormModel);
        /*new DynamicInputModel({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          value: value,
          multiple: true
        });*/
        break;
      case 'CREDENTIAL':
        input = new DynamicInputModel({
          id: info.fieldName,
          name: info.name,
          label: info.label,
          relation: relation,
          value: value,
          inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_PASSWORD
        });
        break;
      default:
        console.log('new type' + info.type);
        break;
    }
    return input;
  }

  private getValue(object, modelName): any {
    if (!isNullOrUndefined(object) && !isNullOrUndefined(object.configuration) && object.configuration.length > 0) {
      for (const model of object.configuration) {
        if (model['name'] === modelName) {
          return model.value;
        }
      }
    } else {
      return null;
    }
  }

  private getNameById(fieldName, configuration): string {
    if (!isNullOrUndefined(configuration) && configuration.length > 0) {
      for (const model of configuration) {
        if (model.fieldName === fieldName) {
          return model.name;
        }
      }
    }
  }

  private getdependencyOfOtherControls(pipeLineForm: any): any {
    const ralations = [
      {
        action: 'ENABLE',
        connective: 'AND',
        when: []
      }
    ];
    const controlsId = Object.keys(pipeLineForm.dependsOnMap);
    if (!isNullOrUndefined(controlsId) && controlsId.length > 0) {
      ralations[0].when = [];
      for (let i = 0; i < controlsId.length; i++) {
        for (const value of pipeLineForm.dependsOnMap[controlsId[i]]) {
          const name = controlsId[i].split('.');
          if (name.length > 1) {
            ralations[0].when.push({id: name[name.length - 1], value: value});
          } else {
            ralations[0].when.push({id: controlsId[i], value: value});
          }
        }
      }
      return ralations;
    } else {
      return [];
    }
  }

  private defaultPipelineControls(pipelineInfo): any {
    const defaultPipelineControls: any = [

      new DynamicInputModel({
        id: 'pipelineId',
        label: 'Pipeline ID',
        readOnly: true,
        value: pipelineInfo.pipelineId,
      }), new DynamicInputModel({
        id: 'title',
        label: 'Module',
        readOnly: true,
        value: pipelineInfo.title
      }), new DynamicInputModel({
        id: 'description',
        label: 'Title',
        value: pipelineInfo.description,
      })];
    return defaultPipelineControls;
  }

  private addConfigrationInArray(name, sourceModel: any): any {
    const formModel = [
      new DynamicInputModel({
        id: 'name',
        value: name, hidden: true
      }),
      sourceModel
    ];
    const formArryGroupModel = new DynamicFormArrayGroupModel(this.formService.findById('configuration', formModel) as DynamicFormArrayModel, formModel);
    return formArryGroupModel;
  }

  private createDynamicMapFormModel(pipelineInfo, configrationInfo, relation, formModel) {
    const constantsValues = this.getValue(pipelineInfo, configrationInfo.name);
    const preDefineGroups = [];
    if (!isNullOrUndefined(constantsValues) && constantsValues.length > 0) {
      for (let i = 0; i < constantsValues.length; i++) {
        const constantsValue = constantsValues[i];
        const groupFormModel = [
          new DynamicInputModel({
            id: 'key',
            value: constantsValue.key
          }),
          new DynamicInputModel({
            id: 'value',
            value: constantsValue.value
          }),
        ];
        preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, groupFormModel, i));
      }
    } else {
      preDefineGroups.push(new DynamicFormArrayGroupModel(this.formService.findById(configrationInfo.fieldName, formModel) as DynamicFormArrayModel, [
        new DynamicInputModel({
          id: 'key',
          placeholder: 'Enter name'
        }),
        new DynamicInputModel({
          id: 'value',
          placeholder: 'Enter Value'
        }),
      ], 0));
    }
    return new DynamicFormArrayModel({
      id: configrationInfo.fieldName,
      name: configrationInfo.name,
      label: configrationInfo.label,
      initialCount: 0,
      relation: relation,
      groups: preDefineGroups,
      groupFactory: () => {
        return [
          new DynamicInputModel({
            id: 'key',
            placeholder: 'Enter name'
          }), new DynamicInputModel({
            id: 'value',
            placeholder: 'Enter Value'
          })
        ];
      }
    });
  }

  private getStagesIntialConfigration(configrationModel: any, isNew: boolean, stageInfo = null) {
    this.stageFormGroup = new FormGroup({});
    this.stageAddMoreButtons = [];
    this.stageConfigration = [];
    this.stageFormModel = [new DynamicFormGroupModel({
      id: 'configuration',
      group: this.stageConfigration,
    })];
    this.sortByPosition(configrationModel);
    if (!isNullOrUndefined(configrationModel) && configrationModel.length > 0) {
      for (const config of configrationModel) {
        const input = this.getStageFormControlByInputType(config, stageInfo, 'FORM');
        if (!isNullOrUndefined(input)) {
          this.stageConfigration.push(input);
        }
      }
      this.stageFormModel = [new DynamicFormGroupModel({
        id: 'configuration',
        group: this.stageConfigration,
      })];
      this.stageFormGroup = this.formService.createFormGroup(this.stageFormModel);
      this.changeDectector.detectChanges();
      this.stageFormGroup.disable();
    }
  }

  private getStageFormControlByInputType(config: any, stageModel: any, type: string) {
    let input = null;
    let asignValue = null;

    if (!isNullOrUndefined(stageModel)) {
      if (type === 'MODEL') {
        asignValue = this.getValue(stageModel, config.name);
      } else {
        asignValue = this.getValue(stageModel, config.name);
      }
    }
    const value = !isNullOrUndefined(asignValue) ? asignValue : config.defaultValue;

    const relation = this.getdependencyOfOtherControls(config);
    if (isArray(config.defaultValue)) {
      this.stageAddMoreButtons.push(config.fieldName);
    }
    switch (config.type) {
      case 'MODEL':
        if (config.model.modelType === 'VALUE_CHOOSER') {
          input = new DynamicSelectModel<string>({
            id: config.fieldName,
            name: config.name,
            label: config.label,
            relation: relation,
            options: (this.getOptionsData(config.model.labels, config.model.values)),
            value: value,
            placeholder: 'Select an option'
          });
        } else if (config.model.modelType === 'FIELD_SELECTOR') {
          input = new DynamicInputModel({
            id: config.fieldName,
            name: config.name,
            label: config.label,
            relation: relation,
            value: value,
            placeholder: 'Select an option'
          });
        } else if (config.model.modelType === 'LIST_BEAN') {
          if (this.stageAddMoreButtons.indexOf(config.fieldName) === -1) {
            this.stageAddMoreButtons.push(config.fieldName);
          }
          this.addDynamicLayoutData(config.fieldName, 'LIST_BEAN');
          input = this.createDynamicListBeanFormModel(stageModel, config, relation, this.stageFormModel);
          this.listBeanTypeControl.push(config.fieldName);
        } else if (config.model.modelType === 'PREDICATE') {
          if (this.stageAddMoreButtons.indexOf(config.fieldName) === -1) {
            this.stageAddMoreButtons.push(config.fieldName);
          }
          this.addDynamicLayoutData(config.fieldName, 'PREDICATE');
          input = this.createDynamicPredicatesFormModel(stageModel, config, relation, this.stageFormModel);
          this.predicatesTypeControl.push(config.fieldName);
        }
        break;
      case 'VALUE_CHOOSER':
        input = new DynamicSelectModel<string>({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          options: (this.getOptionsData(config.model.labels, config.model.values)),
          value: value,
          placeholder: 'Select an option'
        });
        break;
      case 'STRING':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          value: value,
          inputType: config.type === 'STRING' ? 'text' : config.type,
          required: config.required
        });
        break;
      case 'NUMBER':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          value: value,
          inputType: config.type === 'STRING' ? 'text' : config.type,
          required: config.required
        });
        break;
      case 'BOOLEAN':
        input = new DynamicCheckboxModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          value: value,
        });
        break;
      case 'MAP':
        if (this.stageAddMoreButtons.indexOf(config.fieldName) === -1) {
          this.stageAddMoreButtons.push(config.fieldName);
        }
        this.mapTypeControl.push(config.fieldName);
        input = this.createDynamicMapFormModel(stageModel, config, relation, this.stageFormModel);
        break;
      case 'LIST':
        if (this.stageAddMoreButtons.indexOf(config.fieldName) === -1) {
          this.stageAddMoreButtons.push(config.fieldName);
        }
        this.addDynamicLayoutData(config.fieldName, 'LIST');
        input = this.createDynamicListFormModel(stageModel, config, relation, this.stageFormModel);
        this.listTypeControl.push(config.fieldName);
        break;
      case 'CREDENTIAL':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          value: value,
          inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_PASSWORD,
          autoComplete: 'new-password',
          autoFocus: false
        });
        break;
      case 'CHARACTER':
        const optionsForChar = [{label: 'Tab', value: '\t'}, {label: 'SemiColon', value: ';'}, {
          label: 'BackSlash',
          value: '\\'
        }, {label: 'Quote', value: '"'}, {label: 'Comma', value: ','}, {
          label: 'Pipe',
          value: '|'
        }, {
          label: 'Space',
          value: ' '
        }];
        input = new DynamicSelectModel<string>({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          options: optionsForChar,
          value: value,
          placeholder: 'Select an option',
        });
        break;
      case 'TEXT':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          relation: relation,
          value: value,
          inputType: 'text',
          autoComplete: 'false',
          autoFocus: false
        });
        break;
      default:
        console.log('new type' + config.type);
        break;
    }
    return input;
  }

  private getStagesIntialData(stage: any, instanceName, outputKey, xPos, yPos, isNew: boolean): any {
    this.selectedStageConfig = stage;
    this.getStagesIntialConfigration(stage.configDefinitions, isNew);
    const form = this.stageFormGroup.getRawValue()['configuration'];
    const configration = [];
    for (const model of Object.keys(form)) {
      if (this.listTypeControl.includes(model)) {
        const value = this.getListTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, stage.configDefinitions), value: value});
      } else if (this.mapTypeControl.includes(model)) {
        const value = this.getMapTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, stage.configDefinitions), value: value});
      } else {
        configration.push({name: this.getNameById(model, stage.configDefinitions), value: form[model]});
      }
    }
    if (stage.name === 'com_streamsets_pipeline_stage_processor_selector_SelectorDProcessor' && isNew) {
      for (let i = 0; i < configration.length; i++) {
        const model = configration[i];
        if (model.name === 'lanePredicates') {
          model.value = [{outputLane: outputKey, predicate: 'default'}];
        }
      }
    }
    const initialStageConfig = {
      configuration: configration,
      eventLanes: [],
      inputLanes: [],
      instanceName: instanceName,
      library: stage.library,
      outputLanes: stage.type !== 'TARGET' && stage.type !== 'EXECUTOR' ? [outputKey] : [],
      services: [],
      stageName: stage.name,
      stageVersion: stage.version,
      uiInfo: {
        description: stage.description,
        label: instanceName,
        stageType: stage.type,
        xPos: xPos,
        yPos: yPos
      }
    };
    this.pipelineInfo.stages.push(initialStageConfig);
    console.log(initialStageConfig);
    return initialStageConfig;
  }

  private findIntanceName(instanceName: any): string {
    let instanceName1 = instanceName.replace(/\s/g, '') + '_' + (this.pipelineInfo.stages.length + 1);
    let condition = true;
    let i = this.pipelineInfo.stages.length + 1;
    if (!isNullOrUndefined(this.pipelineInfo.stages) && this.pipelineInfo.stages.length > 0) {
      while (condition) {
        for (const stage of this.pipelineInfo.stages) {
          if (stage.instanceName !== instanceName1) {
            condition = false;
            break;
          } else {
            i++;
            instanceName1 = instanceName.replace(/\s/g, '') + '_' + (this.pipelineInfo.stages.length + i);
          }
        }
      }
    }
    return instanceName1;
  }

  private onStageSelected(event: any) {
    const stageInfo = event.data;
    this.editStage = stageInfo;
    const stageConfig = this.findStageConfigByStageName(stageInfo.stageName);
    this.selectedStageConfig = stageConfig;
    // this.sortByPosition(stageConfig.configDefinitions);
    this.getStagesIntialConfigration(stageConfig.configDefinitions, false, stageInfo);
    const form = this.stageFormGroup.getRawValue()['configuration'];
    const configration = [];
    for (const model of Object.keys(form)) {
      if (this.listTypeControl.includes(model)) {
        const value = this.getListTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, stageConfig.configDefinitions), value: value});
      } else if (this.mapTypeControl.includes(model)) {
        const value = this.getMapTypeControlValue(form, model);
        configration.push({name: this.getNameById(model, stageConfig.configDefinitions), value: value});
      } else {
        configration.push({name: this.getNameById(model, stageConfig.configDefinitions), value: form[model]});
      }
    }
    console.log(configration);
  }

  private findStageConfigByStageName(stageName): any {
    let stager = null;
    if (!isNullOrUndefined(this.stages) && this.stages.length > 0) {
      for (const stage of this.stages) {
        if (stage.name === stageName) {
          stager = stage;
          break;
        }
      }
    }
    return stager;
  }

  private sortByPosition(array: any[]): any[] {
    array.sort((a: any, b: any) => {
      if (a.displayPosition < b.displayPosition) {
        return -1;
      } else if (a.displayPosition > b.displayPosition) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

  private mergeStageInPipeline(pipelineInfo: any, editStage: any, condition = 'CONFIGARTION'): any {
    if (!isNullOrUndefined(pipelineInfo.stages) && pipelineInfo.stages.length > 0) {
      for (let i = 0; i < pipelineInfo.stages.length; i++) {
        const stage = pipelineInfo.stages[i];
        if (stage.instanceName === editStage.instanceName) {
          switch (condition) {
            case 'CONFIGARTION':
              stage.configuration = editStage.configuration;
              break;
            case 'ADD_CONNECTION':
              stage.inputLanes = editStage.inputLanes;
              break;
            case 'REMOVE_CONNECTION':
              stage.inputLanes = editStage.inputLanes;
              break;
            case 'UPDATE_OUTPUT_LANES':
              stage.outputLanes = editStage.outputLanes;
              break;
            case 'TRANSLATE_STAGE':
              stage.uiInfo.xPos = editStage.uiInfo.xPos;
              stage.uiInfo.yPos = editStage.uiInfo.yPos;
              break;
            case 'REMOVE':
              pipelineInfo.stages.splice(i, 1);
              break;
            default:
              console.log('fuction mergeStageInPipeline is defualt running');
          }
          break;
        }
      }
    }
    return pipelineInfo;
  }


  private onProduceEventChange(event: any): any {
    const pipelineInfo1 = this.pipelineInfo;
    const editStage = this.editStage;
    const eventIs = event.target.checked;
    const eventOutputName = this.editStage.instanceName + '_EventLane';

    if (!isNullOrUndefined(pipelineInfo1.stages) && pipelineInfo1.stages.length > 0) {
      for (let i = 0; i < pipelineInfo1.stages.length; i++) {
        const stage = pipelineInfo1.stages[i];
        if (stage.instanceName === editStage.instanceName && eventIs) {
          stage.eventLanes = [eventOutputName];
          break;
        }

        if (!eventIs) {
          if (stage.instanceName === editStage.instanceName) {
            stage.eventLanes = [];
          }
          if (stage.inputLanes.indexOf(eventOutputName) !== -1) {
            stage.inputLanes.splice(stage.inputLanes.indexOf(eventOutputName), 1);
          }
        }
      }
    }
    this.createOrUpdatePipeLineUi(true);
    return pipelineInfo1;
  }

  private onNodeConnectionChange(event: any, connectionIs: boolean) {
    console.log('connection');
    console.log(event);
    const inputKey = event.output.key;
    if (connectionIs) {
      if (!isNullOrUndefined(this.editStage) && !isNullOrUndefined(event.input.node.data)) {
        const editConnectionStage = event.input.node.data;
        editConnectionStage.inputLanes.push(inputKey);
        this.pipelineInfo = this.mergeStageInPipeline(this.pipelineInfo, editConnectionStage, 'ADD_CONNECTION');
      }
    } else {
      const removeConnectionStage = event.input.node.data;
      const index = removeConnectionStage.inputLanes.findIndex(outputKey => outputKey === event.output.key);
      removeConnectionStage.inputLanes.splice(index, 1);
      this.pipelineInfo = this.mergeStageInPipeline(this.pipelineInfo, removeConnectionStage, 'REMOVE_CONNECTION');
    }
  }

  private onRemoveNode(event: any) {
    console.log('remove node');
    console.log(event);
    const editConnectionStage = event.data;
    this.pipelineInfo = this.mergeStageInPipeline(this.pipelineInfo, editConnectionStage, 'REMOVE');
  }

  private onNodetranslated(event: any) {
    console.log(event);
    const translateStage = event.node.data;
    translateStage.uiInfo.xPos = event.node.position[0];
    translateStage.uiInfo.yPos = event.node.position[1];
    this.pipelineInfo = this.mergeStageInPipeline(this.pipelineInfo, translateStage, 'TRANSLATE_STAGE');
  }

  private getModelFormControlByInputType(config: any, value) {
    let input = null;
    const relation = this.getdependencyOfOtherControls(config);
    if (isArray(value)) {
      this.stageAddMoreButtons.push(value);
    }
    switch (config.type) {
      case 'MODEL':
        if (config.model.modelType === 'VALUE_CHOOSER') {
          input = new DynamicSelectModel<string>({
            id: config.fieldName,
            name: config.name,
            label: config.label,
            // relation: relation,
            options: (this.getOptionsData(config.model.labels, config.model.values)),
            value: value,
            placeholder: 'Select an option'
          });
        } else if (config.model.modelType === 'FIELD_SELECTOR') {
          input = new DynamicInputModel({
            id: config.fieldName,
            name: config.name,
            label: config.label,
            // relation: relation,
            value: value,
            placeholder: 'Select an option'
          });
        }
        break;
      case 'VALUE_CHOOSER':
        input = new DynamicSelectModel<string>({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          // relation: relation,
          options: (this.getOptionsData(config.model.labels, config.model.values)),
          value: value,
          placeholder: 'Select an option'
        });
        break;
      case 'STRING':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          // relation: relation,
          value: value,
          inputType: config.type === 'STRING' ? 'text' : config.type,
          required: config.required
        });
        break;
      case 'NUMBER':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          // relation: relation,
          value: value,
          inputType: config.type === 'STRING' ? 'text' : config.type,
          required: config.required
        });
        break;
      case 'BOOLEAN':
        input = new DynamicCheckboxModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          //  relation: relation,
          value: value,
        });
        break;
      case 'CREDENTIAL':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          //  relation: relation,
          value: value,
          inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_PASSWORD
        });
        break;
      case 'CHARACTER':
        const optionsForChar = [{label: 'Tab', value: '\t'}, {label: 'SemiColon', value: ';'}, {
          label: 'BackSlash',
          value: '\\'
        }, {label: 'Quote', value: '"'}, {label: 'Comma', value: ','}, {
          label: 'Pipe',
          value: '|'
        }, {
          label: 'Space',
          value: ' '
        }];
        input = new DynamicSelectModel<string>({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          // relation: relation,
          options: optionsForChar,
          value: value,
          placeholder: 'Select an option'
        });
        break;
      case 'TEXT':
        input = new DynamicInputModel({
          id: config.fieldName,
          name: config.name,
          label: config.label,
          // relation: relation,
          value: value,
          inputType: 'text',
          required: config.required
        });
        break;
      default:
        console.log('new type' + config.type);
        break;
    }
    return input;
  }

  private addDynamicLayoutData(fieldName, type): any {
    let layout = {};
    switch (type) {
      case 'LIST':
        layout = {
          [fieldName]: {
            element: {
              container: 'col-sm-12',
              label: 'control-label'
            },
            grid: {
              container: 'col-sm-12',
            }
          }
        };
        break;
      case 'PREDICATE':
        layout = {
          'outputLane': {
            grid: {
              container: 'dispalyNone'
            },
          },
          'predicate': {
            grid: {
              container: 'col-sm-8'
            },
          },
        };
        break;
      case 'MAP':
        break;
      default:
        break;
    }
    Object.assign(this.formLayout, layout);
  }
}


