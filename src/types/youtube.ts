export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface PlayerOptions {
  width?: string | number
  height?: string | number
  videoId?: string
  playerVars?: {
    autoplay?: 0 | 1
    controls?: 0 | 1
    disablekb?: 0 | 1
    fs?: 0 | 1
    modestbranding?: 0 | 1
    playsinline?: 0 | 1
    rel?: 0 | 1
    mute?: 0 | 1
  }
  events?: {
    onReady?: (event: Event) => void
    onStateChange?: (event: OnStateChangeEvent) => void
    onError?: (event: OnErrorEvent) => void
  }
}

export interface Player {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  loadVideoById(videoId: string, startSeconds?: number): void
  setVolume(volume: number): void
  destroy(): void
  getPlayerState(): PlayerState
}

export interface OnStateChangeEvent {
  data: PlayerState
  target: Player
}

export interface OnErrorEvent {
  data: number
  target: Player
}

export interface Event {
  target: Player
  data: PlayerState | number | string | undefined
}

export type PlayerConstructor = new (elementId: string | HTMLElement, options: PlayerOptions) => Player

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: {
      Player: PlayerConstructor
      PlayerState: typeof PlayerState
    }
  }
}
