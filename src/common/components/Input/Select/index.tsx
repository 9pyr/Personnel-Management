import { InputLabel } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import BaseSelect from '@mui/material/Select'

import { Controller, useFormContext } from 'react-hook-form'

interface SelectInputProps {
  name: string
  label: string
  options: { value: any; label: string }[]
}

const SelectInput = ({ name, label, options }: SelectInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel id={`select:${name}`}>{label}</InputLabel>
          <BaseSelect
            variant="filled"
            labelId={`select:${name}`}
            id={`select:${name}`}
            label={label}
            {...field}
          >
            {options.map(({ value, label }, index) => (
              <MenuItem key={`select-optins-${name}:${index}`} value={value}>
                {label}
              </MenuItem>
            ))}
          </BaseSelect>
        </FormControl>
      )}
    />
  )
}

export default SelectInput
