"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { OnStateChangeEvent, Player } from "@/types/youtube"
import { PlayerState } from "@/types/youtube"
import { getYouTubePlayer } from "@/utils/youtube"
import { Music, Pause, Play, Plus, SkipBack, SkipForward, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface Track {
  id: string
  title: string
  url: string
}

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [volume, setVolume] = useState(70)
  const playerRef = useRef<Player | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef(volume)
  const currentVideoId = useRef<string | null>(null)

  // Update volume ref when volume state changes
  useEffect(() => {
    volumeRef.current = volume
    if (playerRef.current) {
      playerRef.current.setVolume(volume)
    }
  }, [volume])

  // Load playlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("musicPlaylist")
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
    }
  }, [])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicPlaylist", JSON.stringify(playlist))
    }
  }, [playlist])

  // Load and play a specific track
  const loadAndPlayTrack = useCallback((index: number) => {
    if (!playerRef.current || !playlist[index]) return

    const videoId = extractVideoId(playlist[index].url)
    if (!videoId) return

    playerRef.current.loadVideoById(videoId)
    currentVideoId.current = videoId
    setIsPlaying(true)
  }, [playlist])

  // Play the next track
  const playNextTrack = useCallback(() => {
    if (playlist.length === 0) return

    const newIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }, [playlist.length, currentTrackIndex, loadAndPlayTrack])

  // Play the previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Handle track changes
  useEffect(() => {
    if (currentTrackIndex >= 0 && playlist[currentTrackIndex]) {
      const videoId = extractVideoId(playlist[currentTrackIndex].url)
      if (videoId) {
        loadAndPlayTrack(currentTrackIndex)
      }
    }
  }, [currentTrackIndex, loadAndPlayTrack])

  // Initialize YouTube player
  useEffect(() => {
    // Create a div element for the player
    const playerDiv = document.createElement("div")
    playerDiv.id = "youtube-player"
    playerDiv.style.width = "100%"
    playerDiv.style.height = "100%"

    // Append it to the container
    if (playerContainerRef.current) {
      playerContainerRef.current.appendChild(playerDiv)
    }

    // Load YouTube IFrame API if not already loaded
    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve()
          return
        }

        // Create script element
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"

        // Set up callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          resolve()
        }

        // Add script to page
        document.body.appendChild(tag)
      })
    }

    // Initialize player
    const initPlayer = async () => {
      await loadYouTubeAPI()

      if (!playerContainerRef.current) return

      const player = getYouTubePlayer("youtube-player", {
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          mute: 0,
        },
        events: {
          onReady: () => {
            playerRef.current = player
            player.setVolume(volumeRef.current)
            // If we have a current track, load it
            if (currentTrackIndex >= 0 && playlist[currentTrackIndex]) {
              const videoId = extractVideoId(playlist[currentTrackIndex].url)
              if (videoId) {
                player.loadVideoById(videoId)
                currentVideoId.current = videoId
                setIsPlaying(true)
              }
            }
          },
          onStateChange: (event: OnStateChangeEvent) => {
            // Set volume when video starts playing
            if (event.data === PlayerState.PLAYING) {
              event.target.setVolume(volumeRef.current)
            }
            // Play next track when current one ends
            if (event.data === PlayerState.ENDED) {
              playNextTrack()
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      // Clean up the player div
      if (playerContainerRef.current) {
        const playerDiv = document.getElementById("youtube-player")
        if (playerDiv) {
          playerContainerRef.current.removeChild(playerDiv)
        }
      }
    }
  }, [playNextTrack])

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Extract video title from URL (simplified version)
  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url)
    return videoId ? `YouTube (${videoId.substring(0, 6)}...)` : "Unknown Track"
  }

  // Add a new track to the playlist
  const addTrack = async () => {
    if (!newTrackUrl.trim()) return

    let trackId: string | null = null
    trackId = extractVideoId(newTrackUrl)

    if (!trackId) {
      alert("Invalid YouTube URL")
      return
    }

    const title = extractTitle(newTrackUrl)
    const newTrack: Track = {
      id: trackId,
      title,
      url: newTrackUrl,
    }

    setPlaylist([...playlist, newTrack])
    setNewTrackUrl("")

    // Only start playing if this is the first track and nothing is currently playing
    if (playlist.length === 0 && currentTrackIndex === -1) {
      setCurrentTrackIndex(0)
      loadAndPlayTrack(0)
    }
  }

  // Remove a track from the playlist
  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrackIndex if necessary
    if (index === currentTrackIndex) {
      if (isPlaying) {
        playerRef.current?.stopVideo()
        setIsPlaying(false)
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0)
        loadAndPlayTrack(0)
      } else {
        setCurrentTrackIndex(-1)
      }
    } else if (index < currentTrackIndex) {
      const newIndex = currentTrackIndex - 1
      setCurrentTrackIndex(newIndex)
      // Don't reload the track since we're just adjusting the index
    }
  }

  // Play/pause the current track
  const togglePlay = () => {
    if (!playerRef.current) return;

    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      loadAndPlayTrack(0)
      return
    }

    if (!playlist[currentTrackIndex]) return

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }

    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium text-primary/80 text-center">(music)</h2>

      {/* Player container */}
      <div ref={playerContainerRef} style={{ width: '100%', height: '1px', visibility: 'hidden' }}></div>

      <div className="flex space-x-2">
        <Input
          value={newTrackUrl}
          onChange={(e) => setNewTrackUrl(e.target.value)}
          onKeyDown={addTrack}
          placeholder="Paste YouTube URL"
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/40"
        />
        <Button
          onClick={addTrack}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none h-8 w-8 p-0 cursor-pointer"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Current track info */}
      <div className="text-center py-1">
        <p className="text-sm text-primary/80 truncate">
          {currentTrackIndex >= 0 && playlist[currentTrackIndex]
            ? playlist[currentTrackIndex].title
            : "No track selected"}
        </p>
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="h-1.5 cursor-pointer"
        />
        <p className="text-xs text-primary/50 text-right">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8 cursor-pointer"
          disabled={playlist.length === 0}
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8 cursor-pointer"
          disabled={playlist.length === 0}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button
          onClick={playNextTrack}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-8 h-8 cursor-pointer"
          disabled={playlist.length === 0}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="flex flex-col mt-2 space-y-1 max-h-32 overflow-y-auto">
        {playlist.length === 0 ? (
          <p className="text-primary/30 text-xs italic text-center">No tracks added</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`flex justify-between items-center p-1.5 rounded group ${
                index === currentTrackIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex-1 truncate cursor-pointer text-primary/70 hover:text-primary/90 flex items-center gap-1 text-xs"
                onClick={() => {
                  setCurrentTrackIndex(index)
                  loadAndPlayTrack(index)
                }}
              >
                <Music className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary/60 hover:bg-transparent h-6 w-6 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
