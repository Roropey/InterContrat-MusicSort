import { Component, OnInit } from '@angular/core';
import { DataService } from "./data.service";
import { OrderStatus, Attribute } from './ordering.enum';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  private _musicList: any[] = [];
  private _musicListRetired: any[] = [];

  test: number = 0;

  order: OrderStatus = 0; 
  attributeOrder: Attribute = Attribute.Title;


  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getData().subscribe((data) => {
      this._musicList = data;
    }, error => {
      console.error('Error when taking data with data service:', error);
    });
  }

  get musicList(){
    return this._musicList
  }

  set musicList(list: any[]){
    this._musicList = list
    if (this.order != 0){
      this._musicList.sort((a, b) => {
        if (a[this.attributeOrder] > b[this.attributeOrder]) return this.order;
        if (a[this.attributeOrder] < b[this.attributeOrder]) return -this.order;
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

  ordering(wantedOrder: Attribute)
  {
    if (wantedOrder == this.attributeOrder){
      switch (this.order){
        case OrderStatus.Invert:
          this.order = OrderStatus.Not
          break
        case OrderStatus.Not:
          this.order = OrderStatus.Order
          break
        case OrderStatus.Order:
          this.order = OrderStatus.Invert
      }
    }
    else {
      this.attributeOrder = wantedOrder
      this.order = OrderStatus.Order
    }
    this.musicList = this._musicList
  }

  deleteIndex(index: number) {
    if (index != -1 && index<this._musicList.length){
      this._musicList.splice(index,1);
    }
    else {
      alert("Index not in musicList");
    }
  }

  upperMoveIndex(index: number){
    if(index != 0 && index<this._musicList.length){
      [this._musicList[index],this._musicList[index-1]]= [this._musicList[index-1],this._musicList[index]]
    }
  }
  downMoveIndex(index: number){
    if(index != -1 && index<this._musicList.length-1){
      [this._musicList[index],this._musicList[index+1]]= [this._musicList[index+1],this._musicList[index]]
    }
  }
}
