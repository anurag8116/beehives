import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-approval-category',
  templateUrl: './approval-category.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ApprovalCategoryComponent implements OnInit {

  public approvalCategorys: any = [];
  public selectedCategory = null;
  public selectedSubCategory: any = {};

  constructor(private httpService: HttpService, private changeDetector: ChangeDetectorRef, private router: Router) {

  }

  ngOnInit() {
    this.getAllApprovalCategory();
  }

  public onSubCategotyChange(category: any, subCategory) {
    this.selectedSubCategory = subCategory;
    this.selectedCategory = category;
    if ('REPORTS' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['reports-pending-approval', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    } else if ('RELAX_MATCH' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['relax-match-approval', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    } else if ('PROPOSE_MATCH' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['propose-match-approval', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    } else if ('CREATE_RULE' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['create-rule', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    } else if ('UPDATE_RULE' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['update-rule', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    }
    else if ('RULE_GROUP' === category.name) {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['rule-group', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    }
    else {
      this.router.navigate(['/home/user', 'pending-approvals', {outlets: {'bodyOutlet': ['data-pending-approval', subCategory.id]}}],
        {queryParams: {id: subCategory.id, category: category.name}});
    }
    this.changeDetector.detectChanges();
  }

  private getAllApprovalCategory() {
    this.httpService.get('v1/approvalcategorys?type=PendingApproval&start=0', true).subscribe(
      (data: any) => {
        this.approvalCategorys = data.data;
      }
    );
  }
}
