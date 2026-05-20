import { XIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type SidePanelProps = React.ComponentProps<"aside"> & {
  open: boolean
  onOpenChange?: (open: boolean) => void
  showCloseButton?: boolean
}

function SidePanel({
  className,
  children,
  open,
  onOpenChange,
  showCloseButton = true,
  ...props
}: SidePanelProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <aside
        data-slot="side-panel"
        data-state={open ? "open" : "closed"}
        aria-hidden={!open}
        className={cn(
          "pointer-events-auto fixed top-18 right-3 bottom-3 flex w-95 max-w-full flex-col rounded-lg border bg-popover text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[state=closed]:pointer-events-none data-[state=closed]:translate-x-10 data-[state=closed]:opacity-0 data-[state=open]:translate-x-0 data-[state=open]:opacity-100",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-3.5 right-3.5"
            onClick={() => onOpenChange?.(false)}
          >
            <XIcon />
            <span className="sr-only">Close side panel</span>
          </Button>
        )}
      </aside>
    </div>
  )
}

function SidePanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SidePanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="side-panel-title"
      className={cn(
        "font-heading text-lg font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidePanelContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-content"
      className={cn(
        "flex-1 overflow-y-auto rounded-b-lg border-t p-4",
        className
      )}
      {...props}
    />
  )
}

export { SidePanel, SidePanelHeader, SidePanelTitle, SidePanelContent }
