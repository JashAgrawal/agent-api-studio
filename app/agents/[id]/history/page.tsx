import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { PageLayout } from "@/components/layouts/page-layout"
import { Suspense } from "react"
import { ChatHistorySkeleton } from "@/components/skeletons/chat-skeleton"

// Format date for display
function formatDate(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true })
}

// Get the first message content for preview
function getPreviewText(content: string) {
  return content.length > 100 ? content.substring(0, 100) + "..." : content
}

async function ConversationHistory({ agentId }: { agentId: string }) {
  // Fetch agent details
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  })

  if (!agent) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Agent not found</h1>
        <Link href="/agents">
          <Button>Back to Agents</Button>
        </Link>
      </div>
    )
  }

  // Fetch conversations for this agent
  const conversations = await prisma.conversation.findMany({
    where: { agentId },
    include: {
      messages: {
        take: 1,
        orderBy: {
          timestamp: 'asc',
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">{agent.name} - Conversation History</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-medium mb-2">No conversations yet</h2>
          <p className="text-muted-foreground mb-4">Start chatting with this agent to create conversation history</p>
          <Link href={`/agents/${agentId}/chat`}>
            <Button>Start a Conversation</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/agents/${agentId}/chat?conversationId=${conversation.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">
                      Conversation {formatDate(conversation.createdAt)}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{conversation._count.messages} messages</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {conversation.messages.length > 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {getPreviewText(conversation.messages[0].content)}
                      </p>
                      {/* @ts-ignore - We know fileUrl exists in the database but TypeScript doesn't know yet */}
                      {conversation.messages[0].fileUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md overflow-hidden border border-border">
                            <img
                              /* @ts-ignore - We know fileUrl exists in the database */
                              src={conversation.messages[0].fileUrl}
                              /* @ts-ignore - We know fileName exists in the database */
                              alt={conversation.messages[0].fileName || "Attached image"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {/* @ts-ignore - We know fileName exists in the database */}
                            {conversation.messages[0].fileName || "Image attached"}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Empty conversation</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default function AgentHistoryPage({ params }: { params: { id: string } }) {
  return (
    <PageLayout>
      <div className="mb-4">
        <Link href={`/agents/${params.id}/chat`} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Chat
        </Link>
      </div>

      <Suspense fallback={<ChatHistorySkeleton />}>
        <ConversationHistory agentId={params.id} />
      </Suspense>
    </PageLayout>
  )
}
