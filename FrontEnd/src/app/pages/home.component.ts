import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from "../services/data.service";
import { ListMusicsService } from '../services/list-musics.service';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { Action } from "../enumerations/action.enum";
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { Pile } from '../models/pile';
import { ActionComp } from '../interfaces/action-comp';
import { MusicAccess } from '../models/music-access';
import { CommunicationService } from '../services/communication.service';
import { PlayStrat } from '../enumerations/play-strat';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{


  undoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  redoActions: Pile<ActionComp> = new Pile<ActionComp>(50);  

  constructor(private dataService: DataService, private musicListService: ListMusicsService, private cdr: ChangeDetectorRef, private spinner: NgxSpinnerService
  ) { }

  

  ngOnInit(): void {
    
    /*
    this.dataService.getData().subscribe((data) => {
      this.musicListService.musicList = data.map((element) => new MusicAccess(element))
    }, error => {
      console.error('Error when taking data with data service:', error)
    });*/
       
    this.musicListService.getListFromLocalStorage("keepList").map(music => {
      this.musicListService.checkAndAdd(music).subscribe(response => {
        this.musicList = this.musicList.concat()
      },
      error => {
        console.log("Failed: ",error)
      })
    })
    this.musicListService.getListFromLocalStorage("retiredList").map(music => {
      this.musicListService.checkAndAdd(music).subscribe(response => {},
      error => {
        console.log("Failed: ",error)
      })
    })
    //this.musicListService.initFromLocalStorage()
  }


  searchMusicList(searchText: string) {
    this.musicListService.searchMusicList(searchText)    
  }

  ordering(wantedOrder: Attribute)
  {
    this.musicListService.attributeOrder = wantedOrder
    this.musicList = this.musicList.concat()
  }

  modifVolume(value: number){
    this.volume = value;
  }

  set volume(value:number){
    this.musicListService.volume = value
  }

  get musicListLength():number{
    return this.musicListService.length
  }

  get musicList():MusicAccess[]{
    return this.musicListService.musicList
  }
  set musicList(list:MusicAccess[]){
    this.musicListService.musicList = list
  }

  get playStrat():PlayStrat{
    return this.musicListService.playStrat
  }

  get order():OrderStatus{
    return this.musicListService.order
  }

  get attributeOrder():Attribute{
    return this.musicListService.attributeOrder
  }

  trackByFn(index: number, music: any): number {
    return music.id;  // ou music.id si chaque élément a un identifiant unique
  }

  addMusics(path:string){
    // Subscribe to add into actions after receiving the results
    this.musicListService.addMusics(path).subscribe((indexes) => {
      this.undoActions.push(
        {
          toDo: Action.Remove,
          musics: [new MusicAccess(undefined)],
          indexes: indexes.sort((a,b)=> (a<=b ? 1 : -1))
        }
      )
      this.musicList = this.musicList.concat()
    },
    error => {
      alert("Received error: "+error)
    })
  }

  addIndex(indexes: number[], elements: MusicAccess[]){
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
    this.cdr.detectChanges()
  }
  
  removeIndex(indexes: number[]) {
    var elementsReturned: MusicAccess[] = []
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
    this.musicList = this.musicList.concat()
  }

  upperMoveIndex(index: number){
    const approval: boolean = this.musicListService.upperMoveIndex(index)
    if (approval){
      this.undoActions.push(
        {
          toDo: Action.MoveDown,
          musics: [new MusicAccess(undefined)],
          indexes: [index - 1]
        }
      )
    }
    this.musicList = this.musicList.concat()
  }
  downMoveIndex(index: number){
    const approval: boolean = this.musicListService.downMoveIndex(index)
    if(approval){
      this.undoActions.push(
        {
          toDo: Action.MoveUp,
          musics: [new MusicAccess(undefined)],
          indexes: [index + 1]
        }
      )
    }
    this.musicList = this.musicList.concat()
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

  changePlayState(){
    this.musicListService.changePlayStrat()
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