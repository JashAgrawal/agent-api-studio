import { PageLayout } from "@/components/layouts/page-layout"
import { AgentListSkeleton } from "@/components/skeletons/agent-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function AgentsLoading() {
  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      <AgentListSkeleton />
    </PageLayout>
  )
}
