import { queryOptions } from "@tanstack/react-query"

import { getSession } from "@/lib/auth/client"

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await getSession()
      return data
    },
  })
}
