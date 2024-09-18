import { FilledTextFieldProps, TextField } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

interface TextInputProps extends Omit<FilledTextFieldProps, 'variant'> {
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
        <TextField label={label} {...field} {...props} variant="filled" fullWidth />
      )}
    />
  )
}

export default TextInput
