import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgIconsModule } from '@ng-icons/core';
import { heroChevronDownSolid,
   heroChevronUpSolid,
   heroDocumentPlusSolid,
   heroTrashSolid,
   heroArrowUpTraySolid,
   heroArrowDownTraySolid,
   heroArrowUturnLeftSolid,
   heroArrowUturnRightSolid,
   heroArrowDownSolid,
   heroArrowUpSolid,
   heroXMarkSolid,
   heroMinusSolid
  } from '@ng-icons/heroicons/solid';
import { heroInformationCircle } from '@ng-icons/heroicons/outline';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MusicComponent } from './music/music.component';
import { ToolsBarComponent } from './tools-bar/tools-bar.component';
import { SaveBarComponent } from './save-bar/save-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    MusicComponent,
    ToolsBarComponent,
    SaveBarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgIconsModule.withIcons({
      heroChevronDownSolid,
      heroChevronUpSolid,
      heroDocumentPlusSolid,
      heroTrashSolid,
      heroArrowUpTraySolid,
      heroArrowDownTraySolid,
      heroArrowUturnLeftSolid,
      heroArrowUturnRightSolid,
      heroArrowDownSolid,
      heroArrowUpSolid,
      heroXMarkSolid,
      heroMinusSolid,
      heroInformationCircle
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
