import { Action } from "../enumerations/action.enum";
import { MusicAccessService } from "../services/music-access.service";

export interface ActionComp {
    toDo: Action;
    musics: MusicAccessService[];
    indexes: number[];
}
