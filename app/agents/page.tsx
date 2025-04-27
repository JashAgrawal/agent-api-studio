"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import { AgentCard } from "@/components/agent-card"
import { PageLayout } from "@/components/layouts/page-layout"
import { AgentListSkeleton } from "@/components/skeletons/agent-skeleton"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

// Define the agent type
interface Agent {
  id: string
  name: string
  description: string
  createdAt: string
  conversationCount: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to fetch agents
  const fetchAgents = async () => {
    try {
      // Add timestamp to URL to bust cache
      const timestamp = new Date().getTime()
      const url = `/api/agents?t=${timestamp}`

      // Use cache: 'no-store' to prevent caching
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch agents')
      }

      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Get search params to check for refresh parameter
  const searchParams = useSearchParams()

  // Fetch agents on component mount or when refresh parameter changes
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true'

    // If coming from a redirect with refresh=true, show a success message
    if (shouldRefresh) {
      // Check if we're coming from the new agent page or settings page
      const referrer = document.referrer
      if (referrer.includes('/new')) {
        toast.success('Agent created successfully')
      } else if (referrer.includes('/settings')) {
        toast.success('Agent updated successfully')
      } else {
        toast.success('Agents list refreshed')
      }
    }

    fetchAgents()
  }, [searchParams])

  // Function to handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAgents()
  }

  // Render the agents list
  const renderAgentsList = () => {
    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <h3 className="mb-2 text-lg font-medium">No agents created yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">Create your first agent to get started</p>
          <Link href="/agents/new">
            <Button>Create Agent</Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onRefresh={handleRefresh}
          />
        ))}
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Your Agents</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-8 w-8"
            title="Refresh agents list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Link href="/agents/new">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Agent
          </Button>
        </Link>
      </div>

      {isLoading ? <AgentListSkeleton /> : renderAgentsList()}
    </PageLayout>
  )
}