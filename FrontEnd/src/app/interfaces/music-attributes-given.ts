

export interface MusicAttribute {
    id: number;
    accessPath: string;
    fileName: string;
    extension: string;
    title: string;
    artist: string;
    album: string;
    image: Uint8Array;
    yearRelease: number;
    number: number;
    genre: string;
    imageUrl: string;
}
