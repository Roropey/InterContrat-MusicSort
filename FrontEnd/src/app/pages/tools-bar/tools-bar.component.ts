import { Component, Input, Output, EventEmitter } from '@angular/core';

import { OrderStatus, Attribute } from '../../enumerations/ordering.enum';
import { PlayStrat } from '../../enumerations/play-strat';


@Component({
  selector: 'app-tools-bar',
  templateUrl: './tools-bar.component.html',
  styleUrl: './tools-bar.component.css'
})
export class ToolsBarComponent {  
  private _searchText: string = "";
  private _volume: number = 1;  
  private _previousVolume:number = -1;
  
  openPopupAdd: boolean = false;
  pathAdd: string = "";

  attribute: typeof Attribute = Attribute;
  playStrat: typeof PlayStrat = PlayStrat;
  
  @Input()
  order: OrderStatus = 0; 
  @Input()
  attributeOrder: Attribute = Attribute.Title; 
  @Input()
  playStratApplied:PlayStrat = PlayStrat.Stop;
  @Input()
  cantUndo: boolean = true;
  @Input()
  cantRedo: boolean = false;

  @Output()
  searchTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  orderTriggered: EventEmitter<Attribute> = new EventEmitter<Attribute>();
  @Output()
  volumeTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  addTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  changeStratTriggered: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  undoTriggered: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  redoTriggered: EventEmitter<void> = new EventEmitter<void>();

  change(event: any){
    this.searchText = event.target.searchText
  }

  get searchText(){
    return this._searchText
  }
  
  set searchText(text: string){
    this._searchText = text.slice(0,Math.min(255,text.length))
    this.searchTriggered.emit(this._searchText)
  }

  get volume(){
    return this._volume
  }

  set volume(value: number){
    this._volume=value
    if (value > 0) {      
      this._previousVolume = value
    }
    this.volumeTriggered.emit(this._volume)
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

  sendPlayStrat(){
    this.changeStratTriggered.emit()
  }

  mute(){
    if (this.volume>0) {
      this._previousVolume = this.volume
      this.volume = 0
    }
    else {
      this.volume = this._previousVolume
    }
  }

  sendUndo(){
    this.undoTriggered.emit()
  }
  sendRedo(){
    this.redoTriggered.emit()
  }

  openClosePopupAdd(){
    this.pathAdd = ""
    this.openPopupAdd = !this.openPopupAdd
  }

  loadMusics(){
    if (this.pathAdd==""){
      alert("Path given empty")
    } else {
      this.addTriggered.emit(this.pathAdd)
      this.openClosePopupAdd()
    }
  }


  

}
