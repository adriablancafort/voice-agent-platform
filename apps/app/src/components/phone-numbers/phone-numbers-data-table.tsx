import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import type { PhoneNumberListResponse } from "@workspace/shared/api/phone-numbers/types"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PhoneNumberRowActions } from "@/components/phone-numbers/phone-number-row-actions"

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const columns: ColumnDef<PhoneNumberListResponse[number]>[] = [
  {
    accessorKey: "number",
    header: "Number",
    cell: ({ row }) => row.original.number,
  },
  {
    id: "agent",
    header: "Agent",
    cell: ({ row }) => row.original.agent?.name ?? null,
  },
  {
    id: "version",
    header: "Version",
    cell: ({ row }) => {
      if (!row.original.agent) {
        return null
      }

      if (!row.original.agentVersion) {
        return "Latest (draft)"
      }

      return `V${row.original.agentVersion.number}`
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => dateFormatter.format(new Date(row.original.updatedAt)),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PhoneNumberRowActions phoneNumber={row.original} />,
  },
]

export function PhoneNumbersDataTable({
  data,
}: {
  data: PhoneNumberListResponse
}) {
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
    <>
      <Input
        value={(table.getColumn("number")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("number")?.setFilterValue(event.target.value)
        }
        placeholder="Search phone numbers..."
        className="mb-5 max-w-xs"
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === "actions" ? "w-0" : undefined
                    }
                  >
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
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions" ? "w-0" : undefined
                      }
                      onClick={
                        cell.column.id === "actions"
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
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
                  No phone numbers yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
