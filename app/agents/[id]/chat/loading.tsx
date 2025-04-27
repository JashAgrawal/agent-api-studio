import { PageLayout } from "@/components/layouts/page-layout"
import { ChatSkeleton } from "@/components/skeletons/chat-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <PageLayout maxWidth="xl" className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      
      <ChatSkeleton />
    </PageLayout>
  )
}
