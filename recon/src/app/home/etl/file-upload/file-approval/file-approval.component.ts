import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {AuthService} from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-file-approval',
  templateUrl: './file-approval.component.html'
})
export class FileApprovalComponent implements OnInit {

  isLoading = false;
  isRejectedLoading = false;
  isMerchantProofLoading = false;
  isAuthLoading = false;
  isReversalLoading = false;
  isAutoReversalLoading = false;
  approvalData = {rejectedApproved: false, authApiApproved: false, reversalApiApproved: false, autoReversalApproved: false};
  acknDataSourceId = 88;
  merchantProofDataSourceId = 100;
  approvalPrivilegeUserId = [3, 27, 28, 42, 44];
  loggedInUserId = null;
  hasPrivilege = false;
  hasMerchantProof = false;

  constructor(private httpService: HttpService, private authService: AuthService) {
    this.loggedInUserId = +this.authService.getUserId();
    if (this.approvalPrivilegeUserId.includes(this.loggedInUserId)) {
      this.hasPrivilege = true;
    }
  }

  ngOnInit() {
    this.getFileApprovalStatus();
    this.getMerchantProofFiles();
  }

  getFileApprovalStatus() {
    this.httpService.get('v1/fileupload/status?dataSourceId=' + this.acknDataSourceId, true).subscribe(
      (res: any) => {
        this.approvalData = res;
      }
    );
  }

  getMerchantProofFiles() {
    const url = 'v1/fileupload?columns[0][data]=dataSourceId&columns[0][search][value]=' + this.merchantProofDataSourceId;
    this.httpService.get(encodeURI(url), true).subscribe(
      (res: any) => {
        this.hasMerchantProof = res.data.length > 0;
      }
    );
  }

  approveMerchantFile() {
    this.httpService.get('v1/fileupload?Operation=ApproveMerchantProof&dataSourceId=' + this.merchantProofDataSourceId, true).subscribe(
      (res: any) => {
        this.httpService.displaySuccessOnPopUp('File approved successfully', 10000);
        this.getMerchantProofFiles();
      }
    );
  }

  onApprove(fileApproveType) {
    switch (fileApproveType) {
      case 'REJECTED': {
        this.isRejectedLoading = true;
        break;
      }
      case 'AUTH_API': {
        this.isAuthLoading = true;
        break;
      }
      case 'REVERSAL_API': {
        this.isReversalLoading = true;
        break;
      }
      case 'AUTO_REVERSAL': {
        this.isAutoReversalLoading = true;
        break;
      }
    }
    const body = {
      dataSourceId: this.acknDataSourceId,
      approveType: fileApproveType
    };
    this.httpService.put('v1/fileupload/approve', body, true).subscribe(
      () => {
        this.getFileApprovalStatus();
        this.isRejectedLoading = false;
        this.isAuthLoading = false;
        this.isReversalLoading = false;
        this.isAutoReversalLoading = false;
        this.httpService.displaySuccessOnPopUp('File approved successfully', 10000);
      }
    );
  }
}
