import { XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

type FlowSidePanelBaseProps = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export function FlowSidePanelBase({
  open,
  title,
  children,
  onClose,
}: FlowSidePanelBaseProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <aside
        data-state={open ? "open" : "closed"}
        aria-hidden={!open}
        className="pointer-events-auto fixed top-18 right-3 bottom-3 flex w-95 max-w-full flex-col rounded-lg border bg-popover text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[state=closed]:pointer-events-none data-[state=closed]:translate-x-10 data-[state=closed]:opacity-0 data-[state=open]:translate-x-0 data-[state=open]:opacity-100"
      >
        <div className="flex flex-col gap-1.5 p-4">
          <h2 className="font-heading text-lg font-medium text-foreground">
            {title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto rounded-b-lg border-t p-4">
          {children}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-3.5 right-3.5"
          onClick={onClose}
        >
          <XIcon />
          <span className="sr-only">Close side panel</span>
        </Button>
      </aside>
    </div>
  )
}
