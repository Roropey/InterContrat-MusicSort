import { Component, OnInit, Input } from '@angular/core';
import AudioManager from "ryan-music-player";
import { EmptyAudioManagerService } from '../../../models/empty-audio-manager';
import { MusicAccessService } from '../../../services/music-access.service';

@Component({
  selector: 'app-music-reader',
  templateUrl: './music-reader.component.html',
  styleUrl: './music-reader.component.css'
})
export class MusicReaderComponent implements OnInit {

    @Input()

    music:MusicAccessService = new MusicAccessService(undefined)

    get currentTime(){
      return this.music.currentTime
    }
    get duration(){
      return this.music.duration
    }

    set currentTime(value: number){
      this.music.currentTime = value
    }

    ngOnInit(){
    }
    playAudio() {
      this.music.playAudio();
    }
  
    pauseAudio() {
      this.music.pauseAudio();
    }

    stopAudio() {
      this.music.stopAudio();
    }
  
  }

