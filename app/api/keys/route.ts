import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Generate a random API key
function generateApiKey() {
  return `sk_${crypto.randomBytes(24).toString("hex")}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, expiresAt } = body
    
    // Generate a new API key
    const key = generateApiKey()
    
    // Create the API key in the database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    
    // Return the API key (this is the only time the full key will be shown)
    return NextResponse.json({
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Fetch all API keys (without exposing the actual key values)
    const apiKeys = await prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}
