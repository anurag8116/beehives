import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
})
export class FileInputComponent implements OnInit {

  public fileName: string;
  @Input() accept = '.*';
  @Output() public onFileSelect: any = new EventEmitter<{filePath: string, fileName: string}>();
  constructor() { }

  ngOnInit() {
    this.fileName = '';
  }

  public fileChangeEvent(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
          this.fileName = file.name;
          this.onFileSelect.emit({filePath: reader.result.split(',')[1], fileName: file.name});
      };
    }
  }

}
