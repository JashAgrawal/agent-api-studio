import { PageLayout } from "@/components/layouts/page-layout"
import { ChatHistorySkeleton } from "@/components/skeletons/chat-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <PageLayout>
      <div className="mb-4">
        <Skeleton className="h-5 w-24" />
      </div>
      
      <div className="flex items-center mb-6">
        <Skeleton className="h-8 w-64" />
      </div>
      
      <ChatHistorySkeleton />
    </PageLayout>
  )
}
