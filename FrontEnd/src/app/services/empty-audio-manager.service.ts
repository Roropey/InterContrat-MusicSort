import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmptyAudioManagerService {

  constructor() { }
  play(): void{
    alert("Empty manager receive a play call")
  }
  pause(): void{
    alert("Empty manager receive a pause call")
  }
  stop(): void{
    alert("Empty manager receive a stop call")
  }
  seek(time: number): void{    
    alert("Empty manager receive a seek call at "+time)
  }
  setVolume(volume: number): void{    
    alert("Empty manager receive a volume call at "+volume)
  }
  on(event: string, handler: () => void): void {
    alert("Empty manager receive an on call")

  };
  off(event: string, handler: () => void): void{
    alert("Empty manager receive an off call")
    
  };
  getCurrentTime(): number {
    alert("Empty manager receive a get time call")
    return 0
  };
  getDuration(): number {    
    alert("Empty manager receive a get duration call")
    return 0
  }
}
