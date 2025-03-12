"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Settings } from "lucide-react"
import { useEffect, useState } from "react"

// Kanji representation of months
const monthKanji = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

// Kanji representation of numbers 1-31 for days
const dayKanji = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "二十一",
  "二十二",
  "二十三",
  "二十四",
  "二十五",
  "二十六",
  "二十七",
  "二十八",
  "二十九",
  "三十",
  "三十一",
]

type ColorTheme =
  | "green"
  | "blue"
  | "purple"
  | "red"
  | "cyan"
  | "amber"
  | "teal"
  | "indigo"
  | "pink"
  | "gray"
  | "slate"
  | "zinc"
  | "neutral"
  | "stone"
  | "rose"
  | "emerald"
  | "sky"
  | "violet"

interface ThemeOption {
  name: string
  value: ColorTheme
  mainColor: string
}

const themeOptions: ThemeOption[] = [
  // Vibrant
  { name: "Green", value: "green", mainColor: "bg-green-500" },
  { name: "Blue", value: "blue", mainColor: "bg-blue-500" },
  { name: "Purple", value: "purple", mainColor: "bg-purple-500" },
  { name: "Red", value: "red", mainColor: "bg-red-500" },
  { name: "Cyan", value: "cyan", mainColor: "bg-cyan-500" },
  { name: "Amber", value: "amber", mainColor: "bg-amber-500" },

  // Muted
  { name: "Teal", value: "teal", mainColor: "bg-teal-500" },
  { name: "Indigo", value: "indigo", mainColor: "bg-indigo-500" },
  { name: "Pink", value: "pink", mainColor: "bg-pink-500" },
  { name: "Emerald", value: "emerald", mainColor: "bg-emerald-500" },
  { name: "Sky", value: "sky", mainColor: "bg-sky-500" },
  { name: "Violet", value: "violet", mainColor: "bg-violet-500" },
  { name: "Rose", value: "rose", mainColor: "bg-rose-500" },

  // Grayscale
  { name: "Gray", value: "gray", mainColor: "bg-gray-500" },
  { name: "Slate", value: "slate", mainColor: "bg-slate-500" },
  { name: "Zinc", value: "zinc", mainColor: "bg-zinc-500" },
  { name: "Neutral", value: "neutral", mainColor: "bg-neutral-500" },
  { name: "Stone", value: "stone", mainColor: "bg-stone-500" },
]

export default function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ColorTheme>("green")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    // Load theme from localStorage
    const savedTheme = localStorage.getItem("colorTheme") as ColorTheme
    if (savedTheme && themeOptions.some((option) => option.value === savedTheme)) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }

    return () => {
      clearInterval(timer)
    }
  }, [])

  // Don't render anything until mounted
  if (!mounted || !time) {
    return null
  }

  const changeTheme = (newTheme: ColorTheme) => {
    setTheme(newTheme)
    localStorage.setItem("colorTheme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    setIsOpen(false)
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  const formatJapaneseDate = (date: Date) => {
    const day = date.getDate() - 1 // Array is 0-indexed
    const month = date.getMonth() // Array is 0-indexed
    const year = date.getFullYear()

    return `${dayKanji[day]}日 ${monthKanji[month]} ${year}年`
  }

  return (
    <div className="relative text-6xl font-bold text-primary bg-transparent p-4 font-mono">
      <div className="absolute top-0 -right-4">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary/20 hover:bg-transparent hover:text-primary/50 w-8 h-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-primary/30 w-[200px] grid grid-cols-3 gap-1 p-2">
            {themeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="flex flex-col items-center justify-center h-8 w-full cursor-pointer p-0 m-0 rounded-md hover:bg-primary/10"
                onClick={() => changeTheme(option.value)}
              >
                <div className={`w-5 h-5 rounded-full ${option.mainColor} flex items-center justify-center`}>
                  {theme === option.value && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center">
        <div>{formatTime(time)}</div>
        <div className="text-lg mt-2 text-primary/60">{formatJapaneseDate(time)}</div>
      </div>
    </div>
  )
}
