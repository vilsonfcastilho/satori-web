"use client"

import { useState, useEffect } from "react"
import { Check, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type ColorTheme =
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

export default function ThemeSelector() {
  const [theme, setTheme] = useState<ColorTheme>("green")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("colorTheme") as ColorTheme
    if (savedTheme && themeOptions.some((option) => option.value === savedTheme)) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])

  const changeTheme = (newTheme: ColorTheme) => {
    setTheme(newTheme)
    localStorage.setItem("colorTheme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 border border-primary/30 text-primary/30 hover:bg-primary/10 hover:text-primary/70 absolute top-4 right-4 opacity-20 hover:opacity-100 transition-opacity"
        >
          <Palette className="h-4 w-4" />
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
  )
}

