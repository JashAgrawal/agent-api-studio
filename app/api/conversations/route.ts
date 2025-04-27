import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      )
    }
    
    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: body.agentId },
    })
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }
    
    // Create the conversation in the database
    const conversation = await prisma.conversation.create({
      data: {
        agentId: body.agentId,
      },
    })
    
    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}

// Get all conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    
    // If agentId is provided, filter conversations by agent
    const where = agentId ? { agentId } : undefined
    
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            timestamp: 'desc',
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
    
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
