import { llm, voice } from "@livekit/agents"

import { FLOW_INSTRUCTIONS } from "@/flow/prompts"
import type { FlowConversationNode, FlowGraph, FlowNode } from "@/flow/types"
import { endCall } from "@/lib/end-call"

function buildNodeInstructions(graph: FlowGraph, node: FlowConversationNode) {
  let nodeInstructions = ""

  if (graph.globalPrompt) {
    nodeInstructions += graph.globalPrompt + "\n\n"
  }

  nodeInstructions += FLOW_INSTRUCTIONS

  if (node.instructions.type === "prompt") {
    nodeInstructions += "\n\n" + node.instructions.text
  }

  return nodeInstructions
}

export class FlowAgent extends voice.Agent {
  private readonly graph: FlowGraph

  constructor(graph: FlowGraph) {
    super({
      instructions: buildNodeInstructions(graph, graph.startNode),
    })

    this.graph = graph
    this._tools = this._buildNodeTools(graph.startNode)
  }

  private _buildNodeTools(node: FlowConversationNode): llm.ToolContext {
    return Object.fromEntries(
      node.outgoingEdges.map((edge) => [
        edge.transitionToolName,
        llm.tool({
          description: `Transition to "${edge.targetNode.name}" when: ${edge.condition}`,
          execute: async () => {
            await this._transitionTo(edge.targetNode)
            return `Transitioned to "${edge.targetNode.name}"`
          },
        }),
      ])
    )
  }

  private async _transitionTo(node: FlowNode) {
    if (node.type === "conversation") {
      this._instructions = buildNodeInstructions(this.graph, node)
      await this.updateTools(this._buildNodeTools(node))

      if (node.instructions.type === "say") {
        await this.session.say(node.instructions.text)
      }
    } else if (node.type === "end") {
      await endCall()
      return
    }
  }

  override async onEnter() {
    const startNode = this.graph.startNode

    if (startNode.startSpeaker === "agent") {
      if (startNode.instructions.type === "say") {
        await this.session.say(startNode.instructions.text)
      } else {
        await this.session.generateReply()
      }
    }
  }
}
