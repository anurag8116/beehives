import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-coustom-error',
  templateUrl: './coustom-error.component.html'
})
export class CoustomErrorComponent implements OnDestroy {


  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, private matSnackBar: MatSnackBar) {
  }

  dismissMatSbackBar() {
    this.matSnackBar.dismiss();
  }

  ngOnDestroy(): void {
    this.matSnackBar.dismiss();
  }

}
