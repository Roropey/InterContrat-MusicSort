import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from "@angular/cdk/scrolling";

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
import { LoadingIndicatorComponent } from './pages/loading-indicator/loading-indicator.component';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { LoadingService } from './services/loading-service.service';
import { RouterModule } from '@angular/router';

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
    NoopAnimationsModule,
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
    NgxTooltip,
    ScrollingModule,
    LoadingIndicatorComponent
  ],
  providers: [PopoverConfigProvider,
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      RouterModule,
      LoadingService
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
