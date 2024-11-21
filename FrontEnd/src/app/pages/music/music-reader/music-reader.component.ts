import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MusicAccessService } from '../../../services/music-access.service';

@Component({
  selector: 'app-music-reader',
  templateUrl: './music-reader.component.html',
  styleUrl: './music-reader.component.css'
})
export class MusicReaderComponent implements OnInit {

    @Input()
    music:MusicAccessService = new MusicAccessService(undefined)
    @Input()
    set toPause(toPause:boolean){
      if(toPause){
        this.pauseAudio()
      }
    }
    

    @Output()
    playTriggered: EventEmitter<void> = new EventEmitter<void>();

    get currentTime(){
      return this.music.currentTime
    }
    get duration(){
      return this.music.duration
    }

    get isFinite():boolean{
      return Number.isFinite(this.duration)
    }

    set currentTime(value: number){
      this.music.currentTime = value
    }

    ngOnInit(){
    }
    playAudio() {
      this.music.playAudio();
      this.playTriggered.emit();
    }
  
    pauseAudio() {
      this.music.pauseAudio();
    }

    stopAudio() {
      this.music.stopAudio();
    }
  
  }

