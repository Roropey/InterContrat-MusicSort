import { Injectable } from '@angular/core';
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

  constructor() { }

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

  length(): number {
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

  addMusics(path:string){
    const new_path: string = path.replaceAll("\\","/")
    alert("Add from "+new_path)
  }
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
      alert("Index not in musicList");
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

  resumeList():MusicAttribute[]{
    return this._musicList.map((element) =>
      element.musicAttribute
    )
  }
}
