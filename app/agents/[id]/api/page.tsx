"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Play } from "lucide-react"
import { PageLayout } from "@/components/layouts/page-layout"

export default function AgentApiPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("documentation");
  const [agentId, setAgentId] = useState("")
  const [testPrompt, setTestPrompt] = useState("")
  const [testConversationId, setTestConversationId] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agent, setAgent] = useState<{ name: string } | null>(null)

  const apiEndpoint = `/api/agents/${agentId}/generate`

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(apiEndpoint)
    // In a real app, you would show a toast notification
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // In a real app, you would show a toast notification
  }

  const handleTestApi = async () => {
    if (!testPrompt.trim() || !agentId) return

    setIsLoading(true)

    try {
      // Call the API to generate a response
      const response = await fetch(`/api/agents/${agentId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: testPrompt,
          stream: false,
          ...(testConversationId ? { conversationId: testConversationId } : {})
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json()
      setTestResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error testing API:', error)
      setTestResponse(JSON.stringify({ error: 'Failed to generate response' }, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  const curlExample = `curl -X POST ${window.location.origin}${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "How can I reset my password?",
    "stream": false,
    "conversationId": "optional-conversation-id"
  }'`

  const nodeExample = `import fetch from 'node-fetch';

async function generateContent() {
  const response = await fetch('${window.location.origin}${apiEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'How can I reset my password?',
      stream: false,
      conversationId: 'optional-conversation-id'
    })
  });

  const data = await response.json();
  console.log(data);
}

generateContent();`

  const pythonExample = `import requests

response = requests.post(
    '${window.location.origin}${apiEndpoint}',
    headers={
        'Content-Type': 'application/json'
    },
    json={
        'prompt': 'How can I reset my password?',
        'stream': False,
        'conversationId': 'optional-conversation-id'
    }
)

data = response.json()
print(data)`

useEffect(() => {
    params.then((data) => {
      setAgentId(data.id)
    })
  }, [params])

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

  return (
    <PageLayout>
      <h1 className="mb-6 text-2xl font-bold">API Access: {agent?.name || 'Loading agent...'}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
        </TabsList>

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to integrate this agent into your applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">


              <div>
                <h3 className="mb-2 text-lg font-medium">Endpoint</h3>
                <div className="flex items-center gap-2">
                  <p className="p-2 font-mono text-sm bg-muted rounded-md flex-grow">POST {apiEndpoint}</p>
                  <Button variant="outline" size="icon" onClick={handleCopyEndpoint}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Request Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">prompt</h4>
                    <p className="text-sm text-muted-foreground">The input text to generate a response for.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">stream</h4>
                    <p className="text-sm text-muted-foreground">
                      Boolean flag to enable streaming responses. Default: false
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">conversationId</h4>
                    <p className="text-sm text-muted-foreground">
                      Optional ID of an existing conversation. If provided, the system will automatically load the conversation history from the database.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">history</h4>
                    <p className="text-sm text-muted-foreground">
                      Optional array of previous messages for context. Each message should have a role (user/assistant)
                      and content. Not needed if conversationId is provided.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Response Format</h3>
                <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">
                  {JSON.stringify(
                    {
                      id: "gen_123456789",
                      object: "generation",
                      created: 1698765432,
                      model: "gemini-1.5-pro",
                      content: "This is the generated response from the agent.",
                      conversationId: "conv_987654321",
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Examples of how to use the API in different languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">cURL</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyCode(curlExample)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">{curlExample}</pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Node.js</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyCode(nodeExample)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">{nodeExample}</pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Python</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyCode(pythonExample)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">{pythonExample}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test API</CardTitle>
              <CardDescription>Try out the API directly from this interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testPrompt">Prompt</Label>
                <Textarea
                  id="testPrompt"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testConversationId">Conversation ID (Optional)</Label>
                <Input
                  id="testConversationId"
                  value={testConversationId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestConversationId(e.target.value)}
                  placeholder="Enter a conversation ID to use existing history..."
                />
                <p className="text-xs text-muted-foreground">
                  If provided, the system will automatically load the conversation history from the database.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleTestApi} disabled={isLoading} className="gap-2">
                  <Play className="w-4 h-4" />
                  Test API
                </Button>
              </div>

              {testResponse && (
                <div className="space-y-2">
                  <Label>Response</Label>
                  <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">{testResponse}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
