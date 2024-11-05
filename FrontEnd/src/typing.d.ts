declare module 'ryan-music-player' {
    class AudioManager {
      constructor(srcs: string[]);
      play(): void;
      pause(): void;
      stop(): void;
      seek(time: number): void;
      setVolume(volume: number): void;
      on(event: string, handler: () => void): void;
      off(event: string, handler: () => void): void;
      getCurrentTime(): number;
      getDuration(): number;
  
    }
    export default AudioManager;
  }
