import {Component, OnInit} from '@angular/core';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public modules: any[] = [];
  public roles: any[] = [];
  public isLoading: boolean;
  public form: FormGroup;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.httpService.get('v1/modules?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      });

    this.httpService.get('v1/roles?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      });

    this.form = new FormGroup({
      'moduleId': new FormControl(null),
      'roleId': new FormControl(null)
    });
  }

  onSubmit() {
    this.httpService.post('v1/assignmentrules', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.form.reset();
        this.httpService.displaySuccessOnPopUp('AssignmentRule Successfully Created !');
        this.router.navigate(['/home/disputes/part', 'assignment-rules', {
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
