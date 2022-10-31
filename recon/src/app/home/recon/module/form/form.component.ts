import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public parentModules = [];

  constructor(private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      name: new FormControl(null),
      parent: new FormGroup({
        id: new FormControl(null)
      })
    });

    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.parentModules = data.data;
      }
    );
  }

  onSubmit() {
    this.isLoading = true;

    this.httpService.post('v1/modules', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.form.reset();
        this.httpService.displaySuccessOnPopUp('Module Successfully Created !');
        this.router.navigate(['/home/recon', 'module', {
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
