import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import type { PhoneNumberListResponse } from "@workspace/shared/api/phone-numbers/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AddPhoneNumberForm } from "@/components/phone-numbers/add-phone-number-form"
import { PhoneNumbersDataTable } from "@/components/phone-numbers/phone-numbers-data-table"
import { TestCallButton } from "@/components/phone-numbers/test-call-button"
import { api } from "@/lib/api"

function queryOptions() {
  return {
    queryKey: ["phone-numbers"],
    queryFn: () => api.get<PhoneNumberListResponse>("/phone-numbers"),
  }
}

export const Route = createFileRoute(
  "/(authorized)/(organization)/(sidebar)/phone-numbers/"
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
            <BreadcrumbPage>Phone numbers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex space-x-3">
        <TestCallButton />
        <AddPhoneNumberForm />
      </div>
    </header>
  )
}

function Page() {
  const { data: phoneNumbers } = useSuspenseQuery(queryOptions())

  return (
    <>
      <title>Phone numbers</title>
      <Header />
      <div className="p-5 pt-0">
        <PhoneNumbersDataTable data={phoneNumbers} />
      </div>
    </>
  )
}
