import type {
  ExpressionOperator,
  FlowEdgeCondition,
} from "@workspace/shared/api/agent-config/types"

export const operatorLabels: Record<ExpressionOperator, string> = {
  greater_than: ">",
  greater_or_equal: ">=",
  less_than: "<",
  less_or_equal: "<=",
  equals: "=",
  not_equals: "!=",
  contains: "contains",
  not_contains: "not contains",
  exists: "exists",
  not_exists: "not exists",
}

const valuelessOperators = new Set<ExpressionOperator>(["exists", "not_exists"])

export function operatorNeedsValue(operator: ExpressionOperator) {
  return !valuelessOperators.has(operator)
}

export function formatConditionLabel(condition: FlowEdgeCondition): string {
  switch (condition.type) {
    case "prompt":
      return condition.prompt
    case "expression": {
      const joiner = condition.match === "all" ? " AND " : " OR "
      return condition.conditions
        .map((entry) =>
          operatorNeedsValue(entry.operator)
            ? `${entry.variable} ${operatorLabels[entry.operator]} ${entry.value ?? ""}`
            : `${entry.variable} ${operatorLabels[entry.operator]}`
        )
        .join(joiner)
    }
    case "always":
      return "Always"
  }
}
