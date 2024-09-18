import { OutlinedTextFieldProps, TextField } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

interface TextInputProps extends Omit<OutlinedTextFieldProps, 'variant'> {
  name: string
  label: string
}

const TextInput = ({ name, label, ...props }: TextInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField label={label} {...field} {...props} variant="outlined" fullWidth />
      )}
    />
  )
}

export default TextInput
