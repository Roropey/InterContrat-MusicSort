import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgIconsModule } from '@ng-icons/core';
import { heroChevronDownSolid,
   heroChevronUpSolid,
   heroTrashSolid,
   heroArrowUpTraySolid,
   heroArrowDownTraySolid,
   heroArrowUturnLeftSolid,
   heroArrowUturnRightSolid,
   heroArrowDownSolid,
   heroArrowUpSolid,
   heroXMarkSolid,
   heroMinusSolid,
   heroSpeakerWaveSolid,
   heroSpeakerXMarkSolid,
   heroPlaySolid,
   heroPauseSolid,
   heroStopSolid
  } from '@ng-icons/heroicons/solid';
import { heroInformationCircle, heroDocumentPlus, heroFolderArrowDown } from '@ng-icons/heroicons/outline';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home.component';
import { ToolsBarComponent } from './pages/tools-bar/tools-bar.component';
import { MusicComponent } from './pages/music/music.component';
import { MusicReaderComponent } from './pages/music/music-reader/music-reader.component';
import { SaveBarComponent } from './pages/save-bar/save-bar.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ToolsBarComponent,
    MusicComponent,
    MusicReaderComponent,
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
      heroTrashSolid,
      heroArrowUpTraySolid,
      heroArrowDownTraySolid,
      heroArrowUturnLeftSolid,
      heroArrowUturnRightSolid,
      heroArrowDownSolid,
      heroArrowUpSolid,
      heroXMarkSolid,
      heroMinusSolid,
      heroSpeakerWaveSolid,
      heroSpeakerXMarkSolid,
      heroPlaySolid,
      heroPauseSolid,
      heroStopSolid,
      heroInformationCircle,
      heroDocumentPlus, 
      heroFolderArrowDown
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
