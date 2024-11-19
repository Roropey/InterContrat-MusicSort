import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MusicAccessService } from '../../services/music-access.service';


@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrl: './music.component.css'
})
export class MusicComponent {
  @Input()
  index: number = -1;
  @Input()
  maxIndex: number = -1;
  @Input()
  music: MusicAccessService = new MusicAccessService(undefined)
  @Input()
  toPause:boolean = false;

  popoverOpened: boolean = false;
  countOutside: number = 0;
  @Output()
  deleteTriggered: EventEmitter<number[]> = new EventEmitter<number[]>();
  @Output()
  upperTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  downTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  playTriggered: EventEmitter<number> = new EventEmitter<number>();


  countPlusOutside(param:any){
    this.countOutside++
  }
  deleteMusic(){
    this.deleteTriggered.emit([this.index]);
  }

  moveUpMusic(){
    this.upperTriggered.emit(this.index);
  }

  moveDownMusic(){
    this.downTriggered.emit(this.index);
  }

  setPopoverValue(value: boolean) {
    this.popoverOpened = value
  }

  changePopoverValue(){
    this.popoverOpened = !this.popoverOpened
  }

  closePopover() {
    this.popoverOpened = false
  }

  playEmit(){
    this.toPause = false;
    this.playTriggered.emit(this.index);
  }

}
