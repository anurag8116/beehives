import {Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';

enum DataBaseTableConfigType {
  EXISTING = 'EXISTING',
  TABLE = 'TABLE',
  SCRIPT = 'SCRIPT'
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public module: any = [];
  public id: number;
  public dataElementTypes = ['VARCHAR', 'BIGINT', 'INT', 'DATE', 'DATETIME', 'DOUBLE', 'FLOAT'];
  public tables: any = [{}];
  public historyTables: any = [];
  public tableColumns: any = [];
  public tableName: any = {};
  public isLoading: boolean;
  public dataBaseTableConfigType: any;

  constructor(private http: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
    this.dataBaseTableConfigType = DataBaseTableConfigType;
  }

  ngOnInit() {
    this.getModulData();
    this.http.get('v1/datatables?type=MASTER_DATA', true).subscribe(
      (data: any) => {
        this.tables = data.data;
      }
    );
    this.http.get('v1/datatables?type=MASTER_HISTORY_TABLE', true).subscribe(
      (data: any) => {
        this.historyTables = data.data;
      }
    );
    this.form = new FormGroup({
      dataBaseTableConfigType: new FormControl('EXISTING'),
      name: new FormControl(null),
      table: new FormControl(null),
      historyTable: new FormControl(null),
      module: new FormGroup({
        id: new FormControl(null)
      }),
      dataElements: new FormArray([
        new FormGroup({
          name: new FormControl(null),
          tableColumn: new FormControl(null),
          type: new FormControl(null),
        })
      ])
    });
  }

  public onTableSelect(tableName: any) {
    this.http.get('v1/datatables/columns?table=' + tableName + '&start=0', true).subscribe(
      (data: any) => {
        this.tableColumns = data;
      }
    );
  }

  autoGenrateColName(colName, i) {
    if (colName) {
      const name = colName.replace(new RegExp('_', 'g'), ' ');
      (<FormArray>this.form.get('dataElements')).at(i).patchValue({name: name});
    }
  }

  autoGenrateColNameForScript(colName, i) {
    if (colName) {
      (<FormArray>this.form.get('dataElements')).at(i).patchValue({name: colName});
    } else {
      (<FormArray>this.form.get('dataElements')).at(i).patchValue({name: null});
    }
  }

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('dataElements')).removeAt(i);
  }

  public addDataElement(): void {
    const control = new FormGroup({
      name: new FormControl(null),
      tableColumn: new FormControl(null),
      type: new FormControl(null),
    });
    (<FormArray>this.form.get('dataElements')).push(control);
  }

  public onSubmit() {
    this.http.post('v1/masterdatatypes', this.form.value, true).subscribe(
      (data: any) => {
        this.http.displaySuccessOnPopUp('Master Data Successfully Created !');
        this.router.navigate(['/home/etl', 'master-data-type', {
          outlets: {
            'fullBodyOutlet': ['list'],
          }
        }]);
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  private getModulData(): void {
    this.http.get('v1/modules?start=0&length=100', true).subscribe(
      (data: any) => {
        this.module = data.data;
      }
    );
  }

}
