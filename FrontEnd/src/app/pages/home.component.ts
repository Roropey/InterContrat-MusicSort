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
  musicListService: ListMusicsService = new ListMusicsService();


  undoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  redoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  

  constructor(private dataService: DataService) { }

  set volume(value:number){
    this.musicListService.volume = value
  }
  ngOnInit(): void {
    this.dataService.getData().subscribe((data) => {
      this.musicListService.musicList = data;
    }, error => {
      console.error('Error when taking data with data service:', error);
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

  addIndex(index: number, element: MusicAccessService){
    const indexReturned:number = this.musicListService.addIndex(index, element)
    this.undoActions.push(
      {
        toDo: Action.Remove,
        music: element,
        index: indexReturned
      }
    )
  }
  
  removeIndex(index: number) {
    const elementReturned = this.musicListService.removeIndex(index)
    if (elementReturned === null || elementReturned === undefined){
      alert("No element returned from removing index "+index)
    }
    else{
      this.undoActions.push(
        {
          toDo: Action.Add,
          music: elementReturned,
          index: index
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
          music: new MusicAccessService(undefined),
          index: index - 1
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
          music: new MusicAccessService(undefined),
          index: index + 1
        }
      )
    }
  }

  addMusics(path:string){
    this.musicListService.addMusics(path)
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
    this.musicListService.saveWork()
  }

  saveFiles(path: string){
    this.musicListService.saveFiles(path)
  }

  downloadFiles(name: string){
    this.musicListService.downloadFiles(name)
  }

}