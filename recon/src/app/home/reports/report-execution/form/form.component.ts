import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public mudules: any = [];
  public reports: any = [];
  public isLoading: boolean;

  constructor(private http: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.getModuleList();
    this.isLoading = false;
    this.form = new FormGroup({
      'moduleId': new FormControl(null),
      'reportId': new FormControl(null),
    });
  }

  public onModuleChange(moduleId) {
    this.http.get('v1/reports?get=bymodule&moduleId=' + moduleId, true).subscribe(
      (data: any) => {
        this.reports = data;
      }
    );
  }

  onSubmit() {
    this.http.post('v1/reportexecutions', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.http.displaySuccessOnPopUp('Report Execution Successfully Created!');
        this.router.navigate(['/home/reports', 'report-execution', {
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

  private getModuleList() {
    this.http.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.mudules = data.data;
      }
    );
  }
}
