"use client"

import { useState, useEffect, useRef } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Bold, Italic, Link, Type, Sparkles, Layers, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { AISubmenu } from "./ai-submenu"
import { StructuralSubmenu } from "./structural-submenu"

interface FloatingToolbarProps {
  onFormat: (format: "bold" | "italic" | "link" | "heading") => void
  onColorChange: (color: string) => void
  onAIAction?: (action: string, params?: any) => void
  onStructuralAction?: (action: string, params?: any) => void
}

export function FloatingToolbar({ onFormat, onColorChange, onAIAction, onStructuralAction }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState("")
  const [activeSubmenu, setActiveSubmenu] = useState<"ai" | "structural" | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim() !== "") {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        setSelectedText(selection.toString().trim())

        setPosition({
          top: rect.top - 60,
          left: rect.left + rect.width / 2,
        })
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setActiveSubmenu(null)
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [])

  const toolbarButtons = [
    { icon: Bold, action: "bold" as const, color: "text-accent-peach", delay: 0 },
    { icon: Italic, action: "italic" as const, color: "text-accent-lavender", delay: 30 },
    { icon: Type, action: "heading" as const, color: "text-accent-honey", delay: 60 },
    { icon: Link, action: "link" as const, color: "text-accent-green", delay: 90 },
    { icon: CheckSquare, action: "task" as const, color: "text-accent-peach", delay: 120 },
    { icon: Sparkles, action: "ai" as const, color: "text-accent-lavender", delay: 150 },
    { icon: Layers, action: "structural" as const, color: "text-accent-honey", delay: 180 },
  ]

  const handleButtonClick = (action: string) => {
    if (action === "ai") {
      setActiveSubmenu(activeSubmenu === "ai" ? null : "ai")
    } else if (action === "structural") {
      setActiveSubmenu(activeSubmenu === "structural" ? null : "structural")
    } else if (action === "task") {
      onStructuralAction?.("create-task", { text: selectedText })
    } else {
      onFormat(action as any)
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        <SoftUICard className="flex items-center gap-2 p-2">
          {toolbarButtons.map((button, index) => (
            <div
              key={button.action}
              className="animate-in scale-in-50 fade-in duration-300"
              style={{ animationDelay: `${button.delay}ms` }}
            >
              <button
                onClick={() => handleButtonClick(button.action)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  "hover:scale-110 hover:bg-muted",
                  button.color,
                  activeSubmenu === button.action && "bg-muted scale-110",
                )}
              >
                <button.icon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </SoftUICard>

        {activeSubmenu === "ai" && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <AISubmenu
              selectedText={selectedText}
              onAction={(action, params) => onAIAction?.(action, params)}
              onClose={() => setActiveSubmenu(null)}
            />
          </div>
        )}

        {activeSubmenu === "structural" && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <StructuralSubmenu
              selectedText={selectedText}
              onAction={(action, params) => onStructuralAction?.(action, params)}
              onClose={() => setActiveSubmenu(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
