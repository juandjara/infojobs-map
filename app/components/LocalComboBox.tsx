import { useMemo, useState } from "react"
import type { ComboBoxProps } from "./ComboBox"
import ComboBox from "./ComboBox"

type LocalComboBoxProps<T> = Pick<
  ComboBoxProps<T>,
  'icon' | 'options' | 'labelKey' | 'valueKey' | 'name' | 'value' | 'onSelect' | 'placeholder'
>

export function LocalComboBox<T>(props: LocalComboBoxProps<T>) {
  const [query, setQuery] = useState('')
  const filteredOptions = useMemo(() => {
    const labelKey = props.labelKey || 'label' as keyof T
    return (props.options).filter(t => {
      if (!query) return true
      return (t[labelKey] as string || '').toLowerCase().includes(query.trim().toLowerCase())
    })
  }, [query, props.options, props.labelKey])

  return (
    <ComboBox<T>
      {...props}
      name={props.name}
      options={filteredOptions}
      onSearch={setQuery}
    />
  )
}