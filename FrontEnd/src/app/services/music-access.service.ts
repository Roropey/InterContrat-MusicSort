import { Injectable, Inject } from '@angular/core';
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { AudioState } from '../interfaces/audio-state';



@Injectable({
  providedIn: 'root'
})
export class MusicAccessService {

  private _musicAttribute: MusicAttribute;
  private _audio: HTMLAudioElement;
  private _audioState: AudioState;
  private apiUrl ="http://localhost:8080/audio";

  constructor(@Inject(undefined) musicAttribute:MusicAttribute | undefined, audioBlob?:Blob ) {
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
      if (musicAttribute.accessPath == ""){
        if (audioBlob){
          console.log(audioBlob.type)
          const url = URL.createObjectURL(audioBlob)
          console.log(url)
          this._audio = new Audio(url)
        }
        else {
          alert("AudioBlob empty")
        }
        
      } 
      else {
        this._audio = new Audio(musicAttribute.accessPath)
      }
      this._audio = new Audio(musicAttribute.accessPath == "" ? this.apiUrl+"/"+musicAttribute.id : musicAttribute.accessPath)
      this._audioState = {
        isPlaying: false,
        currentTime: 0,
        duration: this._audio.duration,
        volume: 1
      }
      this._audio.addEventListener('loadeddata', () => this.updateState())
      this._audio.addEventListener('timeupdate', () => this.updateState())
      this._audio.addEventListener('ended', () => this.handleTrackEnd())
      this._audio.addEventListener('error', (e) => console.error('Audio error:', e));
      
      this._audio.addEventListener('loadedmetadata', () => {
        // La durée est maintenant disponible
        console.log(`Durée totale de l'audio: ${this._audio.duration} secondes`);
      
        // Déplace la lecture à une position spécifique
        this._audio.currentTime = 10;  // Par exemple, commence à 10 secondes
      
      })
      this._audio.addEventListener('canplay', () => {
        console.log("Can play")
      })
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
    this._audio.volume = value
    this._audioState.volume = value
  }

  set currentTime(value: number){
    console.log("Try to put: "+value*this._audioState.duration+" on a duration of "+this._audio.duration+" with previous "+this._audio.currentTime)
    this._audio.currentTime = value*this._audioState.duration
    console.log(this._audio.currentTime+"/"+value*this._audioState.duration)
    this._audioState.currentTime = value*this._audioState.duration
    console.log(this._audio.currentTime+"//"+value*this._audioState.duration)
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
    console.log("ReadyState: "+this._audio.readyState+", Preload: "+this._audio.preload)
  }
  private handleTrackEnd(): void {
    ;;
  }

  playAudio() {
    this._audio.addEventListener('canplay',() => {
      this._audio.play()
      this._audioState.isPlaying = true
    })
    //this._audio.play()
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