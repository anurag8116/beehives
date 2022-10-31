import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {FullLayoutComponent} from './full-layout/full-layout.component';


export const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: 'pending-approvals', loadChildren: 'app/home/user/pending-approvals/pending-approvals.module#PendingApprovalsModule'}
    ]
  }, {
    path: 'full', component: FullLayoutComponent, children: [
      {path: 'password-policy', loadChildren: 'app/home/user/password-policy/password-policy.module#PasswordPolicyModule'},
      {path: 'approvel-rights', loadChildren: 'app/home/user/approvel-rights/approvel-rights.module#ApprovelRightsModule'},
      {path: 'pending-approvals', loadChildren: 'app/home/user/pending-approvals/pending-approvals.module#PendingApprovalsModule'},
      {path: 'role', loadChildren: 'app/home/user/role/role.module#RoleModule'},
      {path: 'escalations', loadChildren: 'app/home/user/escalations/escalations.module#EscalationsModule'},
      {path: 'users', loadChildren: 'app/home/user/users/users.module#UsersModule'},
      {path: 'audit-logs', loadChildren: 'app/home/user/audit-logs/audit-logs.module#AuditLogsModule'},
      {path: 'subscription', loadChildren: 'app/home/user/subscription/subscription.module#SubscriptionModule'},
      {path: 'audit-logs', loadChildren: 'app/home/user/audit-logs/audit-logs.module#AuditLogsModule'},
      {path: 'notification', loadChildren: 'app/home/user/notifications/notifications.module#NotificationsModule'},
      {path: 'error-log', loadChildren: 'app/home/user/error-log/error-log.module#ErrorLogModule'},
      {path: 'profile', loadChildren: 'app/home/user/profile/profile.module#ProfileModule'}

    ]
  }
];

export const userRouting: ModuleWithProviders = RouterModule.forChild(routes);
