import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AgentCard } from "@/components/agent-card"
import { prisma } from "@/lib/prisma"
import { PageLayout } from "@/components/layouts/page-layout"
import { AgentListSkeleton } from "@/components/skeletons/agent-skeleton"
import { Suspense } from "react"

// Make this a server component to fetch data
async function AgentsList() {
  // Fetch agents from the database
  const agents = await prisma.agent.findMany({
    include: {
      _count: {
        select: {
          conversations: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transform the data to match the expected format
  const formattedAgents = agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || "",
    createdAt: agent.createdAt.toISOString(),
    conversationCount: agent._count.conversations,
  }))

  return (
    <>
      {formattedAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <h3 className="mb-2 text-lg font-medium">No agents created yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">Create your first agent to get started</p>
          <Link href="/agents/new">
            <Button>Create Agent</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {formattedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </>
  )
}

export default function AgentsPage() {
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your Agents</h1>
        <Link href="/agents/new">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Agent
          </Button>
        </Link>
      </div>

      <Suspense fallback={<AgentListSkeleton />}>
        <AgentsList />
      </Suspense>
    </PageLayout>
  )
}