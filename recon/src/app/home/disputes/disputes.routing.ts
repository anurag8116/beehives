import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {LayoutComponent} from './layout/layout.component';
import {SettingComponent} from './setting/setting.component';

export const routes: Routes = [
  {
    path: '', component: FullLayoutComponent, children: [
      {
        path: 'onus',
        loadChildren: 'app/home/disputes/onus/onus.module#OnusModule'
      },
      {
        path: 'tat',
        loadChildren: 'app/home/disputes/tat/tat.module#TatModule'
      },
      {
        path: 'issuer-disputes',
        loadChildren: 'app/home/disputes/issuer-disputes/issuer-disputes.module#IssuerDisputesModule'
      },
      {
        path: 'acquirer-arbitration',
        loadChildren: 'app/home/disputes/acquirer-arbitration/acquirer-arbitration.module#AcquirerArbitrationModule'
      },

      {
        path: 'dispute-detail',
        loadChildren: 'app/home/disputes/shared-dispute/shared-dispute.module#SharedDisputeModule'
      }
    ]
  },
  {
    path: 'part', component: LayoutComponent, children: [
      {
        path: 'setting',
        component: SettingComponent, outlet: 'sideOutlet'
      }, {
        path: 'matching-criteria', loadChildren: 'app/home/disputes/matching-criteria/matching-criteria.module#MatchingCriteriaModule'
      }, {
        path: 'transaction-matching-criteria',
        loadChildren: 'app/home/disputes/transaction-matching-criteria/transaction-matching-criteria.module#TransactionMatchingCriteriaModule'
      }, {
        path: 'tat',
        loadChildren: 'app/home/disputes/tat/tat.module#TatModule'
      }, {
        path: 'duplicate-criteria',
        loadChildren: 'app/home/disputes/duplicate-criteria/duplicate-criteria.module#DuplicateCriteriaModule'
      },
      {
        path: 'assignment-rules',
        loadChildren: 'app/home/disputes/assignment-rules/assignment-rules.module#AssignmentRulesModule'
      }]
  }
];

export const disputesRouting: ModuleWithProviders = RouterModule.forChild(routes);
