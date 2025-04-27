import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.systemInstruction) {
      return NextResponse.json(
        { error: "Name and system instruction are required" },
        { status: 400 }
      )
    }
    
    // Create the agent in the database
    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        description: body.description,
        systemInstruction: body.systemInstruction,
        temperature: body.temperature || 0.7,
        maxTokens: body.maxTokens || 1000,
        saveHistory: body.saveHistory !== undefined ? body.saveHistory : true,
        apiEnabled: body.apiEnabled !== undefined ? body.apiEnabled : true,
      },
    })
    
    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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
    
    return NextResponse.json(agents)
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    )
  }
}
