import { Action } from "../enumerations/action.enum";
import { MusicAccess } from "../models/music-access";

export interface ActionComp {
    toDo: Action;
    musics: MusicAccess[];
    indexes: number[];
}
