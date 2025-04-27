"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string | null
  systemInstruction: string
  temperature: number
  maxTokens: number
  saveHistory: boolean
  apiEnabled: boolean
}

export default function AgentSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [agentId, setAgentId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Agent>({
    id: "",
    name: "",
    description: "",
    systemInstruction: "",
    temperature: 0.7,
    maxTokens: 1000,
    saveHistory: true,
    apiEnabled: true,
  })

  // Get the agent ID from params
  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setAgentId(id)
    }
    getParams()
  }, [params])

  // Fetch agent details
  useEffect(() => {
    if (!agentId) return
    
    const fetchAgent = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/agents/${agentId}`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        } else {
          console.error('Failed to fetch agent details')
        }
      } catch (error) {
        console.error('Error fetching agent:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAgent()
  }, [agentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentId) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update agent')
      }
      
      // Show success message or redirect
      router.push('/agents')
    } catch (error) {
      console.error('Error updating agent:', error)
      // In a real app, you would show an error message to the user
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!agentId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }
      
      // Redirect to agents page
      router.push('/agents')
    } catch (error) {
      console.error('Error deleting agent:', error)
      // In a real app, you would show an error message to the user
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Loading agent settings...</h1>
      </div>
    )
  }

  return (
    <div className="max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agent Settings: {formData.name}</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="w-4 h-4 mr-2" />
              Delete Agent
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the agent and all its conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update basic details about your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Customer Support Assistant"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    placeholder="Describe what this agent does"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="button" onClick={() => setActiveTab("instructions")}>
                  Continue
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>System Instructions</CardTitle>
                <CardDescription>Define how your agent should behave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="systemInstruction">System Instruction</Label>
                  <Textarea
                    id="systemInstruction"
                    name="systemInstruction"
                    value={formData.systemInstruction}
                    onChange={handleChange}
                    placeholder="You are a helpful assistant that..."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This instruction tells the AI how to behave and sets the context for all interactions.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("settings")}>
                  Continue
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Agent Settings</CardTitle>
                <CardDescription>Configure model parameters and API access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[formData.temperature]}
                    onValueChange={(value) => handleSliderChange("temperature", value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values make responses more deterministic, higher values more creative.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxTokens">Max Tokens: {formData.maxTokens}</Label>
                  </div>
                  <Slider
                    id="maxTokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={[formData.maxTokens]}
                    onValueChange={(value) => handleSliderChange("maxTokens", value)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in the response.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="saveHistory"
                    checked={formData.saveHistory}
                    onCheckedChange={(checked) => handleSwitchChange("saveHistory", checked)}
                  />
                  <Label htmlFor="saveHistory">Save conversation history</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apiEnabled"
                    checked={formData.apiEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("apiEnabled", checked)}
                  />
                  <Label htmlFor="apiEnabled">Enable API access</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("instructions")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
