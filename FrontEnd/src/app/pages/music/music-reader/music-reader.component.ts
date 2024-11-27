import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MusicAccess } from '../../../models/music-access';
import { CommunicationService } from '../../../services/communication.service';

@Component({
  selector: 'app-music-reader',
  templateUrl: './music-reader.component.html',
  styleUrl: './music-reader.component.css'
})
export class MusicReaderComponent implements OnInit {

    @Input()
    music:MusicAccess = new MusicAccess(undefined)
    @Input()
    set toPause(toPause:boolean){
      if(toPause){
        this.pause()
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
    play() {
      this.music.playAudio()
      this.playTriggered.emit()
    }
  
    pause() {
      this.music.pauseAudio()
    }

    stop() {
      this.music.stopAudio()
    }
  
  }

