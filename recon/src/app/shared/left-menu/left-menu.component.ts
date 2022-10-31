import {Component, Input, OnInit} from '@angular/core';
import {MenuService} from '../menu.service';
import {MenuItemService} from '../menu-item.service';
import {HttpService} from '../services/http-service';
import {AuthService} from '../services/auth.service';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {fakeAsync} from '@angular/core/testing';


@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styles: ['a{cursor: pointer}']
})
export class LeftMenuComponent implements OnInit {

  @Input() public privilege: any = {privilegeMenu: [{}]};
  public headerMenu: any[] = [];
  public dashboards = false;
  public dashlets = false;
  public pipelines = false;
  public pipelineOperations = false;
  public invalidData = false;
  public invalidDataView = false;
  public assignedMasterData = false;
  public masterDataType = false;
  public masterData = false;
  public masterDataView = false;
  public rollbacks = false;
  public dataElements = false;
  public rules = false;
  public ruleGroups = false;
  public recons = false;
  public passwordPolicy = false;
  public users = false;
  public roles = false;
  public job = false;
  public jobExecutions = false;
  public reports = false;
  public dataProviders = false;
  public lookupProviders = false;
  public pendingApprovals = false;
  public approvelRight = false;
  public privileges = false;
  public escalations = false;
  public unReconciledTransaction = false;
  public dataSourceView = false;
  public reconciledTransaction = false;
  public dataSources = false;
  public modules = false;
  public relaxMatch = false;
  public assignedInvalidData = false;
  public reconIteration = false;
  public reportExecutions = false;
  public auditLogs = false;
  public errorLog = false;
  public reportExport = false;
  public reportImport = false;
  public dashboardExport = false;
  public dashboardImport = false;
  public glConfig = false;
  public settings = false;
  public onus = false;
  public onusQueue = false;
  public ntrTransactionDispute = false;
  public issuerDisputes = false;
  public issuerChargeback = false;
  public issuerGoodfaithChargeback = false;
  public issuerPreArbitrations = false;
  public issuerArbitrations = false;
  public aquirerChargeBack = false;
  public aquirerGoodfaithChargeback = false;
  public aquirerPreArbitrations = false;
  public aquirerArbitrations = false;
  public disputeSetting = false;
  public glBalancing = false;
  public settlementReport = false;
  public downloadReport = false;
  public disputeReport = false;
  public ejviewer = false;
  public rcGlBalancing = false;
  public brsReport = false;
  public invoiceReport = false;
  public rahejaReport = false;
  public irctcBrs = false;
  public fileUpload = false;
  public airtel_brs_Report = false;
  public openTickets = false;
  public reconDuplicate = false;
  public fileApproval = false;
  public cashbackCoupon = false;
  
  constructor(private menuService: MenuService, private  menuItemService: MenuItemService, private httpService: HttpService, private authService: AuthService) {
  }

  ngOnInit() {
    this.httpService.get('v1/privileges?Find=ByRole', true).subscribe(
      (dataa: any) => {
        this.privilege = dataa;
        if (dataa.privilegeMenu) {
          this.menuSelection();
        }
      }
    );
  }

  onHeaderMenuSelect(id: number) {
    this.menuService.setHeaderMenuId(id);
    this.menuService.removeDropDownMenuId();
  }

  setSelectedMenu(event, innerDivId) {
    $('.collapse.in').each(function (i, obj) {
      if (innerDivId !== obj.getAttribute('id')) {
        $(this).removeClass('in');
      }
    });
    $('.menu').each(function (i, obj) {
      if (event.target.id !== obj.getAttribute('id')) {
        $(this).addClass('collapsed');
      }
    });
  }

  private menuSelection() {

    for (const privilege of this.privilege.privilegeMenu) {
      // ---------------  Dashboard Menu  ---------------
      if (privilege.privilegeCode === 'dashboards') {
        this.dashboards = true;
      } else if (privilege.privilegeCode === 'dashboardExport') {
        this.dashboardExport = true;
      } else if (privilege.privilegeCode === 'dashboardImport') {
        this.dashboardImport = true;
      } else if (privilege.privilegeCode === 'dashlets') {
        this.dashlets = true;

        // ---------------  Etl Menu  ---------------
      } else if (privilege.privilegeCode === 'pipelines') {
        this.pipelines = true;
      } else if (privilege.privilegeCode === 'pipelineOperations') {
        this.pipelineOperations = true;
      } else if (privilege.privilegeCode === 'assignedInvalidData') {
        this.assignedInvalidData = true;
      } else if (privilege.privilegeCode === 'invalidData') {
        this.invalidData = true;
      } else if (privilege.privilegeCode === 'invalidDataView') {
        this.invalidDataView = true;
      } else if (privilege.privilegeCode === 'masterDataType') {
        this.masterDataType = true;
      } else if (privilege.privilegeCode === 'masterData') {
        this.masterData = true;
      } else if (privilege.privilegeCode === 'masterDataView') {
        this.masterDataView = true;
      } else if (privilege.privilegeCode === 'assignedMasterData') {
        this.assignedMasterData = true;
      } else if (privilege.privilegeCode === 'ejviewer') {
        this.ejviewer = true;
      } else if (privilege.privilegeCode === 'rollbacks') {
        this.rollbacks = true;
      } else if (privilege.privilegeCode === 'fileUpload') {
        this.fileUpload = true;
      } else if (privilege.privilegeCode === 'fileApproval') {
        this.fileApproval = true;
      } else if (privilege.privilegeCode === 'cashbackCoupon') {
        this.cashbackCoupon = true;
        // ---------------  Recon Menu  ---------------
      } else if (privilege.privilegeCode === 'reconIteration') {
        this.reconIteration = true;
      } else if (privilege.privilegeCode === 'relaxMatch') {
        this.relaxMatch = true;
      } else if (privilege.privilegeCode === 'dataElements') {
        this.dataElements = true;
      } else if (privilege.privilegeCode === 'rules') {
        this.rules = true;
      } else if (privilege.privilegeCode === 'ruleGroups') {
        this.ruleGroups = true;
      } else if (privilege.privilegeCode === 'recons') {
        this.recons = true;
      } else if (privilege.privilegeCode === 'tickets') {
        this.openTickets = true;
      } else if (privilege.privilegeCode === 'modules') {
        this.modules = true;
      } else if (privilege.privilegeCode === 'dataSources') {
        this.dataSources = true;
      } else if (privilege.privilegeCode === 'reconciledTransaction') {
        this.reconciledTransaction = true;
      } else if (privilege.privilegeCode === 'dataSourceView') {
        this.dataSourceView = true;
      } else if (privilege.privilegeCode === 'unReconciledTransaction') {
        this.unReconciledTransaction = true;
      } else if (privilege.privilegeCode === 'rcGlBalancing') {
        this.rcGlBalancing = true;
      } else if (privilege.privilegeCode === 'glBalancing') {
        this.glBalancing = true;
      } else if (privilege.privilegeCode === 'glConfig') {
        this.glConfig = true;
      } else if (privilege.privilegeCode === 'settlementReport') {
        this.settlementReport = true;
      } else if (privilege.privilegeCode === 'settlementReport') {
        this.settlementReport = true;
      } else if (privilege.privilegeCode === 'rahejaReport') {
        this.rahejaReport = true;
      } else if (privilege.privilegeCode === 'irctcBrs') {
        this.irctcBrs = true;
      } else if (privilege.privilegeCode === 'brsReport') {
        this.brsReport = true;
      } else if (privilege.privilegeCode === 'airtel_brs_Report') {
        this.airtel_brs_Report = true;
        
         } else if (privilege.privilegeCode === 'invoiceReport') {
        this.invoiceReport = true;

        // ---------------  User Menu  ---------------
      } else if (privilege.privilegeCode === 'passwordPolicy') {
        this.passwordPolicy = true;
      } else if (privilege.privilegeCode === 'users') {
        this.users = true;
      } else if (privilege.privilegeCode === 'roles') {
        this.roles = true;
      } else if (privilege.privilegeCode === 'pendingApprovals') {
        this.pendingApprovals = true;
      } else if (privilege.privilegeCode === 'approvelRight') {
        this.approvelRight = true;
      } else if (privilege.privilegeCode === 'privileges') {
        this.privileges = true;
      } else if (privilege.privilegeCode === 'escalations') {
        this.escalations = true;
      } else if (privilege.privilegeCode === 'errorLogs') {
        this.errorLog = true;

        // ---------------  Scheduler Menu  ---------------
      } else if (privilege.privilegeCode === 'job') {
        this.job = true;
      } else if (privilege.privilegeCode === 'jobExecutions') {
        this.jobExecutions = true;

        // ---------------  Report Menu  ---------------
      } else if (privilege.privilegeCode === 'reports') {
        this.reports = true;
      } else if (privilege.privilegeCode === 'downloadReport') {
        this.downloadReport = true;
      } else if (privilege.privilegeCode === 'disputeReport') {
        this.disputeReport = true;
      } else if (privilege.privilegeCode === 'reportExport') {
        this.reportExport = true;
      } else if (privilege.privilegeCode === 'reportImport') {
        this.reportImport = true;
      } else if (privilege.privilegeCode === 'reportExecutions') {
        this.reportExecutions = true;

        // ---------------  Data Provider Menu  ---------------
      } else if (privilege.privilegeCode === 'dataProviders') {
        this.dataProviders = true;
      } else if (privilege.privilegeCode === 'lookupProviders') {
        this.lookupProviders = true;
        // ---------------  Audit Logs  ---------------
      } else if (privilege.privilegeCode === 'auditLogs') {
        this.auditLogs = true;
      } else if (privilege.privilegeCode === 'settings') {
        this.settings = true;
        // ---------------- Disputes -------------------
      } else if (privilege.privilegeCode === 'onus') {
        this.onus = true;
      } else if (privilege.privilegeCode === 'onusQueue') {
        this.onusQueue = true;
      } else if (privilege.privilegeCode === 'ntrTransactionDispute') {
        this.ntrTransactionDispute = true;
      } else if (privilege.privilegeCode === 'issuerDisputes') {
        this.issuerDisputes = true;
      } else if (privilege.privilegeCode === 'issuerChargeback') {
        this.issuerChargeback = true;
      } else if (privilege.privilegeCode === 'issuerGoodfaithChargeback') {
        this.issuerGoodfaithChargeback = true;
      } else if (privilege.privilegeCode === 'issuerPreArbitrations') {
        this.issuerPreArbitrations = true;
      } else if (privilege.privilegeCode === 'issuerArbitrations') {
        this.issuerArbitrations = true;
      } else if (privilege.privilegeCode === 'aquirerGoodfaithChargeback') {
        this.aquirerGoodfaithChargeback = true;
      } else if (privilege.privilegeCode === 'aquirerChargeBack') {
        this.aquirerChargeBack = true;
      } else if (privilege.privilegeCode === 'aquirerPreArbitrations') {
        this.aquirerPreArbitrations = true;
      } else if (privilege.privilegeCode === 'aquirerArbitrations') {
        this.aquirerArbitrations = true;
      } else if (privilege.privilegeCode === 'disputeSetting') {
        this.disputeSetting = true;
      } else if (privilege.privilegeCode === 'reconDuplicate') {
        this.reconDuplicate = true;
      }
    }
  }
}
