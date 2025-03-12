"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Film, Pause, Play, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"
import MoviePlayer from "./MoviePlayer"

type TimerMode = "work" | "break"
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom"

interface TimerSettings {
  workTime: number
  breakTime: number
  preset: TimerPreset
  enableMovieBreaks: boolean
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60, // 50 minutes in seconds
  breakTime: 10 * 60, // 10 minutes in seconds
  preset: "50/10",
  enableMovieBreaks: false,
}

export default function PomodoroTimer() {
  // Load settings from localStorage or use defaults
  const loadSettings = (): TimerSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS

    const saved = localStorage.getItem("pomodoroSettings")
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  }

  const [settings, setSettings] = useState<TimerSettings>(loadSettings())
  const [timeLeft, setTimeLeft] = useState(settings.workTime)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customWorkTime, setCustomWorkTime] = useState(50)
  const [customBreakTime, setCustomBreakTime] = useState(10)
  const [showMoviePlayer, setShowMoviePlayer] = useState(false)

  // Load settings on initial render
  useEffect(() => {
    const savedSettings = loadSettings()
    setSettings(savedSettings)
    setTimeLeft(savedSettings.workTime)
    setCustomWorkTime(Math.floor(savedSettings.workTime / 60))
    setCustomBreakTime(Math.floor(savedSettings.breakTime / 60))
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
    }
  }, [settings])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio("/notification.mp3")
        audio.play().catch((err) => console.error("Error playing sound:", err))
      }

      // Switch modes
      if (mode === "work") {
        setMode("break")
        setTimeLeft(settings.breakTime)

        // Show movie player if enabled
        if (settings.enableMovieBreaks) {
          setShowMoviePlayer(true)
        }
      } else {
        setMode("work")
        setTimeLeft(settings.workTime)
        setShowMoviePlayer(false)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, soundEnabled, settings])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(settings.workTime)
    setShowMoviePlayer(false)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime
    return ((total - timeLeft) / total) * 100
  }

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        }
        break
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        }
        break
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        }
        break
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
          enableMovieBreaks: settings.enableMovieBreaks,
        }
        break
      default:
        newSettings = DEFAULT_SETTINGS
    }

    setSettings(newSettings)

    // Reset timer with new settings
    setIsActive(false)
    setMode("work")
    setTimeLeft(newSettings.workTime)
  }

  const toggleMovieBreaks = (enabled: boolean) => {
    setSettings({
      ...settings,
      enableMovieBreaks: enabled,
    })

    if (!enabled && showMoviePlayer) {
      setShowMoviePlayer(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <div className="w-full">
        <div className="relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary/60"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-5xl font-medium text-primary font-mono">{formatTime(timeLeft)}</div>
        <div className="text-xs uppercase tracking-wider mt-1 text-primary/50">
          {mode === "work" ? "focus" : "break"}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 cursor-pointer"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          onClick={toggleSound}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        {settings.enableMovieBreaks && mode === "break" && (
          <Button
            onClick={() => setShowMoviePlayer(!showMoviePlayer)}
            variant="outline"
            size="icon"
            className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 cursor-pointer"
          >
            <Film className="h-4 w-4" />
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-primary/30 text-primary">
            <DialogHeader>
              <DialogTitle className="text-primary/80">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-primary/70">Preset Timers</Label>
                <Select value={settings.preset} onValueChange={(value) => applyPreset(value as TimerPreset)}>
                  <SelectTrigger className="border-primary/30 text-primary/80 bg-background focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-primary/40 data-[state=open]:border-primary/40 cursor-pointer">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary/30 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectItem value="25/5" className="cursor-pointer">25/5 (Pomodoro)</SelectItem>
                    <SelectItem value="50/10" className="cursor-pointer">50/10 (Extended)</SelectItem>
                    <SelectItem value="90/20" className="cursor-pointer">90/20 (Deep Work)</SelectItem>
                    <SelectItem value="custom" className="cursor-pointer">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.preset === "custom" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Work Time: {customWorkTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customWorkTime]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={(value) => setCustomWorkTime(value[0])}
                      className="text-primary cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Break Time: {customBreakTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customBreakTime]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => setCustomBreakTime(value[0])}
                      className="text-primary cursor-pointer"
                    />
                  </div>
                  <Button
                    onClick={() => applyPreset("custom")}
                    className="w-full bg-primary/10 text-primary/80 hover:bg-primary/20 border border-primary/30 cursor-pointer"
                  >
                    Apply Custom Settings
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="movie-breaks" className="text-primary/70">
                  Enable Movie Breaks
                </Label>
                <Switch
                  id="movie-breaks"
                  checked={settings.enableMovieBreaks}
                  onCheckedChange={toggleMovieBreaks}
                  className="data-[state=checked]:bg-primary/70"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showMoviePlayer && mode === "break" && (
        <div className="w-full mt-4">
          <MoviePlayer isBreakTime={true} onClose={() => setShowMoviePlayer(false)} />
        </div>
      )}
    </div>
  )
}

