import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import type { CallListResponse } from "@workspace/shared/api/calls/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { CallsDataTable } from "@/components/calls/calls-data-table"
import { api } from "@/lib/api"

function queryOptions() {
  return {
    queryKey: ["calls"],
    queryFn: () => api.get<CallListResponse>("/calls"),
  }
}

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/calls/"
)({
  component: Page,
})

function Header() {
  return (
    <header className="flex h-18 items-center gap-2 px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Calls</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

function Page() {
  const { data: calls } = useSuspenseQuery(queryOptions())

  return (
    <>
      <title>Calls</title>
      <Header />
      <div className="p-5 pt-0">
        <CallsDataTable data={calls} />
      </div>
    </>
  )
}
