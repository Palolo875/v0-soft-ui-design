"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { SoftUISwitch } from "./soft-ui-switch"
import { Button } from "@/components/ui/button"
import { Target, Calendar, Zap, Brain, Compass, Sparkles, ArrowLeft } from "lucide-react"

interface Module {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  illustration: string
}

interface ModulesScreenProps {
  onBack: () => void
}

export function ModulesScreen({ onBack }: ModulesScreenProps) {
  const [modules, setModules] = useState<Module[]>([
    {
      id: "goals",
      name: "Goals & Objectives",
      description: "Set and track your learning objectives with visual progress indicators",
      icon: Target,
      enabled: false,
      illustration: "compass",
    },
    {
      id: "calendar",
      name: "Calendar Integration",
      description: "Sync your notes with calendar events and create time-based connections",
      icon: Calendar,
      enabled: true,
      illustration: "calendar",
    },
    {
      id: "ai-insights",
      name: "AI Insights",
      description: "Get intelligent suggestions for note connections and content improvements",
      icon: Brain,
      enabled: true,
      illustration: "brain",
    },
    {
      id: "quick-capture",
      name: "Quick Capture",
      description: "Rapidly capture ideas with voice notes and instant text processing",
      icon: Zap,
      enabled: false,
      illustration: "lightning",
    },
    {
      id: "discovery",
      name: "Content Discovery",
      description: "Discover related content and explore new knowledge paths",
      icon: Compass,
      enabled: false,
      illustration: "compass",
    },
    {
      id: "templates",
      name: "Smart Templates",
      description: "Use intelligent templates for different types of notes and projects",
      icon: Sparkles,
      enabled: true,
      illustration: "sparkles",
    },
  ])

  const toggleModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) => (module.id === moduleId ? { ...module, enabled: !module.enabled } : module)),
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-serif text-foreground font-bold mb-2">Modules</h1>
          <p className="text-muted-foreground text-pretty">
            Extend BrainBloom's capabilities with these optional modules. Each module adds new features to enhance your
            note-taking experience.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {modules.map((module, index) => (
            <SoftUICard
              key={module.id}
              className="p-6 space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Module Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center",
                      module.enabled ? "bg-accent-green/20" : "bg-muted",
                    )}
                  >
                    <module.icon
                      className={cn("w-5 h-5", module.enabled ? "text-accent-green" : "text-muted-foreground")}
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">{module.name}</h3>
                  </div>
                </div>

                <SoftUISwitch checked={module.enabled} onChange={() => toggleModule(module.id)} />
              </div>

              {/* Module Description */}
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{module.description}</p>

              {/* Module Illustration Placeholder */}
              <div className="w-full h-24 bg-muted/30 rounded-xl flex items-center justify-center">
                <div className="text-muted-foreground text-xs">{module.illustration} illustration</div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={cn("w-2 h-2 rounded-full", module.enabled ? "bg-accent-green" : "bg-muted-foreground")}
                />
                <span className="text-muted-foreground">{module.enabled ? "Active" : "Inactive"}</span>
              </div>
            </SoftUICard>
          ))}
        </div>

        {/* Module Statistics */}
        <SoftUICard className="p-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Module Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green mb-1">{modules.filter((m) => m.enabled).length}</div>
              <div className="text-sm text-muted-foreground">Active Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-1">
                {modules.filter((m) => !m.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Available Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-honey mb-1">{modules.length}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
          </div>
        </SoftUICard>
      </div>
    </div>
  )
}
