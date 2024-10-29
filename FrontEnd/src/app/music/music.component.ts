import { Component, Input, Output, EventEmitter } from '@angular/core';

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
  title: string = "";
  @Input()
  artist: string = "";
  @Input()
  image: any;

  @Output()
  deleteTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  upperTriggered: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  downTriggered: EventEmitter<number> = new EventEmitter<number>();

  deleteMusic(){
    this.deleteTriggered.emit(this.index);
  }

  moveUpMusic(){
    this.upperTriggered.emit(this.index);
  }

  moveDownMusic(){
    this.downTriggered.emit(this.index);
  }

}
