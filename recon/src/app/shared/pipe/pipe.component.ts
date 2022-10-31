import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class PipeComponent implements PipeTransform  {

  constructor() { }

  transform (items: any[], searchText: String): any[] {
         if (!items) { return[]; }
         if (!searchText) { return items; }

         searchText = searchText;

         return items.filter( it => {
         return it.includes(searchText);
    });
  }


}
