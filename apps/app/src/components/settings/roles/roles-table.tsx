import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { roleDescriptions, roleKeys, roleLabels } from "@/lib/auth/roles"

export function RolesTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Role</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roleKeys.map((role) => (
            <TableRow key={role}>
              <TableCell className="align-top font-medium">
                {roleLabels[role]}
              </TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {roleDescriptions[role]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
