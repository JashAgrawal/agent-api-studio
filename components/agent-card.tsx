import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, MessageSquare, Code } from "lucide-react"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    createdAt: string
    conversationCount: number
  }
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{agent.name}</span>
          <Link href={`/agents/${agent.id}/settings`}>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{agent.conversationCount} conversations</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/agents/${agent.id}/chat`}>
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
        </Link>
        <Link href={`/agents/${agent.id}/api`}>
          <Button variant="outline" size="sm" className="gap-1">
            <Code className="w-4 h-4" />
            API
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
