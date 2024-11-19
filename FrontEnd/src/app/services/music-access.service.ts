import { Injectable, Inject } from '@angular/core';
import { MusicAttribute } from '../interfaces/music-attributes-given';
import AudioManager from "ryan-music-player";
import { EmptyAudioManagerService } from '../models/empty-audio-manager';

@Injectable({
  providedIn: 'root'
})
export class MusicAccessService {

  private _musicAttribute: MusicAttribute;
  private _audioManager: AudioManager | EmptyAudioManagerService;
  
  private apiUrl ="http://localhost:8080/audio";

  constructor(@Inject(undefined) musicAttribute:MusicAttribute | undefined) {
    if (musicAttribute === undefined){      
      this._musicAttribute = {
        id:-1,
        accessPath:"",
        title: "",
        artist: "",
        album: "",
        image: "",
        yearRelease: -1,
        number: -1,
        genre: ""
      };
      this._audioManager = new EmptyAudioManagerService();
    } 
    else {  
      this._musicAttribute = musicAttribute
      this._audioManager = new AudioManager([musicAttribute.accessPath == "" ? this.apiUrl+"/"+musicAttribute.id : musicAttribute.accessPath])
    }
  }

  set title(value:string){
    this._musicAttribute.title = value
  }
  get title():string{
    return this._musicAttribute.title
  }
  set artist(value:string){
    this._musicAttribute.artist = value
  }
  get artist():string{
    return this._musicAttribute.artist
  }
  set album(value:string){
    this._musicAttribute.album = value
  }
  get album():string{
    return this._musicAttribute.album
  }
  get image():any {
    return this._musicAttribute.image
  }
  set yearRelease(value:number){
    this._musicAttribute.yearRelease = value
  }
  get yearRelease():number{
    return this._musicAttribute.yearRelease
  }
  set number(value:number){
    this._musicAttribute.number = value
  }
  get number():number{
    return this._musicAttribute.number
  }
  set genre(value:string){
    this._musicAttribute.genre = value
  }
  get genre():string{
    return this._musicAttribute.genre
  }
  get musicAttribute():MusicAttribute{
    return this._musicAttribute
  }

  set volume(value:number) {
    this._audioManager.setVolume(value);   
  }

  get currentTime(){
    return this._audioManager.getCurrentTime()/this._audioManager.getDuration()
  }
  get duration(){
    return this._audioManager.getDuration()     
  }
  set currentTime(value: number){
    this._audioManager.seek(value*this._audioManager.getDuration())
  }
  playAudio() {
    this._audioManager.play();
  }
  pauseAudio() {
    this._audioManager.pause();
  }
  stopAudio() {
    this._audioManager.stop();
  }

}