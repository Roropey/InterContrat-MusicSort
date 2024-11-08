import { Component, OnInit, Input } from '@angular/core';
import AudioManager from "ryan-music-player";
import { EmptyAudioManagerService } from '../../../services/empty-audio-manager.service';

@Component({
  selector: 'app-music-reader',
  templateUrl: './music-reader.component.html',
  styleUrl: './music-reader.component.css'
})
export class MusicReaderComponent implements OnInit {
    audioManager: AudioManager | EmptyAudioManagerService;


    private _volume: number = 1;

    private _path: string = "";
    //['./assets/Imagine Dragons - Radioactive.mp3','assets/01 One more time.mp3','assets/04 Harder, better, faster, stronger.mp3']
    constructor(){
      if (this.path.length == 0){
        this.audioManager = new EmptyAudioManagerService();
      }
      else {
        this.audioManager = new AudioManager([this.path]);
      }
    }
    @Input()
    set path(url:string){
      this._path = url;
      this.audioManager = new AudioManager([url]);
    }

    get path() {
      return this._path;
    }
    
    @Input()
    set volume(value:number) {
      this._volume=value
      this.audioManager.setVolume(value);   
    }

    get volume(){
      return this._volume
    }

    get currentTime(){
      return this.audioManager.getCurrentTime()/this.audioManager.getDuration()
    }
    get duration(){
      return this.audioManager.getDuration()     
    }

    set currentTime(value: number){
      this.audioManager.pause()
      this.audioManager.seek(value*this.audioManager.getDuration())
      this.audioManager.play()
    }

    ngOnInit(){
    }
    playAudio() {
      this.audioManager.play();
    }
  
    pauseAudio() {
      this.audioManager.pause();
    }

    stopAudio() {
      this.audioManager.stop();
    }
  
  }

