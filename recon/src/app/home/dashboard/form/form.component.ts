import { Component, OnInit } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import {Location} from '@angular/common';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MatSlideToggleChange} from '@angular/material';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public form: FormGroup;
  public id: Number;
  public groupId: Number;
  public isLoading: boolean;
  public groups: any;
  public dashlets: any;
  public selectedDashlets: any = [];
  public filters: any[] = [[]];
  public parentFilters: any[] = [[]];
  public childFilters: any[][] = [[]];
  public lookUpProviders: any;
  public tabNumbers = [{'key': 0, 'value': 0}, {'key': 1, 'value': 1}, {'key': 2, 'value': 2}, {'key': 3, 'value': 3}, {'key': 4, 'value': 4}, {'key': 5, 'value': 5}];
  draggable = {
    data: 'myDragData'
  };

  onDragged( item: any, list: any[] ) {

    const index = list.indexOf( item );
    list.splice( index, 1 );
  }

  onDrop( event: DndDropEvent, list: any[] ) {

    let index = event.index;

    if ( typeof index === 'undefined' ) {

      index = list.length;
    }
    const dashlet = {'id' : event.data.id, 'name': event.data.name, 'dashletType': event.data.dashletType};
    const alreadyAdded = list.filter(x => x.id === event.data.id);
    if ( alreadyAdded.toString() !== '') {
      $.confirm(this.getErrorModal('Dashlet already added in dashboard ...!'));
    } else {
      list.splice( index, 0, dashlet );
      this.addDashboardFilerOnDashletSelect();
      this.addDashboardDashlet(dashlet.id);
    }
  }

  constructor(public location: Location, private httpService: HttpService, private router: Router, private  route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = false;
    this.route.queryParams.subscribe((param: Params) => {
      this.groupId = +param['groupId'] || null;
      const url = encodeURI('v1/dashlets?start=0&length=1000&columns[0][data]=module&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + this.groupId + '&columns[0][search][regex]=false');
      this.httpService.get(url, true).subscribe(
        (data: any) => {
          this.dashlets = data.data;
        }
      );
    });
    this.form = new FormGroup({
      'id': new FormControl(null),
      'module': new FormGroup({
              'id': new FormControl(this.groupId)
        }),
      'name': new FormControl(),
      'drillDownMultiLevel': new FormControl(false),
      'refreshType': new FormControl(),
      'refreshTime': new FormControl(),
      'layoutType': new FormControl(),
      'dashboardParameters': new FormArray([
        new FormGroup({
          'label': new FormControl(null),
          'inputType': new FormControl(null),
          'dateType': new FormControl('ALL'),
          'lookUpProvider': new FormControl(null),
          'viewOrdring': new FormControl(null),
          'dashboardFilters': new FormArray([])
          }),
        ]),
      'drillDowns': new FormArray([
      ]),
      'dashboardTabConfigs': new FormArray([
      ]),
      'dashboardDashlets': new FormArray([
      ])
    });
    this.httpService.get('v1/lookupproviders/all', true).subscribe(
      (data: any) => {
        this.lookUpProviders = data;
      }
    );
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  public changeParentField(value: any, position: number) {
    const arrayLength = (<FormArray>this.form.get('drillDowns')).length;
    if (arrayLength > 1 && this.form.get('drillDownMultiLevel').value) {
      for (let oldPosition = position + 1 ; oldPosition < arrayLength; oldPosition ++) {
        let item = (<FormArray>this.form.get('drillDowns')).at(oldPosition);
        let child = (<FormArray>item.get('drillDownChilds')).at(position + 1);
        child.get('parentFieldName').patchValue(value);
      }
    }
  }

  public changeParent(value: any, position: number) {
    const arrayLength = (<FormArray>this.form.get('drillDowns')).length;
    if (arrayLength > 1 && this.form.get('drillDownMultiLevel').value) {
      for (let oldPosition = position + 1 ; oldPosition < arrayLength; oldPosition ++) {
        let item = (<FormArray>this.form.get('drillDowns')).at(oldPosition);
        let child = (<FormArray>item.get('drillDownChilds')).at(position + 1);
        child.get('child').patchValue({'id': value});
      }
    }
  }

  public toggle(event: MatSlideToggleChange) {
    const arrayLength = (<FormArray>this.form.get('drillDowns')).length;
    this.clearFormArray( (<FormArray>this.form.get('drillDowns')));
    for (let oldPosition = 0 ; oldPosition < arrayLength; oldPosition ++) {
      const drillDownChilds =  new FormArray([]);
      const currentPosition = event.checked ? oldPosition : 0;
      for (let position = 0; position <= currentPosition; position++) {
        this.childFilters.push([arrayLength])
        this.childFilters[arrayLength][position] = [];
        drillDownChilds.push(new FormGroup({
          'childFieldName': new FormControl(null),
          'parentFieldName': new FormControl(null),
          'child': new FormGroup({
            'id': new FormControl(null)
          })
        }));
      }
      const control = new FormGroup({
        'parentFieldName': new FormControl(null),
        'parent': new FormGroup({
          'id': new FormControl(null)
        }),
        'drillDownChilds': drillDownChilds
      });
      (<FormArray>this.form.get('drillDowns')).push(control);
    }
  }

  addDrillDown(): void {
    let arrayLength = (<FormArray>this.form.get('drillDowns')).length;
    const drillDownChilds =  new FormArray([]);
    this.form.get('drillDownMultiLevel').value ? arrayLength = arrayLength : arrayLength = 0;
    for (let position = 0 ; position <= arrayLength; position ++) {
      this.childFilters.push([arrayLength])
      this.childFilters[arrayLength][position] = [];
      drillDownChilds.push(new FormGroup({
        'parentFieldName': new FormControl(null),
        'childFieldName': new FormControl(null),
        'child': new FormGroup({
          'id': new FormControl(null)
        })
      }));
    }
    const control = new FormGroup({
        'parentFieldName': new FormControl(null),
        'parent': new FormGroup({
          'id': new FormControl(null)
        }),
      'drillDownChilds': drillDownChilds
      });
    (<FormArray>this.form.get('drillDowns')).push(control);
    if (arrayLength > 0  && this.form.get('drillDownMultiLevel').value) {
      for (let position = 0 ; position <= arrayLength; position ++) {
        let item = (<FormArray>this.form.get('drillDowns')).at(position);
        this.changeParentField(item.get('parentFieldName').value, position);
        this.changeParent(item.get('parent.id').value,position);
      }
    }
  }
  addTabConfiguration(): void {
    const control = new FormGroup({
      'tabNumber': new FormControl(null),
      'name': new FormControl(null),
      'closable': new FormControl(false),
      'dashlet': new FormGroup({
        'id': new FormControl(null)
      })
    });
    (<FormArray>this.form.get('dashboardTabConfigs')).push(control);
  }

  removeTabConfiguration(i: number): void {
    (<FormArray>this.form.get('dashboardTabConfigs')).removeAt(i);
  }

  removeDrillDown(i: number): void {
    (<FormArray>this.form.get('drillDowns')).removeAt(i);
  }

  public onParentDashletChange(id: any, i: number): void {
    if (id) {
        this.httpService.get('v1/dashlets/' + id, true).subscribe(
          (data: any) => {
            if (data.dashletType === 'CHART') {
              const filters = [{
                'label': data.seriesColumn,
                'fieldName': data.seriesColumn,
              }, {
                'label': data.labelColumn,
                'fieldName': data.labelColumn,
              }, {
                'label': data.countColumn,
                'fieldName': data.countColumn,
              }];
              this.parentFilters[i] = filters;
            } else {
              this.parentFilters[i] = data.filters;
            }
          }
        );
    }
  }

  public onChildDashletChange(id: any, i: number, childIndex: number): void {
    if (id) {
        this.httpService.get('v1/dashlets/' + id, true).subscribe(
          (data: any) => {
            this.childFilters[i][childIndex] = data.filters;
          }
        );
    }
  }

  addDashboardParameter(): void {
    const dashboardFilters = new FormArray([]);
    this.selectedDashlets.forEach(eachObj => {
      const dashboardFilter = new FormGroup({
        'fieldName': new FormControl(null),
        'dashlet': new FormGroup({
          'id': new FormControl(null)
        })
      });
      dashboardFilters.push(dashboardFilter);
    });
    const control = new FormGroup({
      'label': new FormControl(null),
      'inputType': new FormControl(null),
      'dateType': new FormControl('ALL'),
      'lookUpProvider': new FormControl(null),
      'viewOrdring': new FormControl(null),
      'dashboardFilters': dashboardFilters
    });
    (<FormArray>this.form.get('dashboardParameters')).push(control);
  }

  addDashboardFilter(i: number): void {
    const control = new FormGroup({
      'fieldName': new FormControl(null),
      'dashlet': new FormGroup({
        'id': new FormControl(null)
      })
    });
    (<FormArray>(<FormArray>this.form.get('dashboardParameters')).at(i).get('dashboardFilters')).push(control);
  }

  removeDashboardFilter(i: number, j: number): void {
    (<FormArray>(<FormArray>this.form.get('dashboardParameters')).at(i).get('dashboardFilters')).removeAt(j);
  }

  removeDashboardParameter(i: number): void {
    (<FormArray>this.form.get('dashboardParameters')).removeAt(i);
  }
  public onDashletChange(id: any, i: number): void {
    if (id) {
      if (!this.filters[i] || this.filters[i].length === 0 ) {
        this.httpService.get('v1/dashlets/' + id, true).subscribe(
          (data: any) => {
            this.filters[i] = data.filters;
          }
        );
      }
    }
  }

  addDashboardDashlet(id: any): void {
    const control = new FormGroup({
      'dashlet': new FormGroup({
        'id': new FormControl(id)
      })
    });
    (<FormArray>this.form.get('dashboardDashlets')).push(control);
  }

  public removeDashlet(index: any): void {
    this.selectedDashlets.splice(index, 1);
    this.filters[index] = [];
    const  dashboardParameters = (<FormArray>this.form.get('dashboardParameters'));
    for (let i = 0; i < dashboardParameters.length; i++) {
      if ((<FormArray>(<FormArray>this.form.get('dashboardParameters')).at(i).get('dashboardFilters')).length > this.selectedDashlets.length ) {
        this.removeDashboardFilter (i, (<FormArray>(<FormArray>this.form.get('dashboardParameters')).at(i).get('dashboardFilters')).length - 1 );
      }
    }
    (<FormArray>this.form.get('dashboardDashlets')).removeAt(index);
  }

  public addDashboardFilerOnDashletSelect(): void {
    const  dashboardParameters = (<FormArray>this.form.get('dashboardParameters'));
    for (let i = 0; i < dashboardParameters.length; i++) {
      if ((<FormArray>(<FormArray>this.form.get('dashboardParameters')).at(i).get('dashboardFilters')).length < this.selectedDashlets.length ) {
        this.addDashboardFilter(i);
      }
    }
  }

  public onGroupChange(id: string): void {
    const url = encodeURI('v1/dashlets?start=0&length=1000&columns[0][data]=module&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + id + '&columns[0][search][regex]=false');
    this.httpService.get(url, true).subscribe(
      (data: any) => {
        this.dashlets = data.data;
      }
    );
  }

  public searchByName(name: string): void {
    const url = encodeURI('v1/dashlets?start=0&length=1000&columns[0][data]=name&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + name + '&columns[0][search][regex]=false' +
      '&columns[1][data]=module&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=true&columns[1][search][value]=' + this.groupId + '&columns[1][search][regex]=false');
    this.httpService.get(url, true).subscribe(
      (data: any) => {
        this.dashlets = data.data;
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/home/dashboard', 'full', {
      outlets: {
        'fullBodyOutlet': ['config']
      }
    }]);
  }
  onSubmit(): void {
    const dashboardParameterArray = <FormArray>this.form.controls['dashboardParameters'];
    if (dashboardParameterArray.length > 0) {
      for (let i = 0; i < dashboardParameterArray.length; i++) {
        dashboardParameterArray.at(i).get('viewOrdring').setValue(i + 1);
      }
    }
    if (this.id) {
      this.isLoading = true;
      const formdata = this.form.value;
      this.httpService.put('v1/dashboards', formdata, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('dashboard Successfully Updated !');
          if (formdata.layoutType === 'TAB_LAYOUT' ) {
            this.router.navigate(['/home/dashboard', 'full' , {outlets: {'fullBodyOutlet': ['config-tab-layout', data.id]}}]);
          } else {
            this.router.navigate(['/home/dashboard', 'full' , {outlets: {'fullBodyOutlet': ['config', data.id]}}]);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = true;
      const formdata = this.form.value;
      this.httpService.post('v1/dashboards', formdata, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('dashboard Successfully Created !');
          if (formdata.layoutType === 'TAB_LAYOUT' ) {
            this.router.navigate(['/home/dashboard', 'full' , {outlets: {'fullBodyOutlet': ['config-tab-layout', data.id]}}]);
          } else {
            this.router.navigate(['/home/dashboard', 'full' , {outlets: {'fullBodyOutlet': ['config', data.id]}}]);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    }
  }

  private getErrorModal(message: string): any {
    return {
      title: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Error ...!',
      content: message,
      type: 'red',
      closeIcon: true,
      closeIconClass: 'fa fa-close',
      animation: 'none',
      offsetBottom: 400,
      height: 'auto',
      buttons: {
        close: {
          btnClass: 'btn-red', action: function () {
          }
        }
      }
    };
  }
}
