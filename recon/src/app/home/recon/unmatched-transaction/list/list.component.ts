import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  public recons: any[] = [];
  public DataSources: any[] = [];
  public selectedIndex: number;

  constructor(private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.httpService.get('v1/recons', true).subscribe(
      (data: any) => {
        this.recons = data.data;
       this.onReconClick(data.data[0].id);
      }
    );
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  public onReconClick(reconId: number): void {
    this.router.navigate(['/home/recon/part', 'unmatched-transaction', {outlets: {'bodyOutlet': ['view', reconId]}}]);
  }
}
