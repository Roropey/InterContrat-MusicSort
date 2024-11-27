import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-save-bar',
  templateUrl: './save-bar.component.html',
  styleUrl: './save-bar.component.css'
})
export class SaveBarComponent {

  openPopupSave: boolean = false;
  openPopupDownload: boolean = false;
  pathSave: string = "";
  nameDownload: string = "";

  @Output()
  saveWorkTriggered: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  saveFilesTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  downloadTriggered: EventEmitter<string> = new EventEmitter<string>();


  openClosePopupSave() {
    this.openPopupSave = !this.openPopupSave
  }
  openClosePopupDownload() {
    this.openPopupDownload = !this.openPopupDownload
  }

  saveLocaly(){
    this.saveWorkTriggered.emit()
  }

  saveFiles(){
    if (this.pathSave==""){
      alert("Path given empty")
    } else {
      this.saveFilesTriggered.emit(this.pathSave)
      this.openClosePopupSave()
    }
    
  }
  downloadFiles(){
    if (this.nameDownload==""){
      alert("Name given empty")
    } else {
      this.downloadTriggered.emit(this.nameDownload)
      this.openClosePopupDownload()
    }
    
  }
}
