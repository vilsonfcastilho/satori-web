"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getYouTubePlayer } from "@/utils/youtube"
import { Film, Plus, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Movie {
  id: string
  title: string
  url: string
}

// Declare YT as a global variable to avoid TypeScript errors
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function MoviePlayer({ isBreakTime = false, onClose }: { isBreakTime?: boolean; onClose?: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentMovieIndex, setCurrentMovieIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newMovieUrl, setNewMovieUrl] = useState("")
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Load movies from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMovies = localStorage.getItem("breakMovies")
      if (savedMovies) {
        setMovies(JSON.parse(savedMovies))
      }
    }
  }, [])

  // Save movies to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("breakMovies", JSON.stringify(movies))
    }
  }, [movies])

  // Initialize YouTube API
  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Define the onYouTubeIframeAPIReady function if not already defined
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer()
      }
    } else if (window.YT && window.YT.Player) {
      // If API is already loaded, initialize player directly
      initializePlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  // Auto-play first movie when break time starts
  useEffect(() => {
    if (isBreakTime && movies.length > 0 && currentMovieIndex === -1) {
      setCurrentMovieIndex(0)
    }
  }, [isBreakTime, movies, currentMovieIndex])

  const initializePlayer = () => {
    // Create a div element for the player if it doesn't exist
    if (!document.getElementById("movie-player") && playerContainerRef.current) {
      const playerDiv = document.createElement("div")
      playerDiv.id = "movie-player"
      playerContainerRef.current.appendChild(playerDiv)

      // Initialize the player
      playerRef.current = getYouTubePlayer("movie-player", {
        height: "180",
        width: "320",
        playerVars: {
          playsinline: 1,
          controls: 1,
          disablekb: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              // Auto-play next movie if available
              if (currentMovieIndex < movies.length - 1) {
                setCurrentMovieIndex(currentMovieIndex + 1)
              } else {
                setIsPlaying(false)
              }
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            }
          },
        },
      })
    }
  }

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Extract video title from URL (simplified version)
  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url)
    return videoId ? `Movie (${videoId.substring(0, 6)}...)` : "Unknown Movie"
  }

  // Add a new movie to the list
  const addMovie = () => {
    if (!newMovieUrl.trim()) return

    let movieId: string | null = null
    movieId = extractVideoId(newMovieUrl)

    if (!movieId) {
      alert("Invalid YouTube URL")
      return
    }

    const title = extractTitle(newMovieUrl)
    const newMovie: Movie = {
      id: movieId,
      title,
      url: newMovieUrl,
    }

    setMovies([...movies, newMovie])
    setNewMovieUrl("")

    // If this is the first movie, select it
    if (movies.length === 0) {
      setCurrentMovieIndex(0)
    }
  }

  // Remove a movie from the list
  const removeMovie = (index: number) => {
    const newMovies = [...movies]
    newMovies.splice(index, 1)
    setMovies(newMovies)

    // Adjust currentMovieIndex if necessary
    if (index === currentMovieIndex) {
      if (isPlaying && playerRef.current) {
        playerRef.current.stopVideo()
        setIsPlaying(false)
      }
      if (newMovies.length > 0) {
        setCurrentMovieIndex(0)
      } else {
        setCurrentMovieIndex(-1)
      }
    } else if (index < currentMovieIndex) {
      setCurrentMovieIndex(currentMovieIndex - 1)
    }
  }

  // Load and play a specific movie
  const loadAndPlayMovie = (index: number) => {
    if (!movies[index] || !playerRef.current) return

    const movie = movies[index]
    const videoId = extractVideoId(movie.url)

    if (videoId) {
      playerRef.current.loadVideoById(videoId)
      setIsPlaying(true)
    }
  }

  // Effect to load and play movie when currentMovieIndex changes
  useEffect(() => {
    if (currentMovieIndex >= 0 && playerRef.current) {
      loadAndPlayMovie(currentMovieIndex)
    }
  }, [currentMovieIndex])

  return (
    <div className="flex flex-col space-y-3 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-primary/80">(break movies)</h2>
        {isBreakTime && onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-primary/50 hover:text-primary/70 hover:bg-primary/10 h-7 px-2"
          >
            Close
          </Button>
        )}
      </div>

      {/* Player container */}
      <div ref={playerContainerRef} className="w-full aspect-video bg-background/50 rounded overflow-hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newMovieUrl}
          onChange={(e) => setNewMovieUrl(e.target.value)}
          placeholder="Paste YouTube movie URL"
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 text-sm"
        />
        <Button
          onClick={addMovie}
          className="bg-primary/10 text-primary/70 hover:bg-primary/20 border-none h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Movie list */}
      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
        {movies.length === 0 ? (
          <p className="text-primary/30 text-xs italic text-center">No movies added</p>
        ) : (
          movies.map((movie, index) => (
            <div
              key={movie.id}
              className={`flex justify-between items-center p-1.5 rounded group ${
                index === currentMovieIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="flex-1 truncate cursor-pointer text-primary/70 hover:text-primary/90 flex items-center gap-1 text-xs"
                onClick={() => {
                  setCurrentMovieIndex(index)
                }}
              >
                <Film className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{movie.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMovie(index)}
                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary/60 hover:bg-transparent h-6 w-6"
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
