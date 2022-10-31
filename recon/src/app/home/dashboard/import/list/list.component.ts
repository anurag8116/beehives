import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public import: FormGroup;
  public fileName: string;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.fileName = '';
    this.import = new FormGroup({
      'encodedString': new FormControl(null),
      'fileName': new FormControl(null),
    });
  }

  submit () {
    this.httpService.post('v1/dashboards?Import=JsonFile', this.import.value, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Dashboard Successfully Submitted ! ');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public fileChangeEvent(event: any) {
    const files = event.target.files;
    const file = files[0];
    if (files && file) {
      const reader = new FileReader();
      reader.onload = this.handleFile.bind(this);
      this.fileName = file.name;
      this.import.patchValue({'fileName': file.name});
      reader.readAsBinaryString(file);
    }
  }

  handleFile(event) {
    const binaryString = event.target.result;
    this.import.patchValue({encodedString: btoa(binaryString)});
    console.log(btoa(binaryString));
  }

}
