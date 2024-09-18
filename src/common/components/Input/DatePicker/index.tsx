import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  DatePicker as BaseDatePicker,
  DatePickerProps as BaseDatePickerProps,
} from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import dayjs from 'dayjs'
import { Controller, useFormContext } from 'react-hook-form'

interface DatePickerInputProps extends BaseDatePickerProps<any> {
  name: string
  label: string
}

const DatePickerInput = ({ name, label, ...props }: DatePickerInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const { value, onChange } = field
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BaseDatePicker
              label={label}
              {...field}
              value={dayjs(value)}
              onChange={value => onChange(dayjs(value).toDate())}
              {...props}
              format="DD-MM-YYYY"
              className="w-full"
            />
          </LocalizationProvider>
        )
      }}
    />
  )
}

export default DatePickerInput
