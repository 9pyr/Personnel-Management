import { Controller, useFormContext } from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

/** Form Select – ผูกกับ react-hook-form ใช้ shadcn Select (Radix) ทั้งหมด */

export interface SelectOption {
  value: string
  label: string
}

export interface SelectOptionGroup {
  groupLabel: string
  options: SelectOption[]
}

interface SelectInputProps {
  name: string
  label: string
  options: SelectOption[]
  optionGroups?: SelectOptionGroup[]
  disabled?: boolean
}

const SelectInput = ({ name, label, options, optionGroups, disabled }: SelectInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="grid w-full gap-2">
          <Label id={`select:${name}`}>{label}</Label>
          <Select
            disabled={disabled}
            value={field.value ?? ''}
            onValueChange={field.onChange}
          >
            <SelectTrigger id={`select:${name}`} aria-labelledby={`select:${name}`}>
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
              {optionGroups != null && optionGroups.length > 0
                ? optionGroups.map((group, gi) => (
                    <SelectGroup key={`group-${name}-${gi}`}>
                      <SelectLabel className="pl-2">{group.groupLabel}</SelectLabel>
                      {group.options.map((opt, oi) => (
                        <SelectItem key={`${name}-${gi}-${oi}`} value={opt.value} className="pl-6">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
                : options.map(({ value, label: optLabel }, index) => (
                    <SelectItem key={`select-options-${name}:${index}`} value={value}>
                      {optLabel}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  )
}

export default SelectInput
