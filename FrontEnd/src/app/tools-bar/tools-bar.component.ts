import { Component, Input, Output, EventEmitter } from '@angular/core';

import { OrderStatus, Attribute } from '../ordering.enum';


@Component({
  selector: 'app-tools-bar',
  templateUrl: './tools-bar.component.html',
  styleUrl: './tools-bar.component.css'
})
export class ToolsBarComponent {  
  private _searchText: string = "";

  attribute: typeof Attribute = Attribute;

  @Input()
  order: OrderStatus = 0; 
  @Input()
  attributeOrder: Attribute = Attribute.Title; 

  @Output()
  searchTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  orderTriggered: EventEmitter<Attribute> = new EventEmitter<Attribute>();

  change(event: any){
    this.searchText = event.target.searchText
  }

  get searchText(){
    return this._searchText
  }
  
  set searchText(text: string){
    this._searchText = text
    this.searchTriggered.emit(this._searchText)
  }

  resetSearch(){
    this.searchText = ""
  }


  titleOrdering(){
    this.orderTriggered.emit(Attribute.Title)
  }

  artistOrdering(){
    this.orderTriggered.emit(Attribute.Artist)
  }
}
