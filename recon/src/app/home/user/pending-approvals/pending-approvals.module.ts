import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataApprovalComponent} from './data-approval/data-approval.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BlankComponent} from '../../../shared/blank/blank.component';
import {ApprovalCategoryComponent} from './approval-category/approval-category.component';
import {ReportsApprovalsComponent} from './reports-approvals/reports-approvals.component';
import {RelaxMatchComponent} from './relax-match/relax-match.component';
import {ProposeMatchComponent} from './propose-match/propose-match.component';
import {SubmitMultipleRowsComponent} from '../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {PopUpModule} from '../../pop-up/pop-up.module';
import { UpdateRuleComponent } from './update-rule/update-rule.component';
import { CreateRuleComponent } from './create-rule/create-rule.component';
import { RuleGroupComonent } from './rule-group/rule-group.component';

export const routes: Routes = [
  {path: 'bodyOutlet', component: BlankComponent, outlet: 'bodyOutlet'},
  {path: 'sideOutlet', component: BlankComponent, outlet: 'sideOutlet'},
  {path: 'fullBodyOutlet', component: BlankComponent, outlet: 'fullBodyOutlet'},
  {path: 'approval-category', component: ApprovalCategoryComponent, outlet: 'sideOutlet'},
  {path: 'data-pending-approval/:id', component: DataApprovalComponent, outlet: 'bodyOutlet'},
  {path: 'relax-match-approval/:id', component: RelaxMatchComponent, outlet: 'bodyOutlet'},
  {path: 'propose-match-approval/:id', component: ProposeMatchComponent, outlet: 'bodyOutlet'},
  {path: 'reports-pending-approval/:id', component: ReportsApprovalsComponent, outlet: 'bodyOutlet'},
  {path: 'update-rule/:id', component: UpdateRuleComponent, outlet: 'bodyOutlet'},
  {path: 'create-rule/:id', component: CreateRuleComponent, outlet: 'bodyOutlet'},
  {path: 'rule-group/:id', component: RuleGroupComonent, outlet: 'bodyOutlet'}

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    PopUpModule
  ],
  declarations: [DataApprovalComponent, ApprovalCategoryComponent, ReportsApprovalsComponent, RelaxMatchComponent, ProposeMatchComponent,UpdateRuleComponent,CreateRuleComponent,RuleGroupComonent],
  entryComponents: [SubmitMultipleRowsComponent]
})
export class PendingApprovalsModule {
}
