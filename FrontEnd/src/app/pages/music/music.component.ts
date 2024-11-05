import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MusicAttribute } from '../../interfaces/music-attribute';

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
  music: MusicAttribute = {
    origin_path:"",
    access_path:"",
    title: "",
    artist: "",
    album: "",
    image: "",
    year: 0,
    number: 0,
    genre: ""
  };
  @Input()
  volume: number = 1;

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
