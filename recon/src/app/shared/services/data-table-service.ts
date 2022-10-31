import {ServiceConstant} from './service-constant';
import {AppConstants} from './app.constants';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';

@Injectable()
export class DataTableService {

  public editor;

  constructor(private router: Router, private authService: AuthService) {
  }

  public getBasicTable(url: string, column: any[]): any {

    return {
      pagingType: 'simple',
      searching: true,
      ajax: {
        url: ServiceConstant.URL + url,
        async: true,
        type: 'GET',
        headers: this.getDataTableHeaders(),
        error: (xhr, error, thrown) => {
          if (xhr.status === 401) {
            localStorage.clear();
            this.router.navigate(['/authentication']);
          } else {
            this.displayErrorOnPopUp(this.getMessaage(xhr));
          }
        },
      },
      pageLength: 10,
      serverSide: true,
      processing: true,
      language: {
        emptyTable: 'No data available'
      },
      columnDefs: [{'className': 'dt-left', 'targets': '0'}],
      columns: column
    };
  }

  public getDataTableFixColSIze(url: string, column: any[]): any {

    return {
      pagingType: 'simple',
      searching: true,
      ajax: {
        url: ServiceConstant.URL + url,
        async: true,
        type: 'GET',
        headers: this.getDataTableHeaders(),
        error: (xhr, error, thrown) => {
          if (xhr.status === 401) {
            localStorage.clear();
            this.router.navigate(['/authentication']);
          } else {
            this.displayErrorOnPopUp(this.getMessaage(xhr));
          }
        },
      },
      pageLength: 10,
      serverSide: true,
      processing: true,
      columnDefs: [{
        class: 'col-0',
        orderable: false,
        data: null,
        defaultContent: '',
        targets: 0
      }, {
        class: 'col-1',
        targets: 1
      }, {
        class: 'col-2',
        targets: 2
      }, {
        class: 'col-3',
        targets: 3
      }, {
        class: 'col-4',
        targets: 4
      }, {
        class: 'col-5',
        targets: 5
      }, {
        class: 'col-6',
        targets: 6
      }, {
        targets: 'dlySlsFcstDay'
      }, {
        targets: 'widthsize'
      }],
      columns: column
    };
  }

  public getDashboardGridTable(url: string, column: any[], tableDefination: any): any {

    return {
      pagingType: 'simple',
      dom: '<"top">rt<"bottom"lip><"clear">',
      searching: true,
      responsive: true,
      ajax: {
        url: ServiceConstant.URL + url,
        async: true,
        type: 'GET',
        headers: this.getDataTableHeaders(),
        error: (xhr, error, thrown) => {
          if (xhr.status === 401) {
            localStorage.clear();
            this.router.navigate(['/authentication']);
          }
        },
      },
      pageLength: 10,
      serverSide: true,
      processing: true,
      columns: column,
      rowCallback: (row: Node, data: any, index: number) => {
        const self = this;
        if (tableDefination.colors) {
          tableDefination.colors.forEach((item, tableDefinationIndex) => {
            const fieldValue = data[item.fieldName];
            switch (item.conditionName) {
              case 'Equal':
                if (Number(item.conditionValue)) {
                  if (Number(fieldValue) === Number(item.conditionValue)) {
                    $('td', row).css('background-color', item.colorCode);
                  }
                } else {
                  if (fieldValue === item.conditionValue) {
                    $('td', row).css('background-color', item.colorCode);
                  }
                }
                break;
              case 'Less':
                if (Number(item.conditionValue)) {
                  if (Number(fieldValue) > Number(item.conditionValue)) {
                    $('td', row).css('background-color', item.colorCode);
                  }
                }
                break;
              case 'Greater':
                if (Number(item.conditionValue)) {
                  if (Number(fieldValue) < Number(item.conditionValue)) {
                    $('td', row).css('background-color', item.colorCode);
                  }
                }
                break;
              default:
            }
          });
        }
        return row;
      }
    };
  }

  public getDashboardGridTestTable(url: string, column: any[]): any {

    return {
      pagingType: 'simple',
      searching: true,
      scrollY: '40%',
      autoWidth: false,
      pageResize: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: {
        url: ServiceConstant.URL + url,
        async: true,
        type: 'GET',
        headers: this.getDataTableHeaders(),
        error: (xhr, error, thrown) => {
          if (xhr.status === 401) {
            localStorage.clear();
            this.router.navigate(['/authentication']);
          }
        },
      },
      pageLength: 10,
      serverSide: true,
      processing: true,
      columns: column,
    };
  }

  public displayErrorOnPopUp(errors: string) {
    $.confirm(this.getErrorModal(errors));
  }

  public getEditableService(url: string, column: any[]): any {

    return Object.assign(this.getBasicTable(url, column), {
      dom: 'Bfrtip',
      select: {
        style: 'os',
        selector: 'td:first-child'
      },
      buttons: [
        {extend: 'edit'}
      ]
    });
  }

  public getAdvanceTable(url: string, column: any[], message = '', title = 'SANJIVANI CREDIT CO-OP.SOCIETY LIMITED'): any {
    return Object.assign(this.getBasicTable(url, column), {
      dom: 'Bfrtip',
      colReorder: true,
      buttons: [
        'colvis',
        {
          extend: 'excelHtml5',
          title: title,
          messageTop: message,
          exportOptions: {
            columns: ':visible'
          }
        },
        {
          extend: 'print',
          title: title,
          messageTop: message,
          pageSize: 'A4',
          exportOptions: {
            columns: ':visible',
            search: 'applied',
            order: 'applied'
          },
          customize: function (win) {
            $(win.document.body).find('table').addClass('advancetable');
            $(win.document.body).find('h1').css('font-size', '18px');
          }
        },
        {
          text: 'PDF',
          extend: 'pdfHtml5',
          title: '',
          pageSize: 'A4',
          exportOptions: {
            columns: ':visible',
            search: 'applied',
            order: 'applied'
          },
          customize: function (doc) {
            /*doc.content.splice(0, 1);       title remove*/
            doc.styles.tableHeader = {
              background: 'white',
              fontSize: '7',
              bold: true,
              color: 'black',
            };
            const now = new Date();
            const jsDate = now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear();
            doc.pageMargins = [20, 60, 20, 30];
            // Set the font size fot the entire document
            doc.defaultStyle.fontSize = 7;
            doc.styles.tableHeader.fontSize = 7;
            doc['header'] = (function () {
              return {
                columns: [
                  {
                    alignment: 'left',
                    text: title,
                    fontSize: 12,
                    margin: [10, 0]
                  },
                  {
                    alignment: 'left',
                    text: message,
                    fontSize: 10,
                    margin: [10, 0]
                  }
                ],
                margin: 10,
              };
            });
            doc['footer'] = (function (page, pages) {
              return {
                columns: [
                  {
                    alignment: 'left',
                    text: ['Created on: ', {text: jsDate.toString()}]
                  },
                  {
                    alignment: 'right',
                    text: ['page ', {text: page.toString()}, ' of ', {text: pages.toString()}]
                  }
                ],
                margin: 20
              };
            });
            const objLayout = {};
            objLayout['hLineWidth'] = function (i) {
              return .5;
            };
            objLayout['vLineWidth'] = function (i) {
              return .5;
            };
            objLayout['hLineColor'] = function (i) {
              return '#aaa';
            };
            objLayout['vLineColor'] = function (i) {
              return '#aaa';
            };
            objLayout['paddingLeft'] = function (i) {
              return 4;
            };
            objLayout['paddingRight'] = function (i) {
              return 4;
            };
            doc.content[0].layout = objLayout;
          }
        }
      ],
    });
  }

  getPager(totalItems: number, currentPage: number = 1, displayItems: number = 10) {
    const totalPages = Math.ceil(totalItems / displayItems);
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 10) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }
    const startIndex = (currentPage - 1) * displayItems;
    const endIndex = Math.min(startIndex + displayItems - 1, totalItems - 1);
    const pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: displayItems,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

  public getSSBasicTable(data: any[], column: any[]): any {
    return {
      pagingType: 'simple',
      searching: true,
      data: data,
      pageLength: 10,
      processing: true,
      columns: column
    };
  }

  public getMessaage(errorResponse: any): string {
    let errors = '';
    if (errorResponse.status === 500) {
      errors += 'Internal Server Error !!';
    } else if (errorResponse.status === 403) {
      errors += 'you aren\'t authorized to view this page!';
    } else if (errorResponse.status === 404) {
      for (const err of JSON.parse(errorResponse.responseText)) {
        errors += err.message + '<br>';
      }
    } else if (errorResponse.status === 400) {

      for (const err of JSON.parse(errorResponse.responseText)) {
        if (err.message) {
          errors += err.message + '<br>';
        }
      }
    } else if (errorResponse.status === 401) {
      //    for (const err of errorResponse.error) {
      if (errorResponse.statusText) {
        errors += errorResponse.statusText + '<br>';
      }
      //    }
      localStorage.clear();
      this.router.navigate(['/authentication']);
    } else {
      errors += 'net::ERR_CONNECTION_REFUSED !!';
    }
    return errors;
  }

  private getErrorModal(message: string): any {
    const defaultModal = this.getDefaultModal();
    defaultModal.type = 'red';
    defaultModal.title = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Error ...!';
    defaultModal.buttons.close.btnClass = 'btn-red';
    defaultModal.content = message;
    return defaultModal;
  }

  private getDataTableHeaders(): any {
    const headers = {
      'X-ASCENT-AUTHTOKEN': localStorage.getItem(AppConstants.AUTH_TOKEN) == null ? '' : localStorage.getItem(AppConstants.AUTH_TOKEN),
      'X-ASCENT-USERID': localStorage.getItem(AppConstants.USER_ID) == null ? '' : localStorage.getItem(AppConstants.USER_ID) == null
    };
    return headers;
  }

  private getDefaultModal() {
    return {
      title: 'Please Fill in the following Details!',
      content: '',
      type: '',
      closeIcon: true,
      closeIconClass: 'fa fa-close',
      animation: 'none',
      offsetBottom: 400,
      height: 'auto',
      buttons: {
        close: {
          btnClass: '', text: 'Close', action: function () {
          }
        }
      }
    };
  }
}
