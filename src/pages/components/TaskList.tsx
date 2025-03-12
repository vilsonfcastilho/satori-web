"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Task {
  id: string
  text: string
  completed: boolean
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem("focusTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("focusTasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTaskText.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    }

    setTasks([...tasks, newTask])
    setNewTaskText("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium text-primary/80 text-center">(tasks)</h2>

      <div className="flex space-x-2">
        <Input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add task..."
          className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-9 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/40"
        />
        <Button onClick={addTask} className="bg-primary/10 text-primary hover:bg-primary/20 border-none h-9 w-9 p-0 cursor-pointer">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-primary/30 text-sm italic text-center">No tasks</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center p-1.5 rounded group ${task.completed ? "bg-primary/5" : ""}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="border-primary/30 data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground mr-2 cursor-pointer"
              />
              <span className={`flex-1 text-sm text-primary ${task.completed ? "line-through text-primary/40" : ""}`}>
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
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
