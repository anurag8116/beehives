import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {Router} from '@angular/router';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public allMeduHideOne: boolean;
  public allMeduHideTwo: boolean;
  public allMeduHideThree: boolean;
  public formOpen: boolean;
  public isLoading: boolean;
  public approvalCategorys: any = [];
  public approvalCategoryRegTypes = ['EDIT_INVALID_DATA', 'RECONCILED', 'UNRECONCILED', 'KNOCK_OFF', 'RELAX_MATCH', 'MASTER_DATA', 'REPORTS', 'PROPOSE_MATCH'];
  public approvalSubCategorys: any = [];
  public selectedAction: any = {};
  public selectedCategory: any = {};
  public approvalRight: any = {approvalLevelOneVo: { appUser: {}}, approvalLevelTwoVo: {appUser: {}}, approvalLevelThreeVo: {appUser: {}}};
  public form: FormGroup;
  public appUsers = [];
  public radioGroupAndAddMoreHide = false;
  public panelHeadingName = '';
  public dropDownSettings: any = {};

  constructor(private http: HttpService, private route: Router) {
    this.allMeduHideOne = true;
    this.allMeduHideTwo = true;
    this.allMeduHideThree = true;
    this.formOpen = false;
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      'approvalSubCategoryId': new FormControl(null),
      'approvalLevelOneVo': new FormGroup({
        'levelType': new FormControl('ALWAYS'),
        'level': new FormControl('LEVEL_1'),
        'approvalRightAssignee': new FormControl(null),
      }),
      'approvalLevelTwoVo': new FormGroup({
        'levelType': new FormControl('ALWAYS'),
        'level': new FormControl('LEVEL_2'),
        'approvalRightAssignee': new FormControl(null),
      }),
      'approvalLevelThreeVo': new FormGroup({
        'levelType': new FormControl('ALWAYS'),
        'level': new FormControl('LEVEL_3'),
        'approvalRightAssignee': new FormControl(null),
      }),
    });
    this.dropDownSettings = ServiceConstant.getDropDownDefaultSetting();
    this.getAllApprovalCategory();
    this.http.get('v1/appusers?MultiSelect&start=0', true).subscribe(
      (data: any) => {
        this.appUsers = data.data;
      }
    );
  }

  public getApprovelRight(id: any) {
    this.http.get('v1/approvalrights?Find=BySubCategory&subCategory=' + id, true).subscribe(
      (data: any) => {
        this.approvalRight = data;
        if (!isNullOrUndefined(data)) {
          this.formOpen = false;
        } else {
          this.formOpen = true;
        }
      }
    );
  }

  public onSubCategotyChange(category: any, subCategory) {
     this.panelHeadingName = subCategory.name;
  if (this.approvalCategoryRegTypes.includes(category.name)) {
      this.radioGroupAndAddMoreHide = true;
      this.form.reset({
        approvalSubCategoryId: subCategory.id,
        approvalLevelOneVo: {level: 'LEVEL_1', levelType: 'ALWAYS'},
        approvalLevelTwoVo: {level: 'LEVEL_2', levelType: 'ALWAYS'},
        approvalLevelThreeVo: {level: 'LEVEL_3', levelType: 'ALWAYS'}
      });
    } else {
      this.radioGroupAndAddMoreHide = false;
      this.form.reset({
        approvalSubCategoryId: subCategory.id,
        approvalLevelOneVo: {level: 'LEVEL_1', levelType: 'CONDITIONAL'},
        approvalLevelTwoVo: {level: 'LEVEL_2', levelType: 'CONDITIONAL'},
        approvalLevelThreeVo: {level: 'LEVEL_3', levelType: 'CONDITIONAL'}
      });
    }
    this.hideFieldsLevelOne();
    this.hideFieldsLeveltwo();
    this.hideFieldsLevelThree();
    this.getApprovelRight(subCategory.id);
    this.selectedAction = subCategory;
    this.selectedCategory = category;
  }

  onSubmit() {
    this.isLoading = true;
    this.http.post('v1/approvalrights', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.formOpen = false;
        if (this.approvalRight == null) {
          this.http.displaySuccessOnPopUp('Approval Right Successfully Created!');
        } else {
          this.http.displaySuccessOnPopUp('Approval Right Successfully Updated!');
        }
        this.getApprovelRight(data.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  editMode() {
    this.formOpen = true;
    this.form.patchValue({'id': this.approvalRight.id});
    if (!isNullOrUndefined(this.approvalRight.approvalLevelOneVo.approvalRightAssignee)) {
      this.form.get('approvalLevelOneVo').patchValue({'approvalRightAssignee': this.approvalRight.approvalLevelOneVo.approvalRightAssignee});
    }
    this.form.get('approvalLevelOneVo').patchValue( {'levelType': this.approvalRight.approvalLevelOneVo.levelType});
    if (!isNullOrUndefined(this.approvalRight.approvalLevelTwoVo.approvalRightAssignee)) {
      this.form.get('approvalLevelTwoVo').patchValue({'approvalRightAssignee': this.approvalRight.approvalLevelTwoVo.approvalRightAssignee});
    }
    this.form.get('approvalLevelTwoVo').patchValue( {'levelType': this.approvalRight.approvalLevelTwoVo.levelType});
    if (!isNullOrUndefined(this.approvalRight.approvalLevelThreeVo.approvalRightAssignee)) {
      this.form.get('approvalLevelThreeVo').patchValue({'approvalRightAssignee': this.approvalRight.approvalLevelThreeVo.approvalRightAssignee});
    }
    this.form.get('approvalLevelThreeVo').patchValue( {'levelType': this.approvalRight.approvalLevelThreeVo.levelType});
    this.hideFieldsLevelOne();
    this.hideFieldsLeveltwo();
    this.hideFieldsLevelThree();
  }

  private hideFieldsLevelOne() {
    const val = this.form.get('approvalLevelOneVo').get('levelType').value;
    if (val === 'ALWAYS') {
      this.allMeduHideOne = true;
    } else if ('NONE') {
      this.allMeduHideOne = false;
      this.form.get('approvalLevelOneVo').patchValue({'approvalRightAssignee': null});
    }
  }

  private hideFieldsLeveltwo() {
    const val = this.form.get('approvalLevelTwoVo').get('levelType').value;
    if (val === 'ALWAYS') {
      this.allMeduHideTwo = true;
    } else if (val === 'NONE') {
      this.allMeduHideTwo = false;
      this.form.get('approvalLevelTwoVo').patchValue({'approvalRightAssignee': null});
    }
  }

  private hideFieldsLevelThree() {
    const val = this.form.get('approvalLevelThreeVo').get('levelType').value;
    if (val === 'ALWAYS') {
      this.allMeduHideThree = true;
    } else if (val === 'NONE') {
      this.allMeduHideThree = false;
      this.form.get('approvalLevelThreeVo').patchValue({'approvalRightAssignee': null});
    }
  }

  private getAllApprovalCategory() {
    this.http.get('v1/approvalcategorys?start=0', true).subscribe(
      (data: any) => {
        this.approvalCategorys = data.data;
        this.approvalSubCategorys = this.approvalCategorys.approvalSubCategories;
      }
    );
  }

  cancel() {
    this.formOpen = false;
  }
}
