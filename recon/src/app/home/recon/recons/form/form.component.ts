import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
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
  public id: number;
  public isEditMode = false;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null),
      runTime: new FormControl(null),
      module: new FormGroup({
        id: new FormControl(null)
      }),
    });
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      if (this.id) {
        this.isEditMode = true;
        this.onEditRuleGroup(this.id);
      }
    });
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
  }

  onSubmit() {
    this.isLoading = true;
    if (isNullOrUndefined(this.id)) {
      this.httpService.post('v1/recons', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Recon Successfully Created !');
          this.router.navigate(['/home/recon','recons', {
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
      this.httpService.put('v1/recons', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Recon Successfully Updated !');
          this.router.navigate(['/home/recon','recons', {
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

  private onEditRuleGroup(id: number) {
    this.httpService.get('v1/recons/' + this.id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          this.form.patchValue(data);
        }
      });
  }
}
