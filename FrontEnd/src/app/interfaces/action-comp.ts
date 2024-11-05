import { Action } from "../enumerations/action.enum";
import { MusicAttribute } from './music-attribute';

export interface ActionComp {
    toDo: Action;
    music: MusicAttribute;
    index: number;
}
