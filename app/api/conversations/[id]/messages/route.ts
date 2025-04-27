import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Add a message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    if (!body.role || !body.content) {
      return NextResponse.json(
        { error: "Role and content are required" },
        { status: 400 }
      )
    }
    
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })
    
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }
    
    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: body.role,
        content: body.content,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })
    
    // Update the conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })
    
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error adding message:", error)
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    )
  }
}

// Get all messages for a conversation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { timestamp: 'asc' },
    })
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
