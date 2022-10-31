import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public modules = [];
  public reports = [];
  public import: FormGroup;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public fileName: string;

  constructor(private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.fileName = '';
    this.import = new FormGroup({
      'encodedString': new FormControl(null),
    });
  }

  submit() {
    this.httpService.post('v1/reports?Import=JsonFile', this.import.value, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Reports Successfully Submitted ! ');
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
      reader.readAsBinaryString(file);
    }
  }

  handleFile(event) {
    const binaryString = event.target.result;
    this.import.patchValue({encodedString: btoa(binaryString)});
    console.log(btoa(binaryString));
  }

}
