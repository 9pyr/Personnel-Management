import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Controller, useFormContext } from 'react-hook-form'

/** Base select component ที่ wrap shadcn ใช้ซ้ำได้ทั้งในฟอร์ม (react-hook-form) และนอกฟอร์ม */

export interface SelectOption {
  value: string
  label: string
}

export interface SelectOptionGroup {
  groupLabel: string
  options: SelectOption[]
}

export interface SelectBaseProps {
  id?: string
  ariaLabel?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  optionGroups?: SelectOptionGroup[]
  disabled?: boolean
  className?: string
}

export function SelectBase({
  id,
  ariaLabel,
  placeholder,
  value,
  onChange,
  options,
  optionGroups,
  disabled,
  className,
}: SelectBaseProps) {
  const safeOptions = (opts: SelectOption[]) => opts.filter(opt => opt.value !== '')
  const safeGroupOptions = (opts: SelectOption[]) => opts.filter(opt => opt.value !== '')

  return (
    <Select disabled={disabled} value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {optionGroups != null && optionGroups.length > 0
          ? optionGroups.map((group, groupIndex) => (
              <SelectGroup key={`select-group-${id ?? ''}-${groupIndex}`}>
                <SelectLabel className="pl-2">{group.groupLabel}</SelectLabel>
                {safeGroupOptions(group.options).map((option, optionIndex) => (
                  <SelectItem
                    key={`select-option-${id ?? ''}-${groupIndex}-${optionIndex}`}
                    value={option.value}
                    className="pl-6"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          : safeOptions(options).map((option, optionIndex) => (
              <SelectItem key={`select-option-${id ?? ''}-${optionIndex}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  )
}

interface SelectInputProps {
  name: string
  label: string
  options: SelectOption[]
  optionGroups?: SelectOptionGroup[]
  disabled?: boolean
  required?: boolean
}

const SelectInput = ({
  name,
  label,
  options,
  optionGroups,
  disabled,
  required,
}: SelectInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} จำเป็นต้องเลือก` } : undefined}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message
        return (
          <div className="grid w-full gap-2">
            <Label id={`select:${name}`}>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </Label>
            <SelectBase
              id={`select:${name}`}
              ariaLabel={label}
              placeholder={label}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              options={options}
              optionGroups={optionGroups}
              disabled={disabled}
            />
            {errorMessage && <p className="text-xs text-destructive">{String(errorMessage)}</p>}
          </div>
        )
      }}
    />
  )
}

export default SelectInput
