import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'

import { DatePickerSingle } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

interface DatePickerInputProps {
  name: string
  label: string
  disabled?: boolean
  placeholder?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
}

const DatePickerInput = ({
  name,
  label,
  disabled,
  placeholder = 'เลือกวันที่',
  required,
  minDate,
  maxDate,
}: DatePickerInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} จำเป็นต้องเลือก` } : undefined}
      render={({ field, fieldState }) => {
        const value = field.value
        const dateValue =
          value && dayjs(value).isValid() ? dayjs(value).toDate() : undefined
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
              onChange={d => {
                field.onChange(d ? dayjs(d).toISOString() : null)
              }}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full"
              minDate={minDate}
              maxDate={maxDate}
            />
            {errorMessage && (
              <p className="text-xs text-destructive">{String(errorMessage)}</p>
            )}
          </div>
        )
      }}
    />
  )
}

export default DatePickerInput
