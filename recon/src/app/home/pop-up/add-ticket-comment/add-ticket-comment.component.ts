import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-add-ticket-comment',
  templateUrl: './add-ticket-comment.component.html'
})
export class AddTicketCommentComponent implements OnInit {

  public form: FormGroup;
  public stages = [];
  public isLoading: boolean;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<AddTicketCommentComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
    this.stages = this.popUpData.stages;
  }

  ngOnInit() {
    this.form = new FormGroup({
      'ticketId': new FormControl(null),
      'comment': new FormControl(null)
    });
  }

  public commentSubmit() {
    this.isLoading = true;
    this.form.get('ticketId').patchValue(this.popUpData.ticketId);
    this.httpService.put('v1/tickets/addcomments', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Comment Added Successfully ! ');
        this.close();
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;

      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
