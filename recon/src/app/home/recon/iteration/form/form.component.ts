import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public modules = [];
  public recons = [];
  public reconIsCycleWise = false;

  constructor(public location: Location, private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      reconId: new FormControl(null),
      cycle: new FormControl(null),
    });
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
  }

  public onModuleSelect(muduleId: number) {
    this.httpService.get('v1/recons?Find=ByModuleAndHasRuleGroup&moduleId=' + muduleId, true).subscribe(
      (data: any) => {
        this.recons = data;
      }
    );
  }

  public onReconSelect(reconId: number) {
    this.reconIsCycleWise = false;
    this.httpService.get('v1/reconsettings?FindBy=recon&reconId=' + reconId, true).subscribe(
      (data: any) => {
        this.reconIsCycleWise = data.active;
      }
    );
  }

  cancel() {
    this.router.navigate(['/home/recon', 'iteration', {
      outlets: {
        'fullBodyOutlet': ['list'],
      }
    }]);
  }

  onSubmit() {
    this.httpService.post('v1/reconiterations', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.router.navigate(['/home/recon', 'iteration', {
          outlets: {
            'fullBodyOutlet': ['list'],
          }
        }]);
        this.httpService.displaySuccessOnPopUp('Recon Iteration Successfully Created!');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

}
