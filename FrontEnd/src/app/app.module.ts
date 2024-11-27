import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

import { bootstrapTextWrap, bootstrapIndent, bootstrapRepeat } from '@ng-icons/bootstrap-icons';
import { PopoverModule } from '@ngx-popovers/popover';
import { PopoverConfigProvider } from './config/popover.config';
import { NgxTooltip } from '@ngx-popovers/tooltip';

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
    BrowserAnimationsModule,
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
      heroFolderArrowDown,
      bootstrapTextWrap,
      bootstrapIndent,
      bootstrapRepeat
    }),
    PopoverModule,
    NgxTooltip
  ],
  providers: [PopoverConfigProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
