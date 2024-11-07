import { Component, OnInit } from '@angular/core';
import { DataService } from "../services/data.service";
import { PileService } from '../services/pile.service';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { Action } from "../enumerations/action.enum";
import { MusicAttribute } from '../interfaces/music-attribute';
import { ActionComp } from '../interfaces/action-comp';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  private _musicList: MusicAttribute[] = [];
  private _musicListRetired: MusicAttribute[] = [];
  undoActions: PileService<ActionComp> = new PileService<ActionComp>(50);
  redoActions: PileService<ActionComp> = new PileService<ActionComp>(50);
  
  

  volume: number = 1;

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

  modifVolume(value: number){
    this.volume = value;
  }

  addIndex(index: number, element: MusicAttribute){
    if (index != -1 && index<this._musicList.length) {
      this._musicList.splice(index,0,element)

      this.undoActions.push(
        {
          toDo: Action.Remove,
          music: element,
          index: index
        }
      )

    }
    else if (index == -1 || index == this._musicList.length) {
      this._musicList.push(element)

      this.undoActions.push(
        {
          toDo: Action.Remove,
          music: element,
          index: this._musicList.length-1
        }
      )

    }
  }
  removeIndex(index: number) {
    if (index != -1 && index<this._musicList.length){

      this.undoActions.push(
        {
          toDo: Action.Add,
          music: this._musicList[index],
          index: index
        }
      )

      this._musicList.splice(index,1);
      
    }
    else {
      alert("Index not in musicList");
    }
  }

  upperMoveIndex(index: number){
    if(index != 0 && index<this._musicList.length){
      [this._musicList[index],this._musicList[index-1]]= [this._musicList[index-1],this._musicList[index]]
      
      this.undoActions.push(
        {
          toDo: Action.MoveDown,
          music: {
            origin_path:"",
            access_path:"",
            title: "",
            artist: "",
            album: "",
            image: "",
            year: 0,
            number: 0,
            genre: ""
          },
          index: index - 1
        }
      )
    }
  }
  downMoveIndex(index: number){
    if(index != -1 && index<this._musicList.length-1){
      [this._musicList[index],this._musicList[index+1]]= [this._musicList[index+1],this._musicList[index]]
      this.undoActions.push(
        {
          toDo: Action.MoveUp,
          music: {
            origin_path:"",
            access_path:"",
            title: "",
            artist: "",
            album: "",
            image: "",
            year: 0,
            number: 0,
            genre: ""
          },
          index: index + 1
        }
      )
    }
  }

  addMusics(path:string){
    const new_path: string = path.replaceAll("\\","/")
    alert("Add from "+new_path)
  }

  undoAction(){
    const actionDone = this.undoActions.pop()
    if (actionDone === null || actionDone === undefined){
      alert("No action poped 1")
    } else {
      switch(actionDone.toDo){
        case Action.Add:
          this.addIndex(actionDone.index,actionDone.music)
          break
        case Action.Remove:
          this.removeIndex(actionDone.index)
          break
        case Action.MoveUp:
          this.upperMoveIndex(actionDone.index)
          break
        case Action.MoveDown:
          this.downMoveIndex(actionDone.index)
          break
      }
      const actionToRedo = this.undoActions.pop()
      if (actionToRedo === null || actionToRedo === undefined){
        alert("No action poped 2")
      } else {
        this.redoActions.push(actionToRedo)
      }
        
    }
  }

  redoAction(){
    const actionDone = this.redoActions.pop()
    if (actionDone === null || actionDone === undefined){
      alert("No action poped")
    } else {
      switch(actionDone.toDo){
        case Action.Add:
          this.addIndex(actionDone.index,actionDone.music)
          break
        case Action.Remove:
          this.removeIndex(actionDone.index)
          break
        case Action.MoveUp:
          this.upperMoveIndex(actionDone.index)
          break
        case Action.MoveDown:
          this.downMoveIndex(actionDone.index)
          break
      }
    }
  }

  saveWork(){
    alert("Receive poke to save locally the work")
  }

  saveFiles(path: string){
    const new_path: string = path.replaceAll("\\","/")
    alert("Receive "+new_path+" to save/copy the files there")
  }

  downloadFiles(name: string){
    alert("Receive the name "+name+" for the zip folder of all musics")
  }

}