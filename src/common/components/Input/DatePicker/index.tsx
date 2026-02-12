import { DatePickerSingle } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'

interface DatePickerInputProps {
  name: string
  label: string
  disabled?: boolean
  placeholder?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
}

type DatePickerFormValues = Record<string, string | number | Date | null | undefined>

const DatePickerInput = ({
  name,
  label,
  disabled,
  placeholder = 'เลือกวันที่',
  required,
  minDate,
  maxDate,
}: DatePickerInputProps) => {
  const { control } = useFormContext<DatePickerFormValues>()

  return (
    <Controller<DatePickerFormValues>
      control={control}
      name={name}
      rules={required ? { required: `${label} จำเป็นต้องเลือก` } : undefined}
      render={({ field, fieldState }) => {
        const rawValue = field.value
        const isSupportedType =
          typeof rawValue === 'string' ||
          typeof rawValue === 'number' ||
          rawValue instanceof Date ||
          rawValue == null
        const safeValue = isSupportedType ? rawValue : undefined
        const dateValue =
          safeValue != null && dayjs(safeValue).isValid() ? dayjs(safeValue).toDate() : undefined
        const errorMessage = fieldState.error?.message
        return (
          <div className="grid w-full gap-2">
            <Label htmlFor={`datepicker:${name}`}>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </Label>
            <DatePickerSingle
              id={`datepicker:${name}`}
              value={dateValue}
              onChange={value => {
                const iso = value != null ? dayjs(value).toISOString() : null
                field.onChange(iso)
              }}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full"
              minDate={minDate}
              maxDate={maxDate}
            />
            {errorMessage && <p className="text-xs text-destructive">{String(errorMessage)}</p>}
          </div>
        )
      }}
    />
  )
}

export default DatePickerInput
