import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect } from "react"

import type { AgentDetail } from "@workspace/shared/agents/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { InlineEditableField } from "@workspace/ui/components/inline-editable-field"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { PublishAgentForm } from "@/components/agents/publish-agent-form"
import { SaveAgentButton } from "@/components/agents/save-agent-button"
import { TestAgentPanel } from "@/components/agents/test-agent-panel"
import Canvas from "@/components/flow/canvas"
import { FlowSidePanel } from "@/components/flow/sidepanel"
import { api } from "@/lib/api"
import { useAgentStore } from "@/stores/agent"

function queryOptions(agentId: string) {
  return {
    queryKey: ["agents", agentId],
    queryFn: () => api.get<AgentDetail>(`/agents/${agentId}`),
  }
}

export const Route = createFileRoute(
  "/(authorized)/(sidebar)/agents/$agentId/"
)({
  loader: async ({ context, params }) =>
    context.queryClient.ensureQueryData(queryOptions(params.agentId)),
  component: Page,
})

function Header() {
  const name = useAgentStore((state) => state.name)
  const setName = useAgentStore((state) => state.setName)

  return (
    <header className="flex h-18 shrink-0 items-center gap-2 px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <Link to="/agents">
              <BreadcrumbLink>Agents</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <InlineEditableField
                value={name}
                onChange={setName}
                placeholder="Untitled agent"
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex space-x-3">
        <SaveAgentButton />
        <TestAgentPanel />
        <PublishAgentForm />
      </div>
    </header>
  )
}

function Page() {
  const { agentId } = Route.useParams()
  const setAgent = useAgentStore((state) => state.setAgent)
  const { data: agent } = useSuspenseQuery(queryOptions(agentId))

  useEffect(() => {
    setAgent(agent)
  }, [agent, setAgent])

  return (
    <>
      <Header />
      <Canvas />
      <FlowSidePanel />
    </>
  )
}
