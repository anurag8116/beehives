import {Component, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {GraphModelData} from '../graph/graph.component';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-graph-model',
  templateUrl: './graph-model.component.html'
})
export class GraphModelComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<GraphModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GraphModelData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
