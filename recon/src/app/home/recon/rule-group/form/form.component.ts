import {Component, OnInit} from '@angular/core';
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
  public modules = [];
  public rules = [];
  public recons = [];
  public numbers: number[] = [];
  public id: number;
  public isEditMode = false;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      if (this.id) {
        this.isEditMode = true;
        this.onEditRuleGroup(this.id);
      }
    });
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null),
      shortName: new FormControl(null),
      relaxMatch: new FormControl('true'),
      reconId: new FormControl(null),
      module: new FormGroup({
        id: new FormControl(null)
      }),
      discription: new FormControl(null),
      rules: new FormArray([])
    });
    this.addDataElement();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    Array(150).fill(0).map((x, i) => {
      this.numbers.push(i + 1);
    });
  }

  public editDataElement(rule: any ): void {
    const control = new FormGroup({
      rule: new FormGroup({
        id: new FormControl(rule.scheduleSqlQueryId)
      }),
      executionOrder: new FormControl(rule.executionOrder),
      ruleType: new FormControl({value: 'STATIC_QUERY', disabled: true}),
      runMultipleTimes: new FormControl( rule.runMultipleTimes),
      selectedRuleType: new FormControl( rule.selectedRuleType),
      scheduleSqlQueryId: new FormControl( rule.scheduleSqlQueryId),
      scheduleSqlQueryName: new FormControl( rule.scheduleSqlQueryName),
    });
    (<FormArray>this.form.get('rules')).push(control);
  }

  public addDataElement(): void {
    const control = new FormGroup({
      rule: new FormGroup({
        id: new FormControl(null)
      }),
      executionOrder: new FormControl(null),
      ruleType: new FormControl({value: null, disabled: true}),
      runMultipleTimes: new FormControl( null),
      selectedRuleType: new FormControl( null),
      scheduleSqlQueryId: new FormControl( null),
      scheduleSqlQueryName: new FormControl( null),
      status: new FormControl({value: null, disabled: true})
    });
    (<FormArray>this.form.get('rules')).push(control);
  }

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('rules')).removeAt(i);

  }

  onModuleSelect(id: number) {
    if (id > 0) {
      this.recons = [];
      this.rules = [];
      this.httpService.get('v1/recons?Find=ByModule&module=' + id, true).subscribe(
        (data: any) => {
          this.recons = data.data;
        }
      );
    }
  }

  onSubmit() {
    this.isLoading = true;
    if (!isNullOrUndefined(this.id)) {
      const rawForm = this.form.getRawValue();
      this.httpService.put('v1/rulegroups', rawForm, true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Rule Group Successfully Updated !');
          this.router.navigate(['/home/recon', 'rule-group', {
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
      this.httpService.post('v1/rulegroups', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Rule Group Successfully Created !');
          this.router.navigate(['/home/recon', 'rule-group', {
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

  onReconSelect(reconId: string) {
    this.rules = [];
    this.httpService.get('v1/rules?Find=ByRecon&reconId=' + reconId, true).subscribe(
      (data: any) => {
        this.rules = data;
      }
    );
  }

  onRuleSelect(ruleId, index) {
    for (const rule of this.rules) {
      if (rule.id === +ruleId) {
        const rules1 = (<FormArray>this.form.get('rules'));
        if (rule.shortName === 'STATIC_QUERY') {
          rules1.at(index).patchValue({ruleType: rule.shortName, executionOrder: index + 1, selectedRuleType: 'STORED_PROC_EXE', scheduleSqlQueryId: rule.id, scheduleSqlQueryName: rule.name  });
          break;
        } else {
          rules1.at(index).patchValue({ruleType: rule.shortName, executionOrder: index + 1, selectedRuleType: 'RULE_QUERY_EXE'});
          break;
        }
      }
    }
  }

  private onEditRuleGroup(id: number) {
    this.httpService.get('v1/rulegroups/' + this.id + "?rulestatuses=ENABLED,DISABLED", true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          this.form.removeControl('rules');
          this.form.addControl('rules', new FormArray([]));
          this.onModuleSelect(data.module.id);
          this.onReconSelect(data.reconId);
          for (const rule of data.rules) {
            if (rule.selectedRuleType === 'STORED_PROC_EXE') {
              rule.ruleType = 'STATIC_QUERY';
              this.editDataElement(rule);
            } else {
              rule.ruleType = rule.rule.ruleType;
              this.addDataElement();
            }
          }
          this.form.patchValue(data);
          this.form.patchValue({relaxMatch: data.relaxMatch.toString()});
        }
      });
  }
}


