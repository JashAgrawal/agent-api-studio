import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateGeminiText, streamGeminiText } from "@/lib/gemini"
import { Message } from "@/prisma/prisma/client"

// Get agent details from the database
const getAgentById = async (id: string) => {
  return prisma.agent.findUnique({
    where: { id },
  })
}

// Create or get a conversation
const getOrCreateConversation = async (agentId: string, conversationId?: string) => {
  // If conversationId is provided, try to find it
  if (conversationId) {
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (existingConversation && existingConversation.agentId === agentId) {
      return existingConversation
    }
  }

  // Create a new conversation
  return prisma.conversation.create({
    data: {
      agentId,
    },
  })
}

// Get conversation history from the database
const getConversationHistory = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: 'asc' },
  })

  return messages.map((msg: Message) => ({
    role: msg.role,
    content: msg.content
  }))
}

// Store a message in the database
const storeMessage = async (
  conversationId: string,
  role: string,
  content: string,
  fileUrl?: string,
  fileName?: string
) => {
  try {
    // Create the data object with required fields
    const data:any = {
      conversationId,
      role,
      content,
      fileUrl,
      fileName,
      timestamp: new Date()
    };

    return await prisma.message.create({ data });
  } catch (error) {
    console.error("Error storing message:", error);
    throw error;
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get agent details
    const { id } = await params
    const agent = await getAgentById(id)
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    const { prompt, stream = false, history = [], fileUrl, fileName, conversationId } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Log if a file URL is provided
    if (fileUrl) {
      console.log(`File URL provided: ${fileUrl}`);

      // Validate the file URL
      try {
        const url = new URL(fileUrl);
        if (!url.protocol.startsWith('http')) {
          return NextResponse.json({ error: "Invalid file URL protocol" }, { status: 400 });
        }
      } catch (error) {
        console.error("Invalid file URL:", error);
        return NextResponse.json({ error: "Invalid file URL format" }, { status: 400 });
      }
    }

    // Get or create a conversation if history saving is enabled
    let conversation = null
    if (agent.saveHistory) {
      conversation = await getOrCreateConversation(id, conversationId)

      // Store the user message with file information if provided
      await storeMessage(conversation.id, "user", prompt, fileUrl, fileName)
    }

    // Fetch conversation history from database if conversationId is provided and no history is passed
    let conversationHistory = history
    if (conversationId && history.length === 0 && agent.saveHistory) {
      try {
        conversationHistory = await getConversationHistory(conversationId)
        console.log(`Loaded ${conversationHistory.length} messages from conversation history`)
      } catch (error) {
        console.error("Error fetching conversation history:", error)
        // Continue with empty history if there's an error
        conversationHistory = []
      }
    }

    // Prepare conversation history
    let fullPrompt = prompt
    if (conversationHistory.length > 0) {
      const formattedHistory = conversationHistory
        .map(
          (msg: { role: string; content: string }) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
        )
        .join("\n\n")

      fullPrompt = `${formattedHistory}\n\nUser: ${prompt}`
    }

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            await streamGeminiText({
              system: agent.systemInstruction,
              prompt: fullPrompt,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
              history: conversationHistory,
              fileUrl: fileUrl,
              onChunk: ({ text }) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
              },
            })

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Error streaming content:", error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to generate content" })}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // Handle non-streaming response
    console.log(`Calling generateGeminiText with fileUrl: ${fileUrl || 'none'}`);
    const { text } = await generateGeminiText({
      system: agent.systemInstruction,
      prompt: fullPrompt,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      history: conversationHistory,
      fileUrl: fileUrl,
    })

    // Store the assistant message if history saving is enabled
    if (agent.saveHistory && conversation) {
      await storeMessage(conversation.id, "assistant", text ?? "")
    }

    return NextResponse.json({
      id: `gen_${Date.now()}`,
      object: "generation",
      created: Date.now(),
      model: "gemini-1.5-pro",
      content: text,
      conversationId: conversation?.id || null,
    })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
