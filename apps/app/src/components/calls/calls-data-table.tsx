import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { CircleHelpIcon } from "lucide-react"
import { useState } from "react"

import type { CallListResponse } from "@workspace/shared/api/calls/types"
import { Badge } from "@workspace/ui/components/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const secondsFormatter = new Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

function parseCost(value: string | null) {
  return value === null ? null : Number(value)
}

function CostCell({ call }: { call: CallListResponse[number] }) {
  const totalCost = parseCost(call.totalCost)

  if (totalCost === null) {
    return null
  }

  const breakdown = [
    { label: "STT", model: call.sttModel, cost: parseCost(call.sttCost)! },
    { label: "LLM", model: call.llmModel, cost: parseCost(call.llmCost)! },
    { label: "TTS", model: call.ttsModel, cost: parseCost(call.ttsCost)! },
    { label: "Telephony", model: null, cost: parseCost(call.telephonyCost)! },
    { label: "Platform", model: null, cost: parseCost(call.platformCost)! },
  ].filter((item) => item.cost > 0)

  return (
    <HoverCard>
      <HoverCardTrigger className="inline-flex items-center gap-1">
        {usdFormatter.format(totalCost)}
        <CircleHelpIcon className="size-3.5 text-muted-foreground" />
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-2">
        {breakdown.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <div>
              <span className="text-xs">{item.label}</span>
              {item.model ? (
                <div className="truncate text-xs text-muted-foreground">
                  {item.model}
                </div>
              ) : null}
            </div>
            <span className="text-xs">{usdFormatter.format(item.cost)}</span>
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}

const columns: ColumnDef<CallListResponse[number]>[] = [
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ row }) => dateFormatter.format(new Date(row.original.startedAt)),
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) =>
      row.original.durationMs === null
        ? null
        : `${secondsFormatter.format(row.original.durationMs / 1000)}s`,
  },
  {
    id: "cost",
    header: "Cost",
    cell: ({ row }) => <CostCell call={row.original} />,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => (row.original.channel === "web_call" ? "Web" : "Phone"),
  },
  {
    id: "from",
    header: "From",
    cell: ({ row }) => row.original.fromNumber,
  },
  {
    id: "to",
    header: "To",
    cell: ({ row }) => row.original.toNumber,
  },
  {
    id: "agent",
    header: "Agent",
    accessorFn: (row) => row.agent?.name ?? "",
    cell: ({ row }) => row.original.agent?.name,
  },
  {
    id: "version",
    header: "Version",
    cell: ({ row }) =>
      row.original.agentVersion
        ? `V${row.original.agentVersion.number}`
        : "Latest",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.endedAt ? "secondary" : "outline"}>
        {row.original.endedAt ? "completed" : "ongoing"}
      </Badge>
    ),
  },
]

export function CallsDataTable({ data }: { data: CallListResponse }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  })

  return (
    <div>
      <Input
        value={(table.getColumn("agent")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("agent")?.setFilterValue(event.target.value)
        }
        placeholder="Search agents..."
        className="mb-5 max-w-xs"
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
