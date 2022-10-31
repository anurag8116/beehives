import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {LayoutComponent} from './layout/layout.component';

export const routes: Routes = [
  {
    path: '', component: FullLayoutComponent, children: [
      {path: 'rule', loadChildren: 'app/home/recon/rule/rule.module#RuleModule'},
      {path: 'module', loadChildren: 'app/home/recon/module/module.module#ModuleModule'},
      {path: 'data-source', loadChildren: 'app/home/recon/data-source/data-source.module#DataSourceModule'},
      {path: 'data-element', loadChildren: 'app/home/recon/data-element/data-element.module#DataElementModule'},
      {path: 'rule-group', loadChildren: 'app/home/recon/rule-group/rule-group.module#RuleGroupModule'},
      {path: 'recons', loadChildren: 'app/home/recon/recons/recons.module#ReconsModule'},
      {path: 'matched-transactions', loadChildren: 'app/home/recon/matched-transactions/matched-transactions.module#MatchedTransactionsModule'},
      {path: 'unmatched-transaction-view', loadChildren: 'app/home/recon/unmatched-transaction-view/unmatched-transaction-view.module#UnmatchedTransactionViewModule'},
      {path: 'unmatched-transaction', loadChildren: 'app/home/recon/unmatched-transaction/unmatched-transaction.module#UnmatchedTransactionModule'},
      {path: 'relax-match', loadChildren: 'app/home/recon/relax-match/relax-match.module#RelaxMatchModule'},
      {path: 'iteration', loadChildren: 'app/home/recon/iteration/iteration.module#IterationModule'},
      {path: 'gl-config', loadChildren: 'app/home/recon/gl-config/gl-config.module#GlConfigModule'},
      {path: 'settlement', loadChildren: 'app/home/recon/settlement/settlement.module#SettlementModule'},
      {path: 'brs', loadChildren: 'app/home/recon/brs/brs.module#BrsModule'},
      {path: 'raheja', loadChildren: 'app/home/recon/raheja/raheja.module#RahejaModule'},
      {path: 'tickets', loadChildren: 'app/home/recon/tickets/tickets.module#TicketsModule'}
  ]
  }, {
    path: 'part', component: LayoutComponent, children: [
      {path: 'unmatched-transaction', loadChildren: 'app/home/recon/unmatched-transaction/unmatched-transaction.module#UnmatchedTransactionModule'},
    ]
  }

];

export const reconRouting: ModuleWithProviders = RouterModule.forChild(routes);
