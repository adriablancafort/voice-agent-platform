import {
  type AgentState,
  type ReceivedMessage,
} from "@livekit/components-react"
import { AnimatePresence } from "motion/react"
import { type ComponentProps } from "react"

import { AgentChatIndicator } from "@workspace/ui/components/agents-ui/agent-chat-indicator"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@workspace/ui/components/ai-elements/message"

function getMessageSpacingClass(
  index: number,
  messageOrigin: "user" | "assistant",
  messages: ReceivedMessage[]
) {
  const next = messages[index + 1]
  if (!next) return "mb-5"

  const nextOrigin = next.from?.isLocal ? "user" : "assistant"
  return nextOrigin === messageOrigin ? "mb-2" : "mb-5"
}

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<"div"> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[]
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string
  /**
   * Initial scroll behavior.
   */
  initial?: ComponentProps<typeof Conversation>["initial"]
}

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent className="gap-0">
        {messages.map((receivedMessage, index) => {
          const { id, timestamp, from, message } = receivedMessage
          const time = new Date(timestamp)
          const messageOrigin = from?.isLocal ? "user" : "assistant"
          const locale =
            typeof navigator !== "undefined" ? navigator.language : "en-US"
          const title = time.toLocaleTimeString(locale, { timeStyle: "full" })

          return (
            <Message
              key={id}
              title={title}
              from={messageOrigin}
              className={getMessageSpacingClass(index, messageOrigin, messages)}
            >
              <MessageContent>
                <MessageResponse>{message}</MessageResponse>
              </MessageContent>
            </Message>
          )
        })}
        <AnimatePresence>
          {agentState === "thinking" && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
