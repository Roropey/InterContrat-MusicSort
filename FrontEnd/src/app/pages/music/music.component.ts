import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MusicAccess } from '../../models/music-access';
import { CommunicationService } from '../../services/communication.service';


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
  music: MusicAccess = new MusicAccess(undefined)

  popoverOpened: boolean = false;
  countOutside: number = 0;
  @Output()
  deleteTriggered: EventEmitter<number[]> = new EventEmitter<number[]>();
  @Output()
  upperTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  downTriggered: EventEmitter<number> = new EventEmitter<number>();


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

}
