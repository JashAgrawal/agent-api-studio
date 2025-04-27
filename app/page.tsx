import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import UploadButtonExample from "@/ai-helper/example-upload-button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="px-4 py-12">
          <div className="max-w-[80vw] mx-auto space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold tracking-tight">Create and Deploy AI Agents with API Access</h1>
              <p className="text-lg text-muted-foreground">
                Define custom AI agents with specific system instructions, manage conversation history, and expose API
                endpoints for content generation.
              </p>
            </div>
            <div className="flex justify-center">
              <Link href="/agents/new">
                <Button size="lg" className="gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Create New Agent
                </Button>
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Define Agents</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom agents with specific system instructions and configurations.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Conversation History</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage conversation history for each of your agents.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">API Access</h3>
                <p className="text-sm text-muted-foreground">
                  Generate content with your agents through RESTful API endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="flex items-center justify-center h-16 px-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AI Agent Studio</p>
        </div>
      </footer>
    </div>
  )
}
