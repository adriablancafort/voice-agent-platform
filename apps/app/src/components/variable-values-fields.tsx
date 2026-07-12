import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import type { VariableValues } from "@/hooks/use-variable-values"

type VariableValuesFieldsProps = {
  variables: VariableValues
  className?: string
  readOnly?: boolean
}

export function VariableValuesFields({
  variables,
  className,
  readOnly = false,
}: VariableValuesFieldsProps) {
  if (variables.keys.length === 0) {
    return null
  }

  return (
    <FieldGroup className={className}>
      {variables.keys.map((key) => (
        <Field key={key}>
          <FieldLabel>{key}</FieldLabel>
          <Input
            value={variables.values[key] ?? ""}
            onChange={(event) => variables.setValue(key, event.target.value)}
            placeholder={`Value for {{${key}}}`}
            readOnly={readOnly}
          />
        </Field>
      ))}
    </FieldGroup>
  )
}
