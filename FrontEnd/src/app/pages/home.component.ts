import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ListMusicsService } from '../services/list-musics.service';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { Action } from "../enumerations/action.enum";
import { Pile } from '../models/pile';
import { ActionComp } from '../interfaces/action-comp';
import { MusicAccess } from '../models/music-access';
import { PlayStrat } from '../enumerations/play-strat';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    standalone: false
})
export class HomeComponent implements OnInit{


  private _undoActions: Pile<ActionComp> = new Pile<ActionComp>(50);
  private _redoActions: Pile<ActionComp> = new Pile<ActionComp>(50);  

  adding: boolean = false;
//private dataService: DataService,
  constructor(private musicListService: ListMusicsService) { }

  

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

  set undoActions(pile:Pile<ActionComp>){
    this._undoActions = pile
  }

  get undoActions():Pile<ActionComp>{
    this.musicList = this.musicList.concat()
    return this._undoActions
  }

  set redoActions(pile:Pile<ActionComp>){
    this._redoActions = pile
  }

  get redoActions():Pile<ActionComp>{
    this.musicList = this.musicList.concat()
    return this._redoActions
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
    if (this.musicListService.totLength>=1000){
      alert("Limit of 1000 musics already reached, no more musics addable.")
    }
    else {
      if (this.adding){
        alert("The processus of adding musics is already in progress.\nPlease wait the end before retrying.")
      }
      else {
        
        this.adding = true
        // Subscribe to add into actions after receiving the results
        this.musicListService.addMusics(path).subscribe((indexes) => {
          this.undoActions.push(
            {
              toDo: Action.Remove,
              musics: [new MusicAccess(undefined)],
              indexes: indexes.sort((a,b)=> (a<=b ? 1 : -1))
            }
          )
          this.adding = false
        },
        error => {
          if (error.substring(0,"Exception".length)!="Exception"){
            alert("Received error: "+error)
          }
          this.adding = false
        })
      }
    }
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
    if (this.adding) {
      alert("The processus of adding musics is in progress.\nPlease wait the end before saving your session.")
    } 
    else {      
      this.musicListService.saveWork()
    }
  }

  saveFiles(path: string){    
    if (this.adding) {
      alert("The processus of adding musics is in progress.\nPlease wait the end before saving the selected musics.")
    } 
    else {
      this.musicListService.saveFiles(path)
    }
  }

  downloadFiles(name: string){
    if (this.adding) {
      alert("The processus of adding musics is in progress.\nPlease wait the end before downloading the zip file.")
    }
    else {
      this.musicListService.downloadFiles(name)
    }
  }

}