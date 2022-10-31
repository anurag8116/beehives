import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FullLayoutComponent} from './full-layout/full-layout.component';
import {LayoutComponent} from './layout/layout.component';

export const routes: Routes = [
  {
    path: '', component: FullLayoutComponent, children: [
      {path: 'rollback', loadChildren: 'app/home/etl/rollback/rollback.module#RollbackModule'},
      {path: 'master-data', loadChildren: 'app/home/etl/master-data/master-data.module#MasterDataModule'},
      {path: 'master-data-type', loadChildren: 'app/home/etl/master-data-type/master-data-type.module#MasterDataTypeModule'},
      {path: 'pipeline', loadChildren: 'app/home/etl/pipeline/pipeline.module#PipelineModule'},
      {path: 'invalid-data', loadChildren: 'app/home/etl/invalid-data/invalid-data.module#InvalidDataModule'},
      {path: 'master-data-view', loadChildren: 'app/home/etl/master-data-view/master-data-view.module#MasterDataViewModule'},
      {path: 'invalid-data-view', loadChildren: 'app/home/etl/invalid-data-view/invalid-data-view.module#InvalidDataViewModule'},
      {path: 'ej-viewer', loadChildren: 'app/home/etl/ej-viewer/ej-viewer.module#EjViewerModule'},
      {path: 'file-upload', loadChildren: 'app/home/etl/file-upload/file-upload.module#FileUploadModule'},
      {path: 'cashback-coupon', loadChildren: 'app/home/etl/cashback-coupon/cashback-coupon.module#CashbackCouponModule'}
    ]
  }, {
    path: 'part', component: LayoutComponent, children: [
      {path: 'execution', loadChildren: 'app/home/etl/pipeline-execution/pipeline-execution.module#PipelineExecutionModule'},
      {path: 'master-data', loadChildren: 'app/home/etl/master-data/master-data.module#MasterDataModule'},
      {path: 'invalid-data', loadChildren: 'app/home/etl/invalid-data/invalid-data.module#InvalidDataModule'},
      {path: 'assign-invalid-data', loadChildren: 'app/home/etl/assign-invalid-data/assign-invalid-data.module#AssignInvalidDataModule'},
      {path: 'assigned-master-data', loadChildren: 'app/home/etl/assigned-master-data/assigned-master-data.module#AssignedMasterDataModule'}
    ]
  }
];

export const etlRouting: ModuleWithProviders = RouterModule.forChild(routes);
