import { Injectable, Inject } from '@angular/core';
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { AudioState } from '../interfaces/audio-state';
import { CommunicationService } from '../services/communication.service';
import { PlayAction } from '../enumerations/play-strat';


@Injectable({
  providedIn: 'root'
})
export class MusicAccess {

  private _musicAttribute: MusicAttribute;
  private _audio: HTMLAudioElement;
  private _audioState: AudioState;
  private _index: number = -1;

  constructor(@Inject(undefined) musicAttribute:MusicAttribute | undefined, private communicationService?: CommunicationService, audioBlob?:Blob) {
    if (musicAttribute === undefined){      
      this._musicAttribute = {
        id:-1,
        accessPath:"",
        fileName:"",
        title: "",
        artist: "",
        album: "",
        image: new Uint8Array(),
        yearRelease: -1,
        number: -1,
        genre: "",
        imageUrl: ""
      }
      this._audio = new Audio();
      this._audioState = {
        isPlaying: false,
        currentTime: -1,
        duration: -1,
        volume: -1
      }
    } 
    else {  
      this._musicAttribute = musicAttribute
      
      if (this._musicAttribute.accessPath == ""){
        if (audioBlob){
          const url = URL.createObjectURL(audioBlob)
          this._musicAttribute.accessPath = url
        }
        else {
          alert("AudioBlob empty")
        }
      }

      if (this._musicAttribute.image){
        const blob = new Blob([this._musicAttribute.image], {type: 'image/jpeg'})
        this._musicAttribute.imageUrl = URL.createObjectURL(blob) 
      }      
      this._audio = new Audio(musicAttribute.accessPath)
      this._audioState = {
        isPlaying: false,
        currentTime: 0,
        duration: this._audio.duration,
        volume: 1
      }
      this._audio.addEventListener('loadeddata', () => this.updateState())
      this._audio.addEventListener('timeupdate', () => this.updateState())
      this._audio.addEventListener('ended', () => this.handleTrackEnd())
      this._audio.addEventListener('error', (e) => console.error('Audio error:', e))
    }
  }

  set index(value:number){
    this._index = value
  }
  get index():number {
    return this._index
  }

  set fileName(value:string){
    this._musicAttribute.fileName = value
  }

  get fileName():string{
    return this._musicAttribute.fileName
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
  get image():string {
    return this._musicAttribute.imageUrl
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
    this._audio.volume = value
    this._audioState.volume = value
  }

  set currentTime(value: number){
    this._audio.currentTime = value*this._audioState.duration
    this._audioState.currentTime = this._audio.currentTime
  }
  get currentTime(){
    return this._audio.currentTime/this._audioState.duration
  }
  get duration(){
    return this._audioState.duration     
  }


  private updateState(): void {
    this._audioState.currentTime = this._audio.currentTime
    this._audioState.duration = this._audio.duration
    }
  private handleTrackEnd(): void {
    if (this.communicationService){      
      this.communicationService.sendSignal({action: PlayAction.End, index: this._index})
    }
  }

  playAudio() {
    this._audio.play()
    this._audioState.isPlaying = true
    console.log("Send signal")
    if (this.communicationService){      
      this.communicationService.sendSignal({action: PlayAction.Play, index: this._index})
    }
  }

  pauseAudio() {
    this._audio.pause()
    this._audioState.isPlaying = false
  }

  stopAudio() {
    this._audio.pause()
    this._audio.currentTime = 0
    this._audioState.isPlaying = false
  }

}