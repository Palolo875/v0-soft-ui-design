"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SoftUICard } from "./soft-ui-card"
import { FloatingToolbar } from "./floating-toolbar"
import { LinkSearchPopup } from "./link-search-popup"
import { Input } from "@/components/ui/input"
import type { Note } from "@/hooks/use-notes"

interface RichTextEditorProps {
  note: Note
  onSave: (title: string, content: string) => void
  onClose: () => void
  onCreateNote?: (title: string, content: string) => Note
}

export function RichTextEditor({ note, onSave, onClose, onCreateNote }: RichTextEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkPopupPosition, setLinkPopupPosition] = useState({ top: 0, left: 0 })
  const [linkSearchQuery, setLinkSearchQuery] = useState("")
  const [currentLinkRange, setCurrentLinkRange] = useState<Range | null>(null)
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        setIsAutoSaving(true)
        onSave(title, content)
        setTimeout(() => setIsAutoSaving(false), 1000)
      }
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [title, content, note.title, note.content, onSave])

  useEffect(() => {
    const handleSelectionChange = () => {
      console.log("[v0] Selection change detected")
      const selection = window.getSelection()

      if (!selection || selection.toString().trim() === "") {
        console.log("[v0] No selection or empty selection")
        setShowFloatingToolbar(false)
        return
      }

      console.log("[v0] Selected text:", selection.toString())

      // Check if selection is within our editor
      if (!contentRef.current?.contains(selection.anchorNode)) {
        console.log("[v0] Selection not in editor")
        setShowFloatingToolbar(false)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      console.log("[v0] Selection rect:", rect)

      const isMobile = window.innerWidth < 640
      const toolbarWidth = isMobile ? Math.min(300, window.innerWidth - 20) : 300
      const toolbarHeight = isMobile ? 80 : 60

      let top = rect.top - toolbarHeight - 10
      let left = rect.left + rect.width / 2 - toolbarWidth / 2

      // Ensure toolbar stays within viewport with mobile considerations
      if (top < 10) top = rect.bottom + 10
      if (left < 10) left = 10
      if (left + toolbarWidth > window.innerWidth - 10) {
        left = window.innerWidth - toolbarWidth - 10
      }

      // On mobile, position toolbar at bottom of screen if selection is in upper half
      if (isMobile && rect.top < window.innerHeight / 2) {
        top = window.innerHeight - toolbarHeight - 20
        left = 10
      }

      console.log("[v0] Toolbar position:", { top, left })

      setToolbarPosition({ top, left })
      setShowFloatingToolbar(true)
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    document.addEventListener("mouseup", handleSelectionChange)
    document.addEventListener("touchend", handleSelectionChange)

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
      document.removeEventListener("mouseup", handleSelectionChange)
      document.removeEventListener("touchend", handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    const handleInput = () => {
      if (!contentRef.current) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const textContent = contentRef.current.textContent || ""
      const cursorPosition = range.startOffset

      // Check if we just typed [[
      const beforeCursor = textContent.slice(Math.max(0, cursorPosition - 2), cursorPosition)
      if (beforeCursor === "[[") {
        const rect = range.getBoundingClientRect()
        setLinkPopupPosition({
          top: rect.bottom + 10,
          left: rect.left,
        })
        setCurrentLinkRange(range.cloneRange())
        setShowLinkPopup(true)
        setLinkSearchQuery("")
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("input", handleInput)
      return () => contentElement.removeEventListener("input", handleInput)
    }
  }, [])

  const handleFormat = (format: "bold" | "italic" | "link" | "heading") => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const selectedText = selection.toString()
    let formattedText = selectedText

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "heading":
        formattedText = `## ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}]()`
        break
    }

    // Replace selected text with formatted version
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(formattedText))

    setTimeout(() => {
      if (contentRef.current) {
        setContent(contentRef.current.textContent || "")
      }
    }, 0)

    setShowFloatingToolbar(false)
  }

  const handleSelectNote = (selectedNote: Note) => {
    if (!currentLinkRange || !contentRef.current) return

    // Replace [[ with the link
    const linkText = `[[${selectedNote.title}]]`

    // Find and replace the [[ part
    const textContent = contentRef.current.textContent || ""
    const linkStartIndex = textContent.lastIndexOf("[[")

    if (linkStartIndex !== -1) {
      const beforeLink = textContent.slice(0, linkStartIndex)
      const afterLink = textContent.slice(linkStartIndex + 2)
      const newContent = beforeLink + linkText + afterLink

      setContent(newContent)
      if (contentRef.current) {
        contentRef.current.textContent = newContent
      }
    }

    setShowLinkPopup(false)
    setCurrentLinkRange(null)
    setLinkSearchQuery("")
  }

  const handleColorChange = (color: string) => {
    console.log("Color change:", color)
  }

  const handleAIAction = async (action: string, params?: any) => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const selectedText = selection.toString()
    let processedText = selectedText

    // Simulate AI processing with realistic responses
    switch (action) {
      case "improve":
        processedText = `${selectedText.charAt(0).toUpperCase()}${selectedText.slice(1).replace(/\s+/g, " ").trim()}.`
        break
      case "summarize":
        processedText = `Résumé: ${selectedText.split(" ").slice(0, 10).join(" ")}...`
        break
      case "translate":
        processedText = `[EN] ${selectedText}` // Simplified translation
        break
      case "tone":
        processedText = `${selectedText.replace(/\./g, ", ce qui est important à noter.")}`
        break
      case "extract-tasks":
        // Extract potential tasks from text
        const tasks = selectedText.match(/(?:je dois|il faut|à faire|rappeler|appeler|envoyer|écrire)/gi)
        if (tasks) {
          processedText = `${selectedText}\n\n**Tâches identifiées:**\n- [ ] ${selectedText.split(".")[0]}`
        }
        break
    }

    // Replace selected text with processed version
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(processedText))

    setTimeout(() => {
      if (contentRef.current) {
        setContent(contentRef.current.textContent || "")
      }
    }, 0)

    setShowFloatingToolbar(false)
  }

  const handleStructuralAction = (action: string, params?: any) => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const selectedText = selection.toString()

    switch (action) {
      case "extract-note":
        // Create new note with selected content
        if (onCreateNote) {
          const newNote = onCreateNote(`Extracted: ${selectedText.slice(0, 30)}...`, selectedText)

          // Replace selected text with link to new note
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(document.createTextNode(`[[${newNote.title}]]`))

          setTimeout(() => {
            if (contentRef.current) {
              setContent(contentRef.current.textContent || "")
            }
          }, 0)
        }
        break

      case "embed-note":
        // This would open a note selector popup in a real implementation
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(`{{embed: Select a note to embed}}`))

        setTimeout(() => {
          if (contentRef.current) {
            setContent(contentRef.current.textContent || "")
          }
        }, 0)
        break

      case "create-task":
        const taskRange = selection.getRangeAt(0)
        taskRange.deleteContents()
        taskRange.insertNode(document.createTextNode(`- [ ] ${selectedText}`))

        setTimeout(() => {
          if (contentRef.current) {
            setContent(contentRef.current.textContent || "")
          }
        }, 0)
        break

      case "add-deadline":
        const deadlineRange = selection.getRangeAt(0)
        deadlineRange.deleteContents()
        const today = new Date().toISOString().split("T")[0]
        deadlineRange.insertNode(document.createTextNode(`- [ ] ${selectedText} 📅 ${today}`))

        setTimeout(() => {
          if (contentRef.current) {
            setContent(contentRef.current.textContent || "")
          }
        }, 0)
        break

      case "assign-task":
        const assignRange = selection.getRangeAt(0)
        assignRange.deleteContents()
        assignRange.insertNode(document.createTextNode(`- [ ] ${selectedText} @assignee`))

        setTimeout(() => {
          if (contentRef.current) {
            setContent(contentRef.current.textContent || "")
          }
        }, 0)
        break
    }

    setShowFloatingToolbar(false)
  }

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ""
    setContent(newContent)
  }

  // Focus title on mount for new notes
  useEffect(() => {
    if (note.title === "New Note" && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [note.title])

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== content) {
      contentRef.current.textContent = content
    }
  }, [content])

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            ← Back to Notes
          </button>

          {/* Title Input */}
          <SoftUICard pressed className="p-3 sm:p-4 mb-4 sm:mb-6">
            <Input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="border-none bg-transparent focus:ring-0 focus:outline-none text-xl sm:text-2xl font-serif font-bold placeholder:text-muted-foreground"
            />
          </SoftUICard>
        </div>

        {/* Content Editor */}
        <SoftUICard pressed className="p-4 sm:p-8 min-h-80 sm:min-h-96">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentInput}
            className="min-h-64 sm:min-h-80 focus:outline-none text-foreground leading-relaxed text-base sm:text-lg"
            style={{ whiteSpace: "pre-wrap" }}
            data-placeholder="Start writing your thoughts..."
          />
        </SoftUICard>

        {showFloatingToolbar && (
          <div
            style={{
              position: "fixed",
              top: toolbarPosition.top,
              left: toolbarPosition.left,
              zIndex: 9999,
              pointerEvents: "auto",
              width: window.innerWidth < 640 ? `${Math.min(300, window.innerWidth - 20)}px` : "auto",
            }}
            className="animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <FloatingToolbar
              onFormat={handleFormat}
              onColorChange={handleColorChange}
              onAIAction={handleAIAction}
              onStructuralAction={handleStructuralAction}
            />
          </div>
        )}

        {/* Link Search Popup */}
        <LinkSearchPopup
          isVisible={showLinkPopup}
          position={linkPopupPosition}
          onSelectNote={handleSelectNote}
          onClose={() => {
            setShowLinkPopup(false)
            setCurrentLinkRange(null)
            setLinkSearchQuery("")
          }}
          searchQuery={linkSearchQuery}
          onSearchChange={setLinkSearchQuery}
        />

        {isAutoSaving && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-soft-shadow text-foreground px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs shadow-soft-inset">
            💾 Saving...
          </div>
        )}
      </div>
    </div>
  )
}
