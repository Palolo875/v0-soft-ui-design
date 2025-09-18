"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X, Calendar, Tag, Lightbulb, Focus } from "lucide-react"
import { useNotes } from "@/hooks/use-notes"
import type { Note } from "@/hooks/use-notes"
import { formatDistanceToNow } from "date-fns"
import { AdvancedGraphFilters } from "./advanced-graph-filters"
import { PathFinder } from "./path-finder"

interface GraphNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  note: Note
  radius: number
}

interface GraphLink {
  source: string
  target: string
  strength: number
}

export function GraphVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const [colorMode, setColorMode] = useState<"default" | "tags" | "age" | "connections">("default")
  const [localGraphMode, setLocalGraphMode] = useState(false)
  const [localGraphCenter, setLocalGraphCenter] = useState<string | null>(null)
  const [savedViews, setSavedViews] = useState<Array<{ name: string; filters: any[] }>>([])
  const [suggestedConnections, setSuggestedConnections] = useState<Array<{ note: Note; similarity: number }>>([])

  const { allNotes, getConnectedNotes } = useNotes()

  // Initialize graph data
  useEffect(() => {
    if (allNotes.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create nodes - start compressed at center for "Big Bang" effect
    const initialNodes: GraphNode[] = allNotes.map((note, index) => ({
      id: note.id,
      x: centerX + (Math.random() - 0.5) * 20, // Small initial spread
      y: centerY + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2, // Initial velocity for expansion
      vy: (Math.random() - 0.5) * 2,
      note,
      radius: Math.max(8, Math.min(16, note.title.length / 2)), // Size based on title length
    }))

    // Create links based on note connections
    const initialLinks: GraphLink[] = []
    allNotes.forEach((note) => {
      note.connections.forEach((connectionId) => {
        if (allNotes.find((n) => n.id === connectionId)) {
          initialLinks.push({
            source: note.id,
            target: connectionId,
            strength: 0.5, // Base strength
          })
        }
      })
    })

    setNodes(initialNodes)
    setLinks(initialLinks)

    // Start "Big Bang" animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000) // Stop initial expansion after 2 seconds
  }, [allNotes])

  // Physics simulation
  useEffect(() => {
    if (nodes.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const simulate = () => {
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes]
        const damping = 0.95 // Friction
        const repulsion = 1000 // Repulsion force strength
        const attraction = 0.1 // Link attraction strength

        // Apply forces
        newNodes.forEach((node, i) => {
          let fx = 0
          let fy = 0

          // Repulsion between nodes
          newNodes.forEach((other, j) => {
            if (i === j) return
            const dx = node.x - other.x
            const dy = node.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0) {
              const force = repulsion / (distance * distance)
              fx += (dx / distance) * force
              fy += (dy / distance) * force
            }
          })

          // Attraction from links
          links.forEach((link) => {
            if (link.source === node.id) {
              const target = newNodes.find((n) => n.id === link.target)
              if (target) {
                const dx = target.x - node.x
                const dy = target.y - node.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const idealDistance = 100 // Ideal link length
                const force = (distance - idealDistance) * attraction * link.strength
                fx += (dx / distance) * force
                fy += (dy / distance) * force
              }
            }
          })

          // Center attraction (weak)
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const centerDx = centerX - node.x
          const centerDy = centerY - node.y
          fx += centerDx * 0.001
          fy += centerDy * 0.001

          // Update velocity
          node.vx = (node.vx + fx * 0.01) * damping
          node.vy = (node.vy + fy * 0.01) * damping

          // Update position
          node.x += node.vx
          node.y += node.vy

          // Boundary constraints
          const margin = node.radius + 10
          if (node.x < margin) {
            node.x = margin
            node.vx *= -0.5
          }
          if (node.x > canvas.width - margin) {
            node.x = canvas.width - margin
            node.vx *= -0.5
          }
          if (node.y < margin) {
            node.y = margin
            node.vy *= -0.5
          }
          if (node.y > canvas.height - margin) {
            node.y = canvas.height - margin
            node.vy *= -0.5
          }
        })

        return newNodes
      })

      animationRef.current = requestAnimationFrame(simulate)
    }

    simulate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [nodes.length, links])

  const getNodeColor = (node: GraphNode): string => {
    switch (colorMode) {
      case "tags":
        if (node.note.tags.length > 0) {
          const tagHash = node.note.tags[0].split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0)
            return a & a
          }, 0)
          const colors = ["#f3ab9a", "#b9b2d8", "#faddaf", "#a4bfa0"]
          return colors[Math.abs(tagHash) % colors.length]
        }
        return "#faddaf"

      case "age":
        const daysSinceUpdate = (Date.now() - node.note.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceUpdate < 7) return "#a4bfa0" // Recent - green
        if (daysSinceUpdate < 30) return "#faddaf" // Medium - honey
        if (daysSinceUpdate < 90) return "#f3ab9a" // Old - peach
        return "#b9b2d8" // Very old - lavender

      case "connections":
        const connectionCount = node.note.connections.length
        if (connectionCount > 5) return "#a4bfa0" // Highly connected - green
        if (connectionCount > 2) return "#faddaf" // Medium connected - honey
        if (connectionCount > 0) return "#f3ab9a" // Some connections - peach
        return "#b9b2d8" // Isolated - lavender

      default:
        return "#faddaf" // Default golden honey
    }
  }

  const getNodeSize = (node: GraphNode): number => {
    if (colorMode === "connections") {
      const baseSize = Math.max(8, Math.min(16, node.note.title.length / 2))
      const connectionBonus = Math.min(8, node.note.connections.length * 2)
      return baseSize + connectionBonus
    }
    return node.radius
  }

  const getVisibleNodes = (): GraphNode[] => {
    if (!localGraphMode || !localGraphCenter) return nodes

    const centerNode = nodes.find((n) => n.id === localGraphCenter)
    if (!centerNode) return nodes

    const visibleNodeIds = new Set([localGraphCenter])

    // Add direct connections (1st degree)
    centerNode.note.connections.forEach((id) => visibleNodeIds.add(id))

    // Add connections of connections (2nd degree)
    centerNode.note.connections.forEach((firstDegreeId) => {
      const firstDegreeNode = nodes.find((n) => n.id === firstDegreeId)
      if (firstDegreeNode) {
        firstDegreeNode.note.connections.forEach((id) => visibleNodeIds.add(id))
      }
    })

    return nodes.filter((node) => visibleNodeIds.has(node.id))
  }

  const generateConnectionSuggestions = (note: Note) => {
    // Simulate semantic similarity analysis
    const suggestions = allNotes
      .filter((n) => n.id !== note.id && !note.connections.includes(n.id))
      .map((n) => {
        // Simple similarity based on common words and tags
        const noteWords = note.content.toLowerCase().split(/\s+/)
        const candidateWords = n.content.toLowerCase().split(/\s+/)
        const commonWords = noteWords.filter((word) => candidateWords.includes(word) && word.length > 3)
        const commonTags = note.tags.filter((tag) => n.tags.includes(tag))

        const similarity = commonWords.length * 0.7 + commonTags.length * 1.5
        return { note: n, similarity }
      })
      .filter((s) => s.similarity > 1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)

    setSuggestedConnections(suggestions)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const visibleNodes = getVisibleNodes()
    const clickedNode = visibleNodes.find((node) => {
      const dx = x - node.x
      const dy = y - node.y
      return Math.sqrt(dx * dx + dy * dy) <= getNodeSize(node)
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      setShowSidebar(true)
      generateConnectionSuggestions(clickedNode.note)

      // Double-click for local graph mode
      if (event.detail === 2) {
        setLocalGraphMode(true)
        setLocalGraphCenter(clickedNode.id)
      }
    } else {
      setSelectedNode(null)
      setShowSidebar(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      // Clear canvas with dark background
      ctx.fillStyle = "#1a1625"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const visibleNodes = getVisibleNodes()
      const visibleLinks = links.filter(
        (link) => visibleNodes.some((n) => n.id === link.source) && visibleNodes.some((n) => n.id === link.target),
      )

      // Draw links as nebulae
      ctx.globalAlpha = localGraphMode ? 0.8 : 0.6
      visibleLinks.forEach((link) => {
        const sourceNode = visibleNodes.find((n) => n.id === link.source)
        const targetNode = visibleNodes.find((n) => n.id === link.target)
        if (!sourceNode || !targetNode) return

        const gradient = ctx.createLinearGradient(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y)
        gradient.addColorStop(0, getNodeColor(sourceNode))
        gradient.addColorStop(1, getNodeColor(targetNode))

        ctx.strokeStyle = gradient
        ctx.lineWidth = localGraphMode ? 3 : 2
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.stroke()
      })

      // Draw nodes with dynamic coloring
      ctx.globalAlpha = 1
      visibleNodes.forEach((node) => {
        const time = Date.now() * 0.001
        const pulse = 1 + Math.sin(time + node.id.charCodeAt(0)) * 0.1
        const nodeSize = getNodeSize(node)
        const nodeColor = getNodeColor(node)

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize * 2 * pulse)
        gradient.addColorStop(0, nodeColor)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize * 2 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Core star
        ctx.fillStyle = nodeColor
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Selection highlight
        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = "#a4bfa0"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(node.x, node.y, nodeSize * pulse + 5, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Local graph center highlight
        if (localGraphMode && localGraphCenter === node.id) {
          ctx.strokeStyle = "#f3ab9a"
          ctx.lineWidth = 4
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.arc(node.x, node.y, nodeSize * pulse + 10, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      requestAnimationFrame(render)
    }

    render()
  }, [nodes, links, selectedNode, colorMode, localGraphMode, localGraphCenter])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header with search and filters */}
      <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-serif text-foreground font-bold">Graph</h1>

            {localGraphMode && (
              <Button
                onClick={() => {
                  setLocalGraphMode(false)
                  setLocalGraphCenter(null)
                }}
                variant="outline"
                size="sm"
                className="rounded-full bg-accent-peach/20 border-accent-peach text-accent-peach text-xs sm:text-sm"
              >
                <Focus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Mode Local Actif</span>
                <span className="sm:hidden">Local</span>
              </Button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SoftUICard pressed className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 flex-1 sm:flex-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Recherche..."
                className="border-none bg-transparent focus:ring-0 focus:outline-none w-full sm:w-64 text-sm sm:text-base"
              />
            </SoftUICard>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="rounded-2xl px-3 sm:px-4 py-2"
              size="sm"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Télescope</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <AdvancedGraphFilters
              onFiltersChange={(filters) => console.log("Filters:", filters)}
              onColorModeChange={setColorMode}
              onSaveView={(name, filters) => {
                setSavedViews((prev) => [...prev, { name, filters }])
              }}
              savedViews={savedViews}
              onLoadView={(filters) => console.log("Load view:", filters)}
            />
          </div>
        )}
      </div>

      {/* Graph Canvas */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${showSidebar ? "right-64 sm:right-80" : "right-0"}`}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
          style={{ background: "#1a1625" }}
        />
      </div>

      {/* Enhanced Side Panel */}
      {showSidebar && selectedNode && (
        <div className="absolute top-0 right-0 w-64 sm:w-80 h-full bg-background border-l border-border animate-in slide-in-from-right fade-in duration-500">
          <div className="p-3 sm:p-6 h-full overflow-y-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">Note Details</h2>
              <Button onClick={() => setShowSidebar(false)} variant="ghost" size="sm" className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Note Content */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-2">
                  {selectedNode.note.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{selectedNode.note.excerpt}</p>
              </div>

              {/* Metadata */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Updated {formatDistanceToNow(selectedNode.note.updatedAt, { addSuffix: true })}</span>
                </div>

                {selectedNode.note.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm font-medium text-foreground">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {selectedNode.note.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Path Finder */}
              <PathFinder
                notes={allNotes}
                selectedNote={selectedNode.note}
                onPathFound={(path) => {
                  // Highlight path in graph
                  console.log("Path found:", path)
                }}
              />

              {/* AI Connection Suggestions */}
              {suggestedConnections.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-accent-peach" />
                    Connexions Potentielles
                  </h4>
                  <div className="space-y-2">
                    {suggestedConnections.map((suggestion) => (
                      <SoftUICard
                        key={suggestion.note.id}
                        className="p-2 sm:p-3 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {suggestion.note.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {suggestion.note.excerpt}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full ml-2 bg-transparent text-xs px-2 py-1"
                          >
                            Lier
                          </Button>
                        </div>
                      </SoftUICard>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 sm:pt-4 border-t border-border">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm sm:text-base py-2">
                  Edit Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
