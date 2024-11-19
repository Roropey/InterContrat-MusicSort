import { Component, OnInit } from '@angular/core';
import { DataService } from "../services/data.service";
import { ListMusicsService } from '../services/list-musics.service';
import { Pile } from '../models/pile';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { Action } from "../enumerations/action.enum";
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { ActionComp } from '../interfaces/action-comp';
import { MusicAccessService } from '../services/music-access.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{


  undoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  redoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  
  currentPlayingIndex:number = -1;
  

  constructor(private dataService: DataService, private musicListService: ListMusicsService) { }

  

  ngOnInit(): void {
    this.dataService.getData().subscribe((data) => {
      this.musicListService.musicList = data
    }, error => {
      console.error('Error when taking data with data service:', error)
    });
  }


  searchMusicList(searchText: string) {
    this.musicListService.searchMusicList(searchText)    
  }

  ordering(wantedOrder: Attribute)
  {
    this.musicListService.attributeOrder = wantedOrder
  }

  modifVolume(value: number){
    this.volume = value;
  }

  set volume(value:number){
    this.musicListService.volume = value
  }

  get musicListLength():number{
    return this.musicListService.length;
  }

  get musicList():MusicAccessService[]{
    return this.musicListService.musicList;
  }

  get order():OrderStatus{
    return this.musicListService.order;
  }

  get attributeOrder():Attribute{
    return this.musicListService.attributeOrder;
  }

  addMusics(path:string){
    const pass:boolean = this.musicListService.addMusics(path)
    console.log(pass)
  }

  addIndex(indexes: number[], elements: MusicAccessService[]){
    const indexReturned:number[] = elements.map(
      (element,index)=>
      this.musicListService.addIndex(indexes[index], element)
    )
    this.undoActions.push(
      {
        toDo: Action.Remove,
        musics: elements,
        indexes: indexReturned
      }
    )
  }
  
  removeIndex(indexes: number[]) {
    var elementsReturned: MusicAccessService[] = []
    var indexesPass: number[] = []
    for (let index of indexes){
      const elementReturned = this.musicListService.removeIndex(index)
      if (elementReturned === null || elementReturned === undefined){
        alert("No element returned for index "+index)
      }
      else {
        indexesPass.push(index)
        elementsReturned.push(elementReturned)
      }

    }
   
    if (elementsReturned.length == 0)
    {
      alert("No element returned for some (or one) indexes")
    }
    else{
      this.undoActions.push(
        {
          toDo: Action.Add,
          musics: elementsReturned,
          indexes: indexesPass
        }
      )
    }
  }

  upperMoveIndex(index: number){
    const approval: boolean = this.musicListService.upperMoveIndex(index)
    if (approval){
      this.undoActions.push(
        {
          toDo: Action.MoveDown,
          musics: [new MusicAccessService(undefined)],
          indexes: [index - 1]
        }
      )
    }
  }
  downMoveIndex(index: number){
    const approval: boolean = this.musicListService.downMoveIndex(index)
    if(approval){
      this.undoActions.push(
        {
          toDo: Action.MoveUp,
          musics: [new MusicAccessService(undefined)],
          indexes: [index + 1]
        }
      )
    }
  }

  playEmit(index:number){
    this.currentPlayingIndex = index
  }

  undoAction(){
    const actionDone = this.undoActions.pop()
    if (actionDone === null || actionDone === undefined){
      alert("No action poped 1")
    } else {
      switch(actionDone.toDo){
        case Action.Add:
          this.addIndex(actionDone.indexes,actionDone.musics)
          break
        case Action.Remove:
          this.removeIndex(actionDone.indexes)
          break
        case Action.MoveUp:
          this.upperMoveIndex(actionDone.indexes[0])
          break
        case Action.MoveDown:
          this.downMoveIndex(actionDone.indexes[0])
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
          this.addIndex(actionDone.indexes,actionDone.musics)
          break
        case Action.Remove:
          this.removeIndex(actionDone.indexes)
          break
        case Action.MoveUp:
          this.upperMoveIndex(actionDone.indexes[0])
          break
        case Action.MoveDown:
          this.downMoveIndex(actionDone.indexes[0])
          break
      }
    }
  }

  saveWork(){
    this.musicListService.saveWork()
  }

  saveFiles(path: string){
    this.musicListService.saveFiles(path)
  }

  downloadFiles(name: string){
    this.musicListService.downloadFiles(name)
  }

}