import { Inject } from "@angular/core";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PileService<T> {
  data: T[];
  sizeMax: number;

  constructor(@Inject(Number) size: number) {
    this.data = [];
    this.sizeMax = size;
  }

  length():number{
    return this.data.length
  }

  clone(): PileService<T>{
    const copy: PileService<T> = new PileService<T>(this.sizeMax)
    copy.data = [...this.data]
    return copy
  }

  isEmpty():boolean{
    return this.data.length==0
  }

  makeEmpty(){
    this.data = []
  }

  push(element: T){
    this.data.push(element)
    if (this.data.length > this.sizeMax){
      this.data.shift()
    }
  }

  pull(index: number): T{
    return this.data[index]
  }

  pop(){
    return this.data.pop()
  }

  

}