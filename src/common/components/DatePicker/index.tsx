import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  DatePicker as BaseDatePicker,
  DatePickerProps as BaseDatePickerProps,
} from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import { Controller, useFormContext } from 'react-hook-form'

interface DatePickerProps extends BaseDatePickerProps<any> {
  name: string
  label: string
}

const DatePicker = ({ name, label, ...props }: DatePickerProps) => {
  const { control } = useFormContext()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BaseDatePicker
            label={label}
            {...field}
            {...props}
            format="DD-MM-YYYY"
            className="w-full"
          />
        </LocalizationProvider>
      )}
    />
  )
}

export default DatePicker
