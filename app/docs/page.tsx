import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocsPage() {
  return (
    <div className="max-w-[80vw] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">API Documentation</h1>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>Learn how to use the AI Agent Studio API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The AI Agent Studio API allows you to integrate custom AI agents into your applications. Each agent has
                its own unique endpoint that you can call to generate content based on the agent's system instructions
                and configuration.
              </p>

              <h3 className="text-lg font-medium">Base URL</h3>
              <p className="p-2 font-mono text-sm bg-muted rounded-md">
                {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}
              </p>

              <h3 className="text-lg font-medium">Features</h3>
              <ul className="ml-6 list-disc">
                <li>Generate content with custom AI agents</li>
                <li>Stream responses for real-time applications</li>
                <li>Include conversation history for contextual responses</li>
                <li>Configure response parameters like temperature and max tokens</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>How to authenticate your API requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All API requests require authentication using an API key. You can find your API key in the API section
                of each agent's settings.
              </p>

              <h3 className="text-lg font-medium">API Key Authentication</h3>
              <p>Include your API key in the Authorization header of your requests:</p>
              <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">
                {`Authorization: Bearer your_api_key`}
              </pre>

              <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                <h4 className="font-medium text-amber-800">Security Note</h4>
                <p className="text-sm text-amber-700">
                  Keep your API keys secure and never expose them in client-side code. Always make API requests from
                  your server.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available endpoints and their parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">Generate Content</h3>
                <p className="mb-2 font-mono text-sm">POST /api/agents/:id/generate</p>
                <p className="mb-4">Generate content with a specific agent.</p>

                <h4 className="mb-1 font-medium">Path Parameters</h4>
                <ul className="mb-4 ml-6 list-disc">
                  <li>
                    <span className="font-mono">id</span> - The ID of the agent to use
                  </li>
                </ul>

                <h4 className="mb-1 font-medium">Request Body</h4>
                <pre className="p-3 mb-4 overflow-auto font-mono text-sm bg-muted rounded-md">
                  {JSON.stringify(
                    {
                      prompt: "How can I reset my password?",
                      stream: false,
                      history: [
                        { role: "user", content: "Hello" },
                        { role: "assistant", content: "Hi there! How can I help you today?" },
                      ],
                    },
                    null,
                    2,
                  )}
                </pre>

                <h4 className="mb-1 font-medium">Response</h4>
                <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">
                  {JSON.stringify(
                    {
                      id: "gen_123456789",
                      object: "generation",
                      created: 1698765432,
                      model: "gemini-1.5-pro",
                      content:
                        "To reset your password, please follow these steps: 1. Go to the login page. 2. Click on 'Forgot Password'. 3. Enter your email address. 4. Follow the instructions sent to your email.",
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>Common errors and how to handle them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The API uses standard HTTP status codes to indicate the success or failure of requests. Error responses
                include a JSON object with an error message.
              </p>

              <h3 className="text-lg font-medium">HTTP Status Codes</h3>
              <div className="space-y-2">
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">200 - OK</span>
                  <p className="text-sm text-muted-foreground">The request was successful.</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">400 - Bad Request</span>
                  <p className="text-sm text-muted-foreground">
                    The request was invalid or missing required parameters.
                  </p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">401 - Unauthorized</span>
                  <p className="text-sm text-muted-foreground">Authentication failed or API key is missing.</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">404 - Not Found</span>
                  <p className="text-sm text-muted-foreground">The requested resource was not found.</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">429 - Too Many Requests</span>
                  <p className="text-sm text-muted-foreground">Rate limit exceeded.</p>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <span className="font-mono text-sm">500 - Internal Server Error</span>
                  <p className="text-sm text-muted-foreground">An error occurred on the server.</p>
                </div>
              </div>

              <h3 className="text-lg font-medium">Error Response Format</h3>
              <pre className="p-3 overflow-auto font-mono text-sm bg-muted rounded-md">
                {JSON.stringify(
                  {
                    error: "Error message describing what went wrong",
                  },
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
