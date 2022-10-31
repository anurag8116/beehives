import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableDirective} from 'angular-datatables';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html'
})

export class ViewComponent implements OnInit {

  @ViewChild('tableContainer') tableContainer: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public textFile = {
    name: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ' +
      ' - - - - - - - - - - - - -Select ATM - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'
  };
  public matchingTextSize = '';
  private matchTextSuffix = 'Match Found';
  private matchTextPrefix = 'No';
  private currentMatchText = '';
  private caseSensitive = false;
  private wordMatch = false;
  private passLatestValue = '';
  public selectedAtmName;
  public atmNames = [];

  constructor(private sanitizer: DomSanitizer, private httpService: HttpService) {
  }

  ngOnInit() {
    this.httpService.get('v1/masterdatas?Find=AtmList', true).subscribe(
      (data: any) => {
        this.atmNames = data;
      }
    );
  }

  handleResultSelected(atmName: any) {
    if ($('span').hasClass('ej-viewer-bold')) {
      $('span').removeClass('ej-viewer-bold');
    }
    this.httpService.get('v1/ejviewer/' + atmName, true).subscribe(
      (data: any) => {
        this.textFile = data;
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  searchText(value: string) {
    this.passLatestValue = value;
    if (value.length > 0) {
      this.currentMatchText = value;
      let content = $('span.col').text();
      if (this.caseSensitive) {
        if (this.wordMatch) {
          const wordRegexSen = new RegExp('\\b' + value + '\\b', 'g');
          content = this.replaceWord(content, wordRegexSen, value);
          this.countMatching(content, wordRegexSen);
        } else {
          const regSen = new RegExp(value, 'g');
          content = this.replaceWord(content, regSen, value);
          this.countMatching(content, regSen);
        }
      } else {
        if (this.wordMatch) {
          const wordRegex = new RegExp('\\b' + value + '\\b', 'gi');
          content = this.replaceWord(content, wordRegex, value);
          this.countMatching(content, wordRegex);
        } else {
          const reg = new RegExp(value, 'gi');
          content = this.replaceWord(content, reg, value);
          this.countMatching(content, reg);
        }
      }
      $('span.col').html(content);
    } else {
      this.removeHighlight();
    }
  }

  replaceWord(content, wordRegexSen, value): any {
    content = content.replace(wordRegexSen, '<span  class="highlight">' + value + '</span>');
    return content;
  }

  removeHighlight() {
    let content = $('span.col').text();
    const reg = new RegExp(this.currentMatchText, 'g');
    content = content.replace(reg, '<span  class="remove-highlight">' + this.currentMatchText + '</span>');
    this.matchingTextSize = this.matchTextPrefix + ' ' + this.matchTextSuffix;
    $('span.col').html(content);
  }

  countMatching(content, reg) {
    if (content.match(reg) !== null) {
      this.matchingTextSize = content.match(reg).length.toString() + ' ' + this.matchTextSuffix;
    } else {
      this.matchingTextSize = this.matchTextPrefix + ' ' + this.matchTextSuffix;
    }
  }

  selectCase(event: any) {
    this.caseSensitive = event.target.checked;
    $('span.col').html(this.textFile.name);
    if (this.passLatestValue.length > 0) {
      this.searchText(this.passLatestValue);
    }
  }

  selectWord(event: any) {
    this.wordMatch = event.target.checked;
    $('span.col').html(this.textFile.name);
    if (this.passLatestValue.length > 0) {
      this.searchText(this.passLatestValue);
    }
  }
}
