"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Send, ArrowLeft, History, Loader2 } from "lucide-react"
import { UploadButton } from "@/lib/uploadThingUtils"
import { PageLayout } from "@/components/layouts/page-layout"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  fileUrl?: string
  fileName?: string
  isThinking?: boolean
}

interface Agent {
  id: string
  name: string
  description: string | null
  systemInstruction: string
}

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [agentId, setAgentId] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get URL search params
  const searchParams = useSearchParams()

  // Get the agent ID from params
  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setAgentId(id)

      // Check if there's a conversationId in the URL
      const urlConversationId = searchParams.get('conversationId')
      if (urlConversationId) {
        setConversationId(urlConversationId)
      }
    }
    getParams()
  }, [params, searchParams])

  // Fetch agent details
  useEffect(() => {
    if (!agentId) return

    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}`)
        if (response.ok) {
          const data = await response.json()
          setAgent(data)
        } else {
          console.error('Failed to fetch agent details')
        }
      } catch (error) {
        console.error('Error fetching agent:', error)
      }
    }

    fetchAgent()
  }, [agentId])

  // Load conversation history if conversationId is set
  useEffect(() => {
    if (!conversationId) return

    const fetchConversation = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch(`/api/conversations/${conversationId}`)
        if (response.ok) {
          const data = await response.json()
          // Convert the messages to the right format
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(formattedMessages)
        } else {
          console.error('Failed to fetch conversation history')
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchConversation()
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !agent || !agentId || isLoading || isThinking) return

    console.log("Submit pressed with file:", { fileUrl, fileName });

    // Validate file URL if one is provided
    if (fileName && !fileUrl) {
      toast.error("File name is set but URL is missing. Please try uploading again.");
      return;
    }

    // Check if file URL is valid when a file is attached
    if (fileUrl) {
      console.log(`Validating file URL before sending: ${fileUrl}`);
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        console.log(`File URL check: ${response.status} ${response.statusText}`);
        if (!response.ok) {
          toast.error(`File URL is not accessible: ${response.status} ${response.statusText}`);
          return; // Don't proceed if file URL is invalid
        }
      } catch (error) {
        console.error("Error checking file URL:", error);
        toast.error(`Error checking file URL: ${error instanceof Error ? error.message : String(error)}`);
        return; // Don't proceed if file URL check fails
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined
    }

    console.log("Creating user message with:", {
      content: input,
      fileUrl: userMessage.fileUrl,
      fileName: userMessage.fileName
    });

    // Clear the file attachment immediately after sending
    setFileUrl(null);
    setFileName(null);

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    // Add a temporary "thinking" message
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
      isThinking: true
    }

    setMessages(prev => [...prev, thinkingMessage])

    try {
      // We'll let the server fetch the conversation history if we have a conversationId
      // This is an optimization - we don't need to send the history if the server can fetch it
      const history = conversationId ? [] : messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Log the request we're about to send
      console.log("Sending request to API with:", {
        prompt: input,
        fileUrl,
        fileName,
        conversationId
      });

      // Call the API to generate a response
      const requestBody = {
        prompt: input,
        stream: false,
        history,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        conversationId: conversationId || null
      };

      console.log("Final request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`/api/agents/${agentId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json()

      // Set the conversation ID if it's not already set
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
      }

      // Remove the thinking message and add the real assistant message
      setMessages((prev) => {
        // Filter out the thinking message
        const filteredMessages = prev.filter(msg => !msg.isThinking);

        // Add the real assistant message
        return [...filteredMessages, {
          id: data.id || (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        }];
      })

      setIsThinking(false)

      // Reset file state after successful message
      setFileUrl(null)
      setFileName(null)
    } catch (error) {
      console.error('Error generating response:', error)
      toast.error('Failed to generate a response. Please try again.')
    } finally {
      setIsLoading(false)
      setIsThinking(false)

      // Remove any thinking messages if there was an error
      setMessages((prev) => prev.filter(msg => !msg.isThinking))
    }
  }

  return (
    <PageLayout maxWidth="xl" className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href={`/agents`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{agent?.name || 'Loading agent...'}</h1>
        </div>
        <Link href={`/agents/${agentId}/history`}>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            View History
          </Button>
        </Link>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="flex flex-col h-full p-0">
          <div className="flex-1 p-4 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="mb-2 text-lg font-medium">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="mb-2 text-lg font-medium">Start a conversation</p>
                <p className="text-sm text-muted-foreground">Send a message to begin chatting with this agent</p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[85%] w-auto ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className={`h-8 w-8 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                        <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground">
                          {message.role === "user" ? "U" : "A"}
                        </div>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        } ${message.isThinking ? "animate-pulse" : ""} w-full overflow-hidden break-words`}
                      >
                        {message.role === "assistant" && !message.isThinking ? (
                          <div className="prose prose-sm dark:prose-invert w-full overflow-hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                pre: ({ node, ...props }) => (
                                  <pre className="overflow-x-auto w-full" {...props} />
                                ),
                                code: ({ node, inline, ...props }: { node?: any, inline?: boolean, [key: string]: any }) =>
                                  inline ? (
                                    <code {...props} />
                                  ) : (
                                    <code className="break-words whitespace-pre-wrap max-w-full block overflow-x-auto" {...props} />
                                  ),
                                p: ({ children, ...props }) => (
                                  <p className="break-words" {...props}>{children}</p>
                                ),
                                table: ({ children, ...props }) => (
                                  <div className="overflow-x-auto w-full">
                                    <table {...props}>{children}</table>
                                  </div>
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="break-words">{message.content}</p>
                        )}

                        {message.fileUrl && (
                          <div className="mt-2 mb-2">
                            <div className="relative rounded-md overflow-hidden border border-border">
                              <img
                                src={message.fileUrl}
                                alt={message.fileName || "Attached image"}
                                className="max-w-full max-h-[300px] object-contain"
                              />
                            </div>
                            {message.fileName && (
                              <p className="text-xs mt-1 opacity-70">
                                {message.fileName}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                          {message.isThinking && (
                            <div className="flex items-center mx-2">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              <span className="text-xs">Thinking...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="mb-2">
              {fileName && fileUrl ? (
                <div className="p-2 mb-2 text-sm border rounded-md bg-muted">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Attached: {fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">This image will be sent with your message</p>
                    </div>
                    <Button
                      variant="ghost"
                      disabled={isLoading}
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        console.log("Removing file attachment");
                        setFileUrl(null);
                        setFileName(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="relative rounded-md overflow-hidden border border-border">
                      {fileUrl && (
                        <img
                          src={fileUrl}
                          alt={fileName || "Attached file"}
                          className="max-w-full max-h-[200px] object-contain"
                          onError={(e) => {
                            console.error("Error loading image preview");
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : fileName && !fileUrl ? (
                <div className="p-2 mb-2 text-sm border rounded-md bg-muted">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-yellow-600">Warning: File partially attached</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        File name is set but URL is missing. Please try uploading again.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        setFileUrl(null);
                        setFileName(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading || isThinking ? "Waiting for response..." : "Type your message..."}
                  disabled={isLoading || isThinking}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading && !isThinking) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
              </div>

              {!isLoading && !isThinking && (
                <div className="flex-shrink-0">
                  <UploadButton
                    endpoint="fileUploader"
                    onClientUploadComplete={(res: any) => {
                      console.log("Upload complete response:", JSON.stringify(res, null, 2));

                      if (res && res.length > 0) {
                        // Log the entire response object to see its structure
                        console.log("First file in response:", res[0]);

                        // Check for different property names that might contain the URL
                        const fileUrl = res[0].fileUrl || res[0].url || res[0].fileUrl;
                        const fileName = res[0].name || res[0].fileName;

                        console.log(`File uploaded successfully: ${fileName} (${fileUrl})`);

                        if (!fileUrl) {
                          console.error("File URL is missing in the response");
                          toast.error("File URL is missing in the upload response");
                          return;
                        }

                        // Set state with the file information
                        setFileUrl(fileUrl);
                        setFileName(fileName);

                        // Verify state was updated
                        setTimeout(() => {
                          console.log("State after upload:", { fileUrl: fileUrl, fileName: fileName });
                        }, 100);

                        toast.success(`File "${fileName}" attached successfully`);
                      } else {
                        console.error("Upload response is empty or invalid");
                        toast.error("Upload response is empty or invalid");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      console.error("Upload error:", error);
                      toast.error(`Upload failed: ${error.message}`);
                    }}
                    content={{
                      button({ ready }) {
                        return (
                          <div className="ut-button:flex ut-button:items-center ut-button:justify-center ut-button:gap-1 ut-button:rounded-md ut-button:border ut-button:px-3 ut-button:py-2 ut-button:text-sm ut-button:transition-colors ut-button:bg-background ut-button:hover:bg-accent">
                            {ready ? "Attach File" : "Loading..."}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
              )}

              <Button
                type="submit"
                size="icon"
                disabled={isLoading || isThinking || !input.trim()}
              >
                {isLoading || isThinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
