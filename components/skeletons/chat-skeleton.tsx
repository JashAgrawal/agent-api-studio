import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ChatMessageSkeleton({ align = "left" }: { align?: "left" | "right" }) {
  return (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] ${align === "right" ? "flex-row-reverse" : "flex-row"}`}>
        <Skeleton className={`h-8 w-8 rounded-full ${align === "right" ? "ml-2" : "mr-2"}`} />
        <div
          className={`rounded-lg p-3 ${
            align === "right" ? "bg-primary" : "bg-muted"
          }`}
        >
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <Card className="flex-1 overflow-hidden">
      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <ChatMessageSkeleton align="left" />
          <ChatMessageSkeleton align="right" />
          <ChatMessageSkeleton align="left" />
          <ChatMessageSkeleton align="right" />
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ChatHistorySkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="hover:bg-muted/50 transition-colors">
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="px-6 pb-6">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}
