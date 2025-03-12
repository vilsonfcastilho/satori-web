// utils/youtube.ts
import type { Player, PlayerOptions } from "@/types/youtube"

export const getYouTubePlayer = (elementId: string, options: PlayerOptions): Player => {
  if (!window.YT || !window.YT.Player) {
    throw new Error('YouTube IFrame API not loaded')
  }
  return new window.YT.Player(elementId, options)
}
