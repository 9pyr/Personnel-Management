import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'

import { DatePickerSingle } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

interface DatePickerInputProps {
  name: string
  label: string
  disabled?: boolean
  placeholder?: string
}

const DatePickerInput = ({
  name,
  label,
  disabled,
  placeholder = 'เลือกวันที่',
}: DatePickerInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value
        const dateValue =
          value && dayjs(value).isValid() ? dayjs(value).toDate() : undefined
        return (
          <div className="grid w-full gap-2">
            <Label htmlFor={`datepicker:${name}`}>{label}</Label>
            <DatePickerSingle
              id={`datepicker:${name}`}
              value={dateValue}
              onChange={d => {
                field.onChange(d ? dayjs(d).toISOString() : null)
              }}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full"
            />
          </div>
        )
      }}
    />
  )
}

export default DatePickerInput
