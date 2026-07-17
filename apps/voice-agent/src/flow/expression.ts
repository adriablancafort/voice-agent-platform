import type {
  ExpressionCondition,
  ExpressionOperator,
  FlowEdgeCondition,
} from "@workspace/shared/api/agent-config/types"
import type { Variables } from "@/flow/variables"

type ExpressionEdgeCondition = Extract<
  FlowEdgeCondition,
  { type: "expression" }
>

function compareNumbers(
  operator: ExpressionOperator,
  variable: string | undefined,
  value: string
): boolean {
  const left = Number(variable)
  const right = Number(value)

  if (Number.isNaN(left) || Number.isNaN(right)) {
    return false
  }

  switch (operator) {
    case "greater_than":
      return left > right
    case "greater_or_equal":
      return left >= right
    case "less_than":
      return left < right
    case "less_or_equal":
      return left <= right
    default:
      return false
  }
}

function evaluateCondition(
  condition: ExpressionCondition,
  variables: Variables
): boolean {
  const variable = variables.get(condition.variable)
  const value = condition.value ?? ""

  switch (condition.operator) {
    case "exists":
      return variable !== undefined
    case "not_exists":
      return variable === undefined
    case "equals":
      return variable === value
    case "not_equals":
      return variable !== value
    case "contains":
      return variable?.includes(value) ?? false
    case "not_contains":
      return !variable?.includes(value)
    default:
      return compareNumbers(condition.operator, variable, value)
  }
}

export function evaluateExpression(
  condition: ExpressionEdgeCondition,
  variables: Variables
): boolean {
  if (condition.match === "all") {
    return condition.conditions.every((entry) =>
      evaluateCondition(entry, variables)
    )
  }

  return condition.conditions.some((entry) =>
    evaluateCondition(entry, variables)
  )
}
