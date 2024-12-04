import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, mergeMap, map, Observable, throwError, of, forkJoin, switchMap } from 'rxjs';
import { MusicAttribute } from '../interfaces/music-attributes-given';
import { OrderStatus, Attribute } from '../enumerations/ordering.enum';
import { MusicAccess } from '../models/music-access';
import { CommunicationService } from './communication.service';
import { ComComposition } from '../interfaces/com-composition';
import { PlayAction, PlayStrat } from '../enumerations/play-strat';

@Injectable({
  providedIn: 'root'
})
export class ListMusicsService {

  private _musicList: MusicAccess[] = [];
  private _musicListRetired: MusicAccess[] = [];

  private _order: OrderStatus = 0; 
  private _attributeOrder: Attribute = Attribute.Title;
  private _currentPlayingIndex:number = -1;
  private _playStrat: PlayStrat = PlayStrat.Stop;

  private apiUrl ="http://localhost:8080/audio";

  constructor(@Inject(HttpClient) private http: HttpClient, private communicationService: CommunicationService) {
    this.communicationService.getSignal().subscribe(event=>{
      this.interpretCom(event)
    })
   }

  

  get musicList():MusicAccess[]{
    return this._musicList
  }
  set musicList(list: MusicAccess[]){
    this._musicList = list
    if (this._order != 0){
      this._musicList.sort((a, b) => {
        if (a[this._attributeOrder] > b[this._attributeOrder]) return this._order;
        if (a[this._attributeOrder] < b[this._attributeOrder]) return -this._order;
        return 0;
      })
    }   
    this.updateMusicListIndexes()
  }

  updateMusicListIndexes(){
    this._musicList.map((element,index) => element.index = index)
  }

  get musicListRetired(){
    return this._musicListRetired
  }

  set musicListRetired(list: MusicAccess[]){
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

  changePlayStrat(){
    switch (this._playStrat){
      case PlayStrat.Stop:
        this._playStrat = PlayStrat.Loop
        break
      case PlayStrat.Loop:
        this._playStrat = PlayStrat.Next
        break
      case PlayStrat.Next:
        this._playStrat = PlayStrat.Stop
    }
  }
  
  get playStrat():PlayStrat{
    return this._playStrat
  }

  set volume(value:number) {
    this._musicList.forEach(element => {
      element.volume = value
    })
    this._musicListRetired.forEach(element => {
      element.volume = value
    })
  }

  set currentPlayingIndex(value:number){
    /*
    if (this._currentPlayingIndex >=0 && this._currentPlayingIndex != value) {
      this._musicList[this._currentPlayingIndex].pauseAudio()
    }*/
    if (this._currentPlayingIndex >=0 ) {
      this._musicList.forEach((musicAccess,index)=>{if(value!=index){musicAccess.pauseAudio()}})
      this._musicListRetired.forEach((musicAccess)=>musicAccess.pauseAudio())
    }
    this._currentPlayingIndex = value
  }

  get length(): number {
    return this._musicList.length
  }

  get totLength(): number {
    return this._musicList.length + this._musicListRetired.length
  }

  interpretCom(comComp: ComComposition){
    switch (comComp.action){
      case PlayAction.Play:
        this.currentPlayingIndex = comComp.index
        break
      case PlayAction.Pause:
        ;;
        break
      case PlayAction.Stop:
        ;;
        break
      case PlayAction.End:
        switch (this._playStrat){
          case PlayStrat.Loop:
            this._musicList[comComp.index].playAudio()
            break
          case PlayStrat.Next:
            this._musicList[comComp.index].stopAudio()
            const nextIndex = comComp.index + 1 == this.length ? 0 : comComp.index + 1
            this._musicList[nextIndex].playAudio()
            break
          case PlayStrat.Stop:
            this._musicList[comComp.index].stopAudio()
        }
    }
  }

  searchMusicList(searchText: string) {
    const searchTextSplit = searchText.split(" ")
    this.musicList = this._musicList.concat(this.musicListRetired)
    this.musicListRetired = this.musicList.filter(
      (music) => {
        return !searchTextSplit.reduce(
          (accumulator, word) => {
          return accumulator && 
          ((music.title!=null && music.title.toLowerCase().includes(word.toLocaleLowerCase())) ||
           (music.artist!=null && music.artist.toLowerCase().includes(word.toLocaleLowerCase())))},
          true
        )
      }
    )
    this.musicList = this._musicList.filter(
      (music) => {
        return searchTextSplit.reduce(
          (accumulator, word) =>
            accumulator && 
          ((music.title!=null && music.title.toLowerCase().includes(word.toLocaleLowerCase())) ||
           (music.artist!=null && music.artist.toLowerCase().includes(word.toLocaleLowerCase()))),
          true
        )
      }
    )    
  }

  addMusics(path:string):Observable<number[]>{
    return this.getMusicsAttributesRequest(path).pipe(
      catchError((error) => {
        return throwError(() => new Error("Error retrieving music attributes "+JSON.stringify(error)))
      }),
      switchMap((musics: MusicAttribute[]) => {
        if (musics) {
          console.log(musics.length)
          
          const addingThreshold = 1000 - this.totLength
          if (musics.length > addingThreshold) {
            if (!confirm("Adding the musics found will make the number of musics exceed 1000, should continue or not ?\nIf continue, only the "+addingThreshold+" first musics found will be added.")){
              return throwError (() => new Error("Exception : Not continuiing with more than 1000 musics"))
            }
          }
          const audioRequests:Observable<number>[] = musics.slice(0,Math.min(addingThreshold,musics.length)).map((music) =>
            this.getAudio(music.id).pipe(
              catchError((error) => {
                return throwError(() => new Error("Error retrieving audio blob " + JSON.stringify(error)))
              }),
              map((audioBlob: Blob) => {
                return this.addIndex(-1,new MusicAccess(music, this.communicationService, audioBlob))
              })
            )
          )
          // Transform the Observal<number>[] into the form that permit to have the right type for return
          return forkJoin(audioRequests).pipe(
            map((musicAccessServices: number[]) => {
              return musicAccessServices
            })
          )
        } else {
          return throwError(() => new Error("Error type of received music"));
        }
      })
    )
  }

  private getMusicsAttributesRequest(path:string):Observable<MusicAttribute[]>{
    const params = new HttpParams().set('filePath',path)
    const headers = new HttpHeaders().set('Accept','application/json')
    headers.set('timeout','${2000000}')
    return this.http.get<MusicAttribute[]>(this.apiUrl+"/upload", {params, headers})
  }

  private getAudio(index:number):Observable<Blob>{
    return this.http.get(this.apiUrl+"/"+index,{responseType:'blob'})
  }

  addIndex(index: number, element: MusicAccess): number{
    if (index != -1 && index<this._musicList.length) {
      this.musicList.splice(index,0,element)
      this.updateMusicListIndexes()
      return index
    }
    else {
      
      this.musicList.push(element)
      this.updateMusicListIndexes()
      return this._musicList.length-1
    } 
  }
  removeIndex(index: number): MusicAccess | undefined {
    if (index != -1 && index<this._musicList.length){
      const removed = this.musicList[index]
      this.musicList.splice(index,1)
      removed.index = -1
      this.updateMusicListIndexes()
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
      this._musicList[index].index = index
      this._musicList[index-1].index = index-1
      return true
    }
    else {
      return false
    }
  }
  downMoveIndex(index: number): boolean{
    if(index != -1 && index<this._musicList.length-1){
      [this._musicList[index],this._musicList[index+1]]= [this._musicList[index+1],this._musicList[index]]
      this._musicList[index].index = index
      this._musicList[index+1].index = index+1
      return true
    }
    else {
      return false
    }
  }

  saveWorkSession(){
    sessionStorage.clear()
    console.log("Time to save session")
    this.saveListsToStorage(sessionStorage)
  }

  saveWorkLocaly(){
    localStorage.clear()
    console.log("Time to save")
    this.saveListsToStorage(localStorage)
  }

  getMusicAttributes():MusicAttribute[]{
    const doubleList:number[] = this._musicList.reduce((accumulator:number[],element:MusicAccess,id:number) => {
        for (let i = id+1; i<this.length;i++) {
          if (element.sameFile(this._musicList[i])) {
            accumulator.push(id)
          }
        }
        return accumulator
      }, []
    )
    console.log(doubleList)
    if (doubleList.length>0){
      if(!confirm("Musics with same file name, would you like to continue ?\nIf yes, only the last music(s) with the same file name will be kept.")){
        return []
      }
    }
    const keepList:MusicAccess[] = this._musicList.filter((_element,index)=> {
      return !doubleList.includes(index)
    })   
    return keepList.map((music:MusicAccess):MusicAttribute => music.musicAttribute)
  }

  saveFiles(path: string){
    const musics:MusicAttribute[] = this.getMusicAttributes()
    if (musics.length>0) {      
      this.saveMusicAttribute(path,musics).subscribe(response => {
      },
      error => {
        alert('Error when saving files')
        console.error('Error when saving files:', error)
      })
    }
  }
  private saveMusicAttribute(path:string,musics:MusicAttribute[]): Observable<String>{
    const params = new HttpParams().set('savePath',path)
    const headers = new HttpHeaders().set('Accept','application/json')
    return this.http.post<String>(this.apiUrl+"/save", musics, {params, headers})
  }

  downloadFiles(name: string){
    const musics:MusicAttribute[] = this.getMusicAttributes()
    if (musics.length>0) {
      if (musics.length>1000){
        alert("The functionnality of downloading zip only work for equal or less than 42 musics to not make the backend crash of being out of memory.")
      } 
      else {
        this.downloadZip(name,musics).subscribe(response => {
          const blob = new Blob([response], { type: 'application/zip' });
          const url:string = window.URL.createObjectURL(blob)
          const a:any = document.createElement("a")
          a.style = 'display:none'
          a.href = url
          a.download = name.substring(-4) == ".zip" ? name : name+".zip"
          if (!document.body.contains(a)) {
            document.body.appendChild(a);
          }
          a.click()
          window.URL.revokeObjectURL(url);
        }, error => {
          console.log("Error when downloading zip: "+JSON.stringify(error))
          if (error.status == 507){
            alert("The functionnality of downloading zip only work for less musics (maximum number depends of the musics due to the size) to not make the backend crash by being out of memory.")
          }
          else {            
            alert("Error when downloading zip.")
          }
        })
      }      
    }
  }

  private downloadZip(fileName: string, musics:MusicAttribute[] ): Observable<Blob>{
    const params = new HttpParams().set('nameZip',fileName)
    const headers = new HttpHeaders().set('Accept','application/zip')
    return this.http.post(this.apiUrl+"/download",musics,{ responseType: 'blob' ,params})
  }

  summaryAttributes(musicAccess:MusicAccess):MusicAttribute{
    var musicAttribute:MusicAttribute = musicAccess.musicAttribute
    musicAttribute.accessPath = ""
    return musicAttribute    
  }


  private getMusicAttributeRequest(index:number):Observable<MusicAttribute>{
    return this.http.get<MusicAttribute>(this.apiUrl+"/metadata/"+index)
  }

  saveListsToStorage(storage:Storage):void {    
    const musicList = this._musicList.concat(this._musicListRetired)
    const data = musicList.map((element)=>element.musicAttribute.id).toString()
    storage.setItem("listId",data)
    try {
      musicList.forEach((element) => {
        this.getMusicAttributeRequest(element.musicAttribute.id).subscribe(
          response => {
            if(!element.equalData(response)){
              console.log("Save some for change")
              storage.setItem("element"+element.musicAttribute.id,JSON.stringify(this.summaryAttributes(element)))
            }
          },
          error => {
            return throwError(() => new Error("Error when trying to get musicAttribute in back-end for "+element.musicAttribute.fileName+": "+JSON.stringify(error)))
          }
        )   
      })
    } catch (error){
      alert("Unable to save session locally the modification, maybe too much modifications.")
    }
  
  }

  getIdsListStorage(storage:Storage):number[]{
    const list = storage.getItem("listId")
    return list ? list.split(',').map((element) => parseInt(element)) : []
  }

  getMusicsAttributes(key:string,storage:Storage):MusicAttribute[]{
    const list = storage.getItem(key)
    return list ? [JSON.parse(list)] : []
  }

  initLists():Observable<number[]>{
    return this.restoreLists(localStorage)
  }

  restoreLists(storage:Storage):Observable<number[]>{
    const listIds:number[] = this.getIdsListStorage(storage)
    if (listIds.length>0){
      return of(this.getIdsListStorage(storage)).pipe(
        mergeMap((idList:number[]) =>{
          const observableToFork$ = idList.map((id) =>{
  
          
            const savedInStorage = this.getMusicsAttributes("element"+id,storage)
            if (savedInStorage.length==0){
              return this.getCheckAndAdd(id)
            }
            else {
              return this.checkAndAdd(savedInStorage[0])
            }
          })
          return forkJoin(observableToFork$)
        }) 
      )
    }
    else {
      return of([])
    }
    
  }

  getCheckAndAdd(id:number):Observable<number>{
    return this.getMusicAttributeRequest(id).pipe(
      mergeMap((response) => {
        return this.checkAndAdd(response)
      }),
      catchError((error) => {        
        return throwError(() => new Error("Error when checking "+id+" from zero pipe: "+error+"/"+JSON.stringify(error)))
      })
    )
  }


  checkAndAdd(music:MusicAttribute):Observable<number>{
    return this.checkExist(music).pipe( 
           
      mergeMap((response) => {
        if (response.success){
          return this.getAudio(music.id).pipe(
            catchError((error) => {
              return throwError(() => new Error("Error retrieving audio blob " + error))
            }),
            
            map((audioBlob: Blob) => {
              return this.addIndex(-1,new MusicAccess(music, this.communicationService, audioBlob))
            })
          )
        } else {
          return throwError(() => new Error("Error when checking "+music.fileName+" because of response: "+response))
        }
      }),
      catchError((error) => {        
        return throwError(() => new Error("Error when checking "+music.fileName+" from first pipe: "+error+"/"+JSON.stringify(error)))
      })
    )
  }

  private checkExist(music: MusicAttribute): Observable<any>{
    return this.http.post<String>(this.apiUrl+"/check", music)
  }



}
