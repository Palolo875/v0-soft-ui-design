"use client"

import { useState } from "react"
import { SoftUICard } from "@/components/soft-ui-card"
import { Button } from "@/components/ui/button"
import { AnimatedSearch } from "@/components/animated-search"
import { NoteCard } from "@/components/note-card"
import { RichTextEditor } from "@/components/rich-text-editor"
import { GraphVisualization } from "@/components/graph-visualization"
import { ModulesScreen } from "@/components/modules-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { useNotes } from "@/hooks/use-notes"
import { BookOpen, Network, Settings, Sparkles, Plus } from "lucide-react"

export default function BrainBloomHome() {
  const [currentView, setCurrentView] = useState<"home" | "notes" | "editor" | "graph" | "modules" | "settings">("home")
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const { notes, searchQuery, setSearchQuery, createNote, updateNote, getNoteById } = useNotes()

  const currentNote = currentNoteId ? getNoteById(currentNoteId) : null

  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Hero Illustration */}
          <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6 sm:mb-8">
            <img
              src="/hand-drawn-constellation-emanating-from-profile-he.jpg"
              alt="BrainBloom constellation illustration"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif text-foreground font-bold text-balance">
              Welcome to BrainBloom
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-lg mx-auto px-4">
              Your digital garden of ideas. Cultivate thoughts, connect concepts, and watch your knowledge bloom.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center w-full px-4">
            <Button
              onClick={() => setCurrentView("notes")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl font-medium transition-all duration-300 w-full sm:w-auto"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView("notes")}
              className="border-border hover:bg-muted px-8 py-3 rounded-2xl font-medium transition-all duration-300 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>

          <button
            onClick={() => setCurrentView("notes")}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm underline"
          >
            Explore as a guest
          </button>
        </div>
      </div>
    )
  }

  if (currentView === "editor" && currentNote) {
    return (
      <RichTextEditor
        note={currentNote}
        onSave={(title, content) => {
          updateNote(currentNote.id, { title, content })
        }}
        onClose={() => setCurrentView("notes")}
      />
    )
  }

  if (currentView === "graph") {
    return (
      <>
        <GraphVisualization />
        <FloatingOrbMenu currentView={currentView} onViewChange={setCurrentView} />
      </>
    )
  }

  if (currentView === "modules") {
    return (
      <>
        <ModulesScreen onBack={() => setCurrentView("notes")} />
        <FloatingOrbMenu currentView={currentView} onViewChange={setCurrentView} />
      </>
    )
  }

  if (currentView === "settings") {
    return (
      <>
        <SettingsScreen onBack={() => setCurrentView("notes")} />
        <FloatingOrbMenu currentView={currentView} onViewChange={setCurrentView} />
      </>
    )
  }

  if (currentView === "notes") {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-serif text-foreground font-bold">Notes</h1>

              <Button
                onClick={() => {
                  const newNote = createNote("New Note")
                  setCurrentNoteId(newNote.id)
                  setCurrentView("editor")
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </div>

            <AnimatedSearch value={searchQuery} onChange={setSearchQuery} className="w-full sm:max-w-md" />
          </div>

          {/* Notes Grid */}
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20 sm:mb-24">
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => {
                    setCurrentNoteId(note.id)
                    setCurrentView("editor")
                  }}
                  className={`animate-in slide-in-from-bottom-4 fade-in duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6">
                <img
                  src="/gentle-character-watering-a-small-plant-sprout-in-.jpg"
                  alt="Gardener watering sprout"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-muted-foreground text-base sm:text-lg mb-4">Prêt(e) à planter votre première idée ?</p>
              <Button
                onClick={() => {
                  const newNote = createNote("My First Note")
                  setCurrentNoteId(newNote.id)
                  setCurrentView("editor")
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl w-full sm:w-auto"
              >
                Create Your First Note
              </Button>
            </div>
          )}
        </div>

        {/* Floating Orb Menu */}
        <FloatingOrbMenu currentView={currentView} onViewChange={setCurrentView} />
      </div>
    )
  }

  // Fallback for any unhandled views
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif text-foreground mb-4">
          {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
        </h2>
        <p className="text-muted-foreground mb-6">Something went wrong. Let's get you back to your notes.</p>
        <Button onClick={() => setCurrentView("notes")} variant="outline">
          Back to Notes
        </Button>
      </div>
      <FloatingOrbMenu currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}

// Floating Orb Menu Component
function FloatingOrbMenu({
  currentView,
  onViewChange,
}: {
  currentView: string
  onViewChange: (view: "home" | "notes" | "editor" | "graph" | "modules" | "settings") => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleLongPress = () => {
    setIsPressed(true)
    setTimeout(() => {
      setIsPressed(false)
      setIsExpanded(!isExpanded)
    }, 300)
  }

  const menuItems = [
    { icon: BookOpen, label: "Notes", view: "notes" as const, color: "text-accent-peach" },
    { icon: Network, label: "Graph", view: "graph" as const, color: "text-accent-lavender" },
    { icon: Sparkles, label: "Modules", view: "modules" as const, color: "text-accent-honey" },
    { icon: Settings, label: "Settings", view: "settings" as const, color: "text-accent-green" },
  ]

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Menu Items */}
      {isExpanded && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 space-y-2 sm:space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={item.view}
              className="animate-in slide-in-from-bottom-2 fade-in duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SoftUICard
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => {
                  onViewChange(item.view)
                  setIsExpanded(false)
                }}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
              </SoftUICard>
            </div>
          ))}
        </div>
      )}

      {/* Main Orb */}
      <SoftUICard
        pressed={isPressed}
        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer relative animate-pulse"
        onClick={handleLongPress}
      >
        <div className="relative">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-accent-green rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />
          </div>
          {/* Notification dot */}
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent-peach rounded-full animate-pulse" />
        </div>
      </SoftUICard>
    </div>
  )
}
