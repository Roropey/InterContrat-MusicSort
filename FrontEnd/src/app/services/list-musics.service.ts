import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, mergeMap, map, Observable, throwError, tap, forkJoin, merge, switchMap, of } from 'rxjs';
import { Pile } from '../models/pile';
import { ActionComp } from '../interfaces/action-comp';
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { MusicAccessService } from './music-access.service';

@Injectable({
  providedIn: 'root'
})
export class ListMusicsService {

  private _musicList: MusicAccessService[] = [];
  private _musicListRetired: MusicAccessService[] = [];

  private _order: OrderStatus = 0; 
  private _attributeOrder: Attribute = Attribute.Title;

  private apiUrl ="http://localhost:8080/audio";

  constructor(@Inject(HttpClient) private http: HttpClient) { }

  

  get musicList(){
    return this._musicList
  }
  set musicList(list: any[]){
    this._musicList = list.map((element => new MusicAccessService(element)))
    if (this._order != 0){
      this._musicList.sort((a, b) => {
        if (a[this._attributeOrder] > b[this._attributeOrder]) return this._order;
        if (a[this._attributeOrder] < b[this._attributeOrder]) return -this._order;
        return 0;
      })
    }    
  }

  get musicListRetired(){
    return this._musicListRetired
  }

  set musicListRetired(list: any[]){
    this._musicListRetired = list
  }

  get attributeOrder():Attribute{
    return this._attributeOrder
  }

  set attributeOrder(wantedOrder: Attribute)
  {
    if (wantedOrder == this._attributeOrder){
      switch (this._order){
        case OrderStatus.Invert:
          this._order = OrderStatus.Not
          break
        case OrderStatus.Not:
          this._order = OrderStatus.Order
          break
        case OrderStatus.Order:
          this._order = OrderStatus.Invert
      }
    }
    else {
      this._attributeOrder = wantedOrder
      this._order = OrderStatus.Order
    }
    this.musicList = this._musicList
  }

  get order():OrderStatus{
    return this._order
  }

  set volume(value:number) {
    this._musicList.forEach(element => {
      element.volume = value
    })
    this._musicListRetired.forEach(element => {
      element.volume = value
    })
  }

  get length(): number {
    return this._musicList.length
  }

  searchMusicList(searchText: string) {
    const searchTextSplit = searchText.split(" ")
    this.musicList = this._musicList.concat(this.musicListRetired)
    this.musicListRetired = this.musicList.filter(
      (music) => {
        return !searchTextSplit.reduce(
          (accumulator, word) =>
            accumulator && 
          (music.title.toLowerCase().includes(word.toLocaleLowerCase()) ||
           music.artist.toLowerCase().includes(word.toLocaleLowerCase())),
          true
        )
      }
    )
    this.musicList = this._musicList.filter(
      (music) => {
        return searchTextSplit.reduce(
          (accumulator, word) =>
            accumulator && 
          (music.title.toLowerCase().includes(word.toLocaleLowerCase()) ||
           music.artist.toLowerCase().includes(word.toLocaleLowerCase())),
          true
        )
      }
    )    
  }

  addMusics(path:string):Observable<number[]>{
    return this.getMusicAttribute(path).pipe(
      catchError((error) => {
        
        return throwError(() => new Error("Error retrieving music attributes "+error))
      }),
      switchMap((musics: MusicAttribute[]) => {
        if (musics) {
          const audioRequests:Observable<number>[] = musics.map((music) =>
            this.getAudio(music.id).pipe(
              catchError((error) => {
                return throwError(() => new Error("Error retrieving audio blob " + error))
              }),
              map((audioBlob: Blob) => {
                return this.addIndex(-1,new MusicAccessService(music, audioBlob))
              })
            )
          )
          // Transform the Observal<number>[] into the form that permit to have the right type for return
          return forkJoin(audioRequests).pipe(
            map((musicAccessServices: number[]) => {
              return musicAccessServices
            })
          );
        } else {
          return throwError(() => new Error("Error type of received music"));
        }
      })
    )
  }

  getMusicAttribute(path:string):Observable<MusicAttribute[]>{
    const params = new HttpParams().set('filePath',path);
    const headers = new HttpHeaders().set('Accept','application/json');
    return this.http.get<MusicAttribute[]>(this.apiUrl+"/upload", {params, headers})
  }

  getAudio(index:number):Observable<Blob>{
    return this.http.get(this.apiUrl+"/"+index,{responseType:'blob'})
  }
/*
http://localhost:8080/audio/upload?filePath=C:/Users/rpeyremorte/Documents/Projet inter-contrat/Trieur de musique/InterContrat-MusicSort/FrontEnd/src/assets/01 One more time.mp3
*/
  addIndex(index: number, element: MusicAccessService): number{
    if (index != -1 && index<this._musicList.length) {
      this._musicList.splice(index,0,element)
      return index

    }
    else {
      this._musicList.push(element)
      return this._musicList.length-1
    } 
  }
  removeIndex(index: number): MusicAccessService | undefined {
    if (index != -1 && index<this._musicList.length){
      const removed = this._musicList[index]
      this._musicList.splice(index,1);
      return removed;      
    }
    else {
      alert("Index "+index+"not in musicList");
      return undefined
    }
  }

  upperMoveIndex(index: number): boolean{
    if(index != 0 && index<this._musicList.length){
      [this._musicList[index],this._musicList[index-1]]= [this._musicList[index-1],this._musicList[index]]
      return true
    }
    else {
      return false
    }
  }
  downMoveIndex(index: number): boolean{
    if(index != -1 && index<this._musicList.length-1){
      [this._musicList[index],this._musicList[index+1]]= [this._musicList[index+1],this._musicList[index]]
      return true
    }
    else {
      return false
    }
  }
  saveWork(){
    alert("Receive poke to save locally the work")
  }

  saveFiles(path: string){
    const new_path: string = path.replaceAll("//","/")
    alert("Receive "+new_path+" to save/copy the files there")
  }

  downloadFiles(name: string){
    alert("Receive the name "+name+" for the zip folder of all musics")
  }

  resumeList():MusicAttribute[]{
    return this._musicList.map((element) =>
      element.musicAttribute
    )
  }
}
