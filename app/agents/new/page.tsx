"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function NewAgentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemInstruction: "",
    temperature: 0.7,
    maxTokens: 1000,
    saveHistory: true,
    apiEnabled: true,
  })

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

    try {
      // Save the agent to the database
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      // Redirect to the agents page
      router.push("/agents")
    } catch (error) {
      console.error('Error creating agent:', error)
      // In a real app, you would show an error message to the user
    }
  }

  return (
    <div className="max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Create New Agent</h1>

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
                <CardDescription>Provide basic details about your agent</CardDescription>
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
                    value={formData.description}
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
                <Button type="submit">Create Agent</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
