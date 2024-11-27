import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ComComposition } from '../interfaces/com-composition';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private signalSubject = new Subject<ComComposition>();

  sendSignal(data:ComComposition){
    this.signalSubject.next(data)
  }

  getSignal(){
    return this.signalSubject.asObservable()
  }
}
