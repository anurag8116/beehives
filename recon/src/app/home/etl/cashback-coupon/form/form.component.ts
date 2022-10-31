import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public brands = [];
  public id: number;
  public isEditMode = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public bsConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      if (this.id) {
        this.isEditMode = true;
        this.onEdit(this.id);
      }
    });
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      brand: new FormGroup({
        id: new FormControl(null)
      }),
      couponCode: new FormControl(null),
      discount: new FormControl(null),
      sliceShare: new FormControl(null),
      partnerShare: new FormControl(null),
      offerKey: new FormControl(null),
      subCategory: new FormControl(null),
      offerStartDate: new FormControl(null),
      offerEndDate: new FormControl(null)
    });
    this.httpService.get('v1/discountcriteria/brands', true).subscribe(
      (data: any) => {
        this.brands = data;
      }
    );
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.bsConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  onSubmit() {
    this.isLoading = true;
    if (!isNullOrUndefined(this.id)) {
      this.httpService.put('v1/discountcriteria', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Cashback Coupon Successfully Updated !');
          this.router.navigate(['/home/etl', 'cashback-coupon', {
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
      this.httpService.post('v1/discountcriteria', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Cashback Coupon Successfully Created !');
          this.router.navigate(['/home/etl', 'cashback-coupon', {
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
    this.httpService.get('v1/discountcriteria/' + this.id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          const formData = {...data, offerStartDate: this.datePipe.transform(data.offerStartDate, 'dd-MM-yyyy'),
            offerEndDate: this.datePipe.transform(data.offerEndDate, 'dd-MM-yyyy')};
          this.form.patchValue(formData);
        }
      });
  }

  onSliceShareChange() {
    const sliceShare = +this.form.controls.sliceShare.value;
    this.form.controls.partnerShare.setValue(100 - sliceShare);
  }

  onPartnerShareChange() {
    const partnerShare = +this.form.controls.partnerShare.value;
    this.form.controls.sliceShare.setValue(100 - partnerShare);
  }
}


